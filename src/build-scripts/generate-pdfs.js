#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

// PDF generation configuration
const PDF_CONFIG = {
  report: {
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <style>
        #header { font-size: 10px; color: #666; width: 100%; text-align: center; }
      </style>
      <div id="header">
        <span class="title"></span>
      </div>
    `,
    footerTemplate: `
      <style>
        #footer { font-size: 10px; color: #666; width: 100%; text-align: center; }
      </style>
      <div id="footer">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
    printBackground: true,
    preferCSSPageSize: false
  },
  dashboard: {
    format: 'A3',
    landscape: true,
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    displayHeaderFooter: false,
    printBackground: true,
    preferCSSPageSize: true
  },
  article: {
    format: 'Letter',
    margin: { top: '2.5cm', right: '2.5cm', bottom: '2.5cm', left: '2.5cm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <style>
        #footer { font-size: 10px; color: #666; width: 100%; padding: 0 2.5cm; display: flex; justify-content: space-between; }
      </style>
      <div id="footer">
        <span class="date"></span>
        <span class="pageNumber"></span>
      </div>
    `,
    printBackground: true
  }
};

// Generate PDF from HTML file
async function generatePDF(htmlPath, outputPath, contentType = 'report', metadata = {}) {
  console.log(`Generating PDF: ${basename(outputPath)}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2
    });
    
    // Navigate to the HTML file
    await page.goto(`file://${htmlPath}`, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Inject print-specific CSS
    await page.addStyleTag({
      content: `
        /* PDF-specific overrides */
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .no-print,
          .site-header,
          .site-footer,
          .report-actions,
          .viz-controls,
          .interactive-controls {
            display: none !important;
          }
          
          /* Ensure visualizations fit on page */
          .viz-container {
            max-height: 600px;
            page-break-inside: avoid;
          }
          
          svg {
            max-width: 100% !important;
            height: auto !important;
          }
          
          /* Fix table layouts */
          table {
            page-break-inside: avoid;
          }
          
          /* Academic formatting */
          .report-header {
            text-align: center;
            page-break-after: avoid;
          }
          
          /* Show DOI for print */
          .doi-badge-print {
            display: block !important;
            text-align: right;
            margin-top: 1cm;
          }
        }
        
        /* Add PDF export class */
        body.pdf-export .no-print {
          display: none !important;
        }
      `
    });
    
    // Add PDF export class to body
    await page.evaluate(() => {
      document.body.classList.add('pdf-export');
    });
    
    // Wait for all visualizations to render
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for all Observable visualizations
        const checkViz = () => {
          const vizContainers = document.querySelectorAll('.viz-mount-point');
          const allLoaded = Array.from(vizContainers).every(container => {
            return container.querySelector('svg') || container.querySelector('.static-viz-fallback');
          });
          
          if (allLoaded) {
            resolve();
          } else {
            setTimeout(checkViz, 500);
          }
        };
        
        // Start checking after a delay
        setTimeout(checkViz, 2000);
      });
    });
    
    // Additional wait for any animations
    await page.waitForTimeout(1000);
    
    // Get PDF configuration based on content type
    const pdfConfig = PDF_CONFIG[contentType] || PDF_CONFIG.report;
    
    // Generate PDF
    const pdf = await page.pdf({
      path: outputPath,
      ...pdfConfig
    });
    
    console.log(`✓ Generated PDF: ${basename(outputPath)}`);
    return { success: true, path: outputPath };
    
  } catch (error) {
    console.error(`✗ Error generating PDF for ${htmlPath}:`, error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Process all content files and generate PDFs
async function processAllContent() {
  console.log('Starting PDF generation...\n');
  
  // Ensure output directory exists
  const pdfOutputDir = join(rootDir, 'dist', 'pdfs');
  await mkdir(pdfOutputDir, { recursive: true });
  
  // Get all HTML files from dist
  const distDir = join(rootDir, 'dist');
  const results = [];
  
  // Process different content types
  const contentTypes = [
    { dir: 'reports', type: 'report' },
    { dir: 'dashboards', type: 'dashboard' },
    { dir: 'news', type: 'article' }
  ];
  
  for (const { dir, type } of contentTypes) {
    const contentDir = join(distDir, dir);
    
    try {
      const files = await readdir(contentDir);
      const htmlFiles = files.filter(f => f.endsWith('.html'));
      
      for (const file of htmlFiles) {
        const htmlPath = join(contentDir, file);
        
        // Check if corresponding markdown file has pdf: true
        const mdPath = join(rootDir, 'src', dir, file.replace('.html', '.md'));
        
        try {
          const mdContent = await readFile(mdPath, 'utf-8');
          const { data } = matter(mdContent);
          
          if (data.pdf) {
            const pdfName = file.replace('.html', '.pdf');
            const pdfPath = join(pdfOutputDir, pdfName);
            
            const result = await generatePDF(htmlPath, pdfPath, type, data);
            results.push({
              source: file,
              output: pdfName,
              type,
              ...result
            });
            
            // Update metadata file with PDF URL
            if (result.success) {
              const metadataPath = join(distDir, '_metadata', dir, file.replace('.html', '.json'));
              try {
                const metadata = JSON.parse(await readFile(metadataPath, 'utf-8'));
                metadata.pdf_url = `/pdfs/${pdfName}`;
                await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
              } catch (e) {
                // Metadata file might not exist yet
              }
            }
          }
        } catch (error) {
          console.error(`Error processing ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }
  
  // Generate summary report
  const summary = {
    generated: new Date().toISOString(),
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    files: results
  };
  
  const summaryPath = join(pdfOutputDir, '_summary.json');
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`\nPDF Generation Complete!`);
  console.log(`Total: ${summary.total}`);
  console.log(`Successful: ${summary.successful}`);
  console.log(`Failed: ${summary.failed}`);
  
  if (summary.failed > 0) {
    console.log('\nFailed PDFs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.source}: ${r.error}`);
    });
  }
}

// Create a test HTML file if needed
async function createTestHTML() {
  const testHTMLPath = join(rootDir, 'dist', 'reports', 'test-report.html');
  const testHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Report</title>
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/print.css" media="print">
</head>
<body>
  <article class="report">
    <div class="container">
      <header class="report-header">
        <h1>Test Report for PDF Generation</h1>
        <div class="authors">
          <span class="author">Dr. Test Author</span>
        </div>
        <time>January 30, 2024</time>
        <div class="doi-badge-print" style="display: none;">DOI: 10.1234/test-doi</div>
      </header>
      
      <section class="abstract">
        <h2>Abstract</h2>
        <p>This is a test document for PDF generation with Observable Framework.</p>
      </section>
      
      <main class="report-content">
        <h2>Introduction</h2>
        <p>This document tests the PDF generation capabilities of our unified static architecture.</p>
        
        <h2>Data Visualization</h2>
        <figure class="viz-container">
          <svg viewBox="0 0 640 400" style="width: 100%; height: auto;">
            <rect x="50" y="50" width="540" height="300" fill="#e6f7f7" stroke="#319795" stroke-width="2"/>
            <text x="320" y="200" text-anchor="middle" font-size="20" fill="#2c7a7b">Test Visualization</text>
          </svg>
          <figcaption>Figure 1: Example static visualization</figcaption>
        </figure>
        
        <h2>Conclusion</h2>
        <p>The PDF generation system successfully converts HTML documents with visualizations to high-quality PDFs.</p>
      </main>
    </div>
  </article>
</body>
</html>
`;
  
  await mkdir(dirname(testHTMLPath), { recursive: true });
  await writeFile(testHTMLPath, testHTML);
  console.log('Created test HTML file');
}

// Main execution
async function main() {
  try {
    // Create test file if needed
    await createTestHTML();
    
    // Process all content
    await processAllContent();
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
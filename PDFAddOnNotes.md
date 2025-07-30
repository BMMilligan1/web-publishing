# Question from user: 
 I have an observable framework (https://github.com/observablehq/framework) project repository with a bunch of markdown files, which include code that renders high quality d3 style visualisations. How could I add on functionality to "print" these to PDF with custom styling? I can easily render the visualisations to html locally (observable framework does this automatically) - walk me through step by step how I would then render that "dist" collection of files into custom styled PDF


# Response from Claude
Perfect! Since you already have the rendered HTML files in your `dist` directory, this is much simpler. Here's the step-by-step process to convert those static HTML files to custom-styled PDFs:

## Step 1: Set Up Your Project Structure

```
your-observable-project/
├── dist/                    # Observable Framework output
│   ├── index.html
│   ├── dashboard.html
│   ├── analysis.html
│   └── _observablehq/      # Framework assets
├── pdf-config/
│   ├── styles.css          # Custom PDF styles
│   └── config.json         # PDF configuration
├── scripts/
│   └── html-to-pdf.js      # Conversion script
└── package.json
```

## Step 2: Install Dependencies

```bash
npm init -y  # if you don't have package.json
npm install puppeteer glob
```

## Step 3: Create Custom PDF Styles

**pdf-config/styles.css:**
```css
/* PDF-specific styling */
@page {
  size: A4;
  margin: 20mm 15mm;
  
  @top-center {
    content: "Data Analysis Report";
    font-size: 12px;
    color: #666;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5mm;
  }
  
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-size: 10px;
    color: #666;
  }
}

/* Hide Observable Framework UI elements */
.observablehq-header,
.observablehq-footer, 
.observablehq-sidebar,
.observablehq-toc,
.observablehq-theme-toggle {
  display: none !important;
}

/* Optimize main content for print */
.observablehq-main {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Typography improvements */
body {
  font-family: 'Charter', 'Georgia', serif;
  line-height: 1.6;
  color: #333;
  background: white !important;
}

h1 {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
  page-break-after: avoid;
}

h2 {
  color: #34495e;
  border-left: 4px solid #3498db;
  padding-left: 15px;
  margin-top: 30px;
  page-break-after: avoid;
}

/* Visualization optimizations */
svg {
  max-width: 100% !important;
  height: auto !important;
  page-break-inside: avoid;
}

/* Ensure D3 visualizations print well */
.observablehq svg text {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  fill: #333 !important;
}

/* Chart containers */
.observablehq figure {
  page-break-inside: avoid;
  margin: 20px 0;
}

/* Code blocks */
pre {
  background: #f8f9fa !important;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  page-break-inside: avoid;
  font-size: 0.9em;
}

/* Tables */
table {
  border-collapse: collapse;
  width: 100%;
  page-break-inside: avoid;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

/* Force page breaks */
.page-break {
  page-break-before: always;
}

.no-break {
  page-break-inside: avoid;
}

/* Print-specific display */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}
```

## Step 4: Create PDF Configuration

**pdf-config/config.json:**
```json
{
  "defaultOptions": {
    "format": "A4",
    "margin": {
      "top": "20mm",
      "right": "15mm", 
      "bottom": "20mm",
      "left": "15mm"
    },
    "printBackground": true,
    "preferCSSPageSize": true,
    "displayHeaderFooter": false
  },
  "pageSpecificOptions": {
    "dashboard": {
      "format": "A3",
      "landscape": true,
      "margin": {
        "top": "15mm",
        "right": "15mm",
        "bottom": "15mm", 
        "left": "15mm"
      }
    },
    "charts": {
      "format": "A4",
      "landscape": true
    }
  },
  "excludeFiles": [
    "_observablehq",
    "404.html"
  ]
}
```

## Step 5: Create the Conversion Script

**scripts/html-to-pdf.js:**
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

class HTMLToPDFConverter {
  constructor(distDir = 'dist', outputDir = 'pdfs', configDir = 'pdf-config') {
    this.distDir = distDir;
    this.outputDir = outputDir;
    this.configDir = configDir;
    this.config = null;
    this.customCSS = null;
  }

  async init() {
    // Load configuration
    const configPath = path.join(this.configDir, 'config.json');
    this.config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    
    // Load custom CSS
    const cssPath = path.join(this.configDir, 'styles.css');
    this.customCSS = await fs.readFile(cssPath, 'utf8');
    
    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });
    
    console.log('✅ PDF converter initialized');
  }

  async findHTMLFiles() {
    const pattern = path.join(this.distDir, '**/*.html');
    const files = await glob(pattern);
    
    // Filter out excluded files
    return files.filter(file => {
      const relativePath = path.relative(this.distDir, file);
      return !this.config.excludeFiles.some(exclude => 
        relativePath.includes(exclude)
      );
    });
  }

  getPageConfig(filePath) {
    const fileName = path.basename(filePath, '.html');
    const pageConfig = this.config.pageSpecificOptions[fileName];
    
    return {
      ...this.config.defaultOptions,
      ...pageConfig
    };
  }

  async convertFile(browser, filePath) {
    const page = await browser.newPage();
    
    try {
      console.log(`🔄 Converting: ${filePath}`);
      
      // Read the HTML file
      const htmlContent = await fs.readFile(filePath, 'utf8');
      
      // Inject custom CSS
      const modifiedHTML = htmlContent.replace(
        '</head>',
        `<style>${this.customCSS}</style></head>`
      );
      
      // Set the HTML content
      await page.setContent(modifiedHTML, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for any remaining async content (D3 animations, etc.)
      await page.waitForTimeout(2000);
      
      // Wait for all SVGs to be populated
      await page.waitForFunction(() => {
        const svgs = document.querySelectorAll('svg');
        return Array.from(svgs).every(svg => 
          svg.children.length > 0 || svg.hasAttribute('data-rendered')
        );
      }, { timeout: 10000 }).catch(() => {
        console.warn(`⚠️  SVG wait timeout for ${filePath}`);
      });
      
      // Get page-specific configuration
      const pageConfig = this.getPageConfig(filePath);
      
      // Generate output path
      const relativePath = path.relative(this.distDir, filePath);
      const outputPath = path.join(
        this.outputDir, 
        relativePath.replace('.html', '.pdf')
      );
      
      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      
      // Generate PDF
      await page.pdf({
        path: outputPath,
        ...pageConfig
      });
      
      console.log(`✅ Generated: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Failed to convert ${filePath}:`, error.message);
    } finally {
      await page.close();
    }
  }

  async convertAll() {
    await this.init();
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--font-render-hinting=none'  // Better font rendering
      ]
    });

    try {
      const htmlFiles = await this.findHTMLFiles();
      console.log(`📄 Found ${htmlFiles.length} HTML files to convert`);
      
      // Convert files one by one (or implement parallel processing)
      for (const file of htmlFiles) {
        await this.convertFile(browser, file);
      }
      
      console.log(`🎉 Successfully converted ${htmlFiles.length} files to PDF`);
      
    } finally {
      await browser.close();
    }
  }
}

// Run the converter
const converter = new HTMLToPDFConverter();
converter.convertAll().catch(console.error);
```

## Step 6: Add NPM Scripts

**package.json:**
```json
{
  "scripts": {
    "build": "observable build",
    "pdf:convert": "node scripts/html-to-pdf.js",
    "pdf:build": "npm run build && npm run pdf:convert",
    "pdf:watch": "nodemon --watch src --ext md,js --exec \"npm run pdf:build\""
  },
  "devDependencies": {
    "puppeteer": "^21.0.0",
    "glob": "^10.0.0",
    "nodemon": "^3.0.0"
  }
}
```

## Step 7: Run the Conversion

```bash
# Build your Observable site (if needed)
npm run build

# Convert HTML files to PDF
npm run pdf:convert

# Or do both in one command
npm run pdf:build
```

## Step 8: Advanced Options

**Parallel Processing** (for faster conversion):

```javascript
// Add this method to the HTMLToPDFConverter class
async convertAllParallel(concurrency = 3) {
  await this.init();
  
  const htmlFiles = await this.findHTMLFiles();
  const chunks = [];
  
  // Split files into chunks for parallel processing
  for (let i = 0; i < htmlFiles.length; i += concurrency) {
    chunks.push(htmlFiles.slice(i, i + concurrency));
  }
  
  for (const chunk of chunks) {
    const browsers = await Promise.all(
      chunk.map(() => puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }))
    );
    
    try {
      await Promise.all(
        chunk.map((file, index) => 
          this.convertFile(browsers[index], file)
        )
      );
    } finally {
      await Promise.all(browsers.map(browser => browser.close()));
    }
  }
}
```

**Custom Page Layouts** per file type:

```javascript
// Add specific handling in getPageConfig method
getPageConfig(filePath) {
  const fileName = path.basename(filePath, '.html');
  
  // Special handling for different page types
  if (fileName.includes('dashboard')) {
    return { ...this.config.defaultOptions, format: 'A3', landscape: true };
  }
  
  if (fileName.includes('chart')) {
    return { ...this.config.defaultOptions, landscape: true };
  }
  
  return this.config.defaultOptions;
}
```

## Step 9: Test and Verify

```bash
# Convert and check output
npm run pdf:convert

# Check the generated PDFs
ls -la pdfs/
```

Your `pdfs/` directory will now contain PDF versions of all your HTML files with custom styling, preserving all the D3 visualizations exactly as they appear in the browser.
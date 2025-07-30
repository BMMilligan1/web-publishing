#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

// Update HTML files with DOI information
async function updateHTMLWithDOI(htmlPath, doi) {
  try {
    let content = await readFile(htmlPath, 'utf-8');
    
    // Update DOI meta tag
    content = content.replace(
      /<meta name="citation_doi" content="[^"]*">/,
      `<meta name="citation_doi" content="${doi}">`
    );
    
    // Update DOI badge
    content = content.replace(
      /DOI: [^<]*/g,
      `DOI: ${doi}`
    );
    
    // Update DOI link
    content = content.replace(
      /href="https:\/\/doi\.org\/[^"]*"/g,
      `href="https://doi.org/${doi}"`
    );
    
    await writeFile(htmlPath, content);
    return true;
  } catch (error) {
    console.error(`Error updating HTML: ${error.message}`);
    return false;
  }
}

// Update all references to DOIs
async function updateAllDOIReferences() {
  console.log('Updating DOI references across the site...\n');
  
  const updates = [];
  
  // Read DOI summary if it exists
  let doiMapping = {};
  try {
    const summaryPath = join(rootDir, 'dist', '_dois', 'summary.json');
    const summary = JSON.parse(await readFile(summaryPath, 'utf-8'));
    
    // Create mapping of files to DOIs
    summary.dois.forEach(item => {
      if (item.success && item.doi) {
        const key = item.file.replace('.md', '');
        doiMapping[key] = item.doi;
      }
    });
  } catch (error) {
    console.log('No DOI summary found, checking markdown files directly...');
  }
  
  // Also check markdown files for DOIs
  const contentDirs = ['reports', 'dashboards', 'news'];
  
  for (const dir of contentDirs) {
    const srcDir = join(rootDir, 'src', dir);
    
    try {
      const files = await readdir(srcDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      for (const file of mdFiles) {
        const filePath = join(srcDir, file);
        const content = await readFile(filePath, 'utf-8');
        const { data } = matter(content);
        
        if (data.doi && data.doi !== true) {
          // DOI exists in frontmatter
          const key = file.replace('.md', '');
          doiMapping[key] = data.doi;
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }
  
  // Update HTML files in dist
  console.log('Updating HTML files with DOIs...');
  
  for (const [filename, doi] of Object.entries(doiMapping)) {
    // Try different possible locations
    const possiblePaths = [
      join(rootDir, 'dist', 'reports', `${filename}.html`),
      join(rootDir, 'dist', 'dashboards', `${filename}.html`),
      join(rootDir, 'dist', 'news', `${filename}.html`)
    ];
    
    for (const htmlPath of possiblePaths) {
      try {
        await readFile(htmlPath); // Check if file exists
        const updated = await updateHTMLWithDOI(htmlPath, doi);
        
        if (updated) {
          console.log(`✓ Updated ${filename}.html with DOI: ${doi}`);
          updates.push({
            file: `${filename}.html`,
            doi,
            success: true
          });
        }
        break; // Found the file, no need to check other paths
      } catch (error) {
        // File doesn't exist at this path, try next
      }
    }
  }
  
  // Update any JSON metadata files
  console.log('\nUpdating metadata files...');
  
  const metadataDir = join(rootDir, 'dist', '_metadata');
  for (const dir of contentDirs) {
    const dirPath = join(metadataDir, dir);
    
    try {
      const files = await readdir(dirPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const key = file.replace('.json', '');
        if (doiMapping[key]) {
          const filePath = join(dirPath, file);
          const metadata = JSON.parse(await readFile(filePath, 'utf-8'));
          metadata.doi = doiMapping[key];
          await writeFile(filePath, JSON.stringify(metadata, null, 2));
          
          console.log(`✓ Updated metadata: ${file}`);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }
  
  // Generate update summary
  const updateSummary = {
    updated: new Date().toISOString(),
    total_dois: Object.keys(doiMapping).length,
    updated_files: updates.length,
    doi_mapping: doiMapping
  };
  
  const summaryPath = join(rootDir, 'dist', '_dois', 'update-summary.json');
  await mkdir(dirname(summaryPath), { recursive: true });
  await writeFile(summaryPath, JSON.stringify(updateSummary, null, 2));
  
  console.log(`\nDOI Update Complete!`);
  console.log(`Total DOIs: ${updateSummary.total_dois}`);
  console.log(`Updated files: ${updateSummary.updated_files}`);
}

// Main execution
async function main() {
  try {
    await updateAllDOIReferences();
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
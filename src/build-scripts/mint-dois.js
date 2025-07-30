#!/usr/bin/env node

import axios from 'axios';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

// Zenodo API configuration
const ZENODO_API = 'https://zenodo.org/api';
const ZENODO_TOKEN = process.env.ZENODO_TOKEN;

if (!ZENODO_TOKEN) {
  console.error('Error: ZENODO_TOKEN not found in environment variables');
  console.error('Please set ZENODO_TOKEN in your .env file or as a GitHub secret');
  process.exit(1);
}

// Create headers for Zenodo API
const headers = {
  'Authorization': `Bearer ${ZENODO_TOKEN}`,
  'Content-Type': 'application/json'
};

// Create a new deposition on Zenodo
async function createDeposition() {
  try {
    const response = await axios.post(
      `${ZENODO_API}/deposit/depositions`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating deposition:', error.response?.data || error.message);
    throw error;
  }
}

// Upload PDF file to deposition using the new bucket API
async function uploadFile(deposition, filePath, fileName) {
  try {
    const fileContent = await readFile(filePath);
    
    // Extract bucket URL from deposition response
    const bucketUrl = deposition.links.bucket;
    
    // Upload directly to bucket with filename
    const response = await axios.put(
      `${bucketUrl}/${fileName}`,
      fileContent,
      {
        headers: {
          'Authorization': `Bearer ${ZENODO_TOKEN}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
    throw error;
  }
}

// Update deposition metadata
async function updateMetadata(depositionId, metadata) {
  try {
    const zenodoMetadata = {
      metadata: {
        title: metadata.title,
        publication_type: 'report',
        description: metadata.abstract || metadata.excerpt || 'No description provided',
        creators: metadata.authors?.map(author => ({
          name: author.name || author,
          orcid: author.orcid
        })) || [{ name: 'Unknown Author' }],
        keywords: metadata.tags || [],
        publication_date: metadata.date || new Date().toISOString().split('T')[0],
        access_right: 'open',
        license: 'cc-by-4.0',
        language: 'eng',
        communities: [
          { identifier: 'zenodo' }
        ],
        related_identifiers: metadata.related_identifiers || [],
        grants: metadata.grants || []
      }
    };
    
    const response = await axios.put(
      `${ZENODO_API}/deposit/depositions/${depositionId}`,
      zenodoMetadata,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating metadata:', error.response?.data || error.message);
    throw error;
  }
}

// Publish deposition to get DOI
async function publishDeposition(depositionId) {
  try {
    const response = await axios.post(
      `${ZENODO_API}/deposit/depositions/${depositionId}/actions/publish`,
      {},
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error publishing deposition:', error.response?.data || error.message);
    throw error;
  }
}

// Process a single report and mint DOI
async function mintDOI(mdPath, pdfPath, metadata) {
  console.log(`\nMinting DOI for: ${basename(mdPath)}`);
  
  try {
    // Step 1: Create deposition
    console.log('  1. Creating Zenodo deposition...');
    const deposition = await createDeposition();
    const depositionId = deposition.id;
    console.log(`     ✓ Deposition created: ${depositionId}`);
    
    // Step 2: Upload PDF
    console.log('  2. Uploading PDF...');
    const fileName = basename(pdfPath);
    await uploadFile(deposition, pdfPath, fileName);  // Pass full deposition object
    console.log(`     ✓ PDF uploaded: ${fileName}`);
    
    // Step 3: Update metadata
    console.log('  3. Updating metadata...');
    await updateMetadata(depositionId, metadata);
    console.log('     ✓ Metadata updated');
    
    // Step 4: Publish to get DOI
    console.log('  4. Publishing to get DOI...');
    const published = await publishDeposition(depositionId);
    const doi = published.doi;
    console.log(`     ✓ DOI minted: ${doi}`);
    
    return {
      success: true,
      doi,
      depositionId,
      zenodoUrl: `https://zenodo.org/record/${published.id}`
    };
    
  } catch (error) {
    console.error(`  ✗ Error minting DOI: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update markdown file with DOI
async function updateMarkdownWithDOI(mdPath, doi) {
  try {
    const content = await readFile(mdPath, 'utf-8');
    const { data, content: markdown } = matter(content);
    
    // Update frontmatter
    data.doi = doi;
    data.doi_minted = new Date().toISOString();
    
    // Reconstruct file
    const newContent = matter.stringify(markdown, data);
    await writeFile(mdPath, newContent);
    
    console.log(`     ✓ Updated markdown file with DOI`);
    return true;
  } catch (error) {
    console.error(`     ✗ Error updating markdown: ${error.message}`);
    return false;
  }
}

// Process all content and mint DOIs
async function processAllContent() {
  console.log('Starting DOI minting process...');
  console.log(`Using Zenodo API: ${ZENODO_API}`);
  console.log(`Token configured: ${ZENODO_TOKEN ? 'Yes' : 'No'}\n`);
  
  const results = [];
  const contentDir = join(rootDir, 'src', 'reports');
  const pdfDir = join(rootDir, 'pdf-export', 'output', 'reports');
  
  try {
    const files = await readdir(contentDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    for (const file of mdFiles) {
      const mdPath = join(contentDir, file);
      const content = await readFile(mdPath, 'utf-8');
      const { data } = matter(content);
      
      // Check if DOI minting is requested and PDF exists
      if (data.doi === true) {
        const pdfPath = join(pdfDir, file.replace('.md', '.pdf'));
        
        try {
          // Check if PDF exists
          await readFile(pdfPath);
          
          // Mint DOI
          const result = await mintDOI(mdPath, pdfPath, data);
          
          if (result.success) {
            // Update markdown with DOI
            await updateMarkdownWithDOI(mdPath, result.doi);
            
            results.push({
              file,
              success: true,
              doi: result.doi,
              url: result.zenodoUrl
            });
          } else {
            results.push({
              file,
              success: false,
              error: result.error
            });
          }
          
        } catch (error) {
          console.error(`  ✗ PDF not found: ${file.replace('.md', '.pdf')}`);
          results.push({
            file,
            success: false,
            error: 'PDF not found'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading content directory:', error.message);
  }
  
  // Generate summary report
  const summary = {
    processed: new Date().toISOString(),
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    dois: results
  };
  
  const summaryPath = join(rootDir, 'dist', '_dois', 'summary.json');
  await mkdir(dirname(summaryPath), { recursive: true });
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`\nDOI Minting Complete!`);
  console.log(`Total processed: ${summary.total}`);
  console.log(`Successful: ${summary.successful}`);
  console.log(`Failed: ${summary.failed}`);
  
  if (summary.successful > 0) {
    console.log('\nMinted DOIs:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  - ${r.file}: ${r.doi}`);
      console.log(`    URL: ${r.url}`);
    });
  }
  
  if (summary.failed > 0) {
    console.log('\nFailed:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.file}: ${r.error}`);
    });
  }
}

// Test Zenodo connection
async function testConnection() {
  console.log('Testing Zenodo API connection...');
  
  try {
    const response = await axios.get(
      `${ZENODO_API}/deposit/depositions`,
      { 
        headers,
        params: { size: 1 }
      }
    );
    
    console.log('✓ Successfully connected to Zenodo API');
    console.log(`  Account has ${response.data.length} depositions`);
    return true;
  } catch (error) {
    console.error('✗ Failed to connect to Zenodo API');
    console.error(`  Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Test connection first
    const connected = await testConnection();
    
    if (!connected) {
      console.error('\nCannot proceed without valid Zenodo connection');
      process.exit(1);
    }
    
    console.log('');
    
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
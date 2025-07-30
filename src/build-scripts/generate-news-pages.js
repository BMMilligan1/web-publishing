#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

// Generate news listing page
async function generateNewsListingPage(articles) {
  console.log('Generating news listing page...');
  
  // Sort articles by date (newest first)
  const sortedArticles = articles.sort((a, b) => 
    new Date(b.data.date) - new Date(a.data.date)
  );
  
  // Separate featured and regular articles
  const featuredArticles = sortedArticles.filter(a => a.data.featured);
  const regularArticles = sortedArticles.filter(a => !a.data.featured);
  
  // Generate listing data
  const listingData = {
    title: "News & Insights",
    description: "Latest updates, analysis, and insights on climate policy and sustainable development",
    featured_items: featuredArticles.map(article => ({
      url: `/news/${article.slug}/`,
      type: article.data.type,
      title: article.data.title,
      excerpt: article.data.excerpt,
      date: article.data.date,
      illustration: article.data.illustration,
      doi: article.data.doi,
      pdf: article.data.pdf,
      tags: article.data.tags,
      read_time: article.data.read_time
    })),
    items: regularArticles.map(article => ({
      url: `/news/${article.slug}/`,
      type: article.data.type,
      title: article.data.title,
      excerpt: article.data.excerpt,
      date: article.data.date,
      illustration: article.data.illustration,
      doi: article.data.doi,
      pdf: article.data.pdf,
      tags: article.data.tags,
      read_time: article.data.read_time
    }))
  };
  
  // Generate index.md for news section
  const indexContent = `---
layout: news-list
${JSON.stringify(listingData, null, 2).slice(1, -1)}
---

# News & Insights

Stay informed with our latest analysis, reports, and insights on climate policy, ocean conservation, and sustainable development across the Pacific region.`;
  
  const indexPath = join(rootDir, 'src', 'news', 'index.md');
  await writeFile(indexPath, indexContent);
  
  console.log('✓ Generated news listing page');
}

// Process all news articles
async function processNewsArticles() {
  console.log('Processing news articles...\n');
  
  const newsDir = join(rootDir, 'src', 'news');
  const articles = [];
  
  try {
    const files = await readdir(newsDir);
    const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'index.md');
    
    for (const file of mdFiles) {
      const filePath = join(newsDir, file);
      const content = await readFile(filePath, 'utf-8');
      const { data, content: markdown } = matter(content);
      
      // Extract slug from filename
      const slug = file.replace('.md', '');
      
      articles.push({
        file,
        slug,
        data,
        content: markdown
      });
      
      console.log(`✓ Processed: ${file}`);
    }
    
    // Generate listing page
    await generateNewsListingPage(articles);
    
    // Generate metadata for build process
    const metadataDir = join(rootDir, 'dist', '_metadata', 'news');
    await mkdir(metadataDir, { recursive: true });
    
    for (const article of articles) {
      const metadataPath = join(metadataDir, `${article.slug}.json`);
      await writeFile(metadataPath, JSON.stringify({
        ...article.data,
        slug: article.slug,
        url: `/news/${article.slug}/`
      }, null, 2));
    }
    
    console.log(`\nProcessed ${articles.length} news articles`);
    
  } catch (error) {
    console.error('Error processing news articles:', error);
  }
}

// Generate homepage with featured content
async function generateHomepage() {
  console.log('\nGenerating homepage...');
  
  try {
    // Collect featured content from all sections
    const featured = [];
    
    // Check reports
    const reportsDir = join(rootDir, 'src', 'reports');
    try {
      const reportFiles = await readdir(reportsDir);
      for (const file of reportFiles.filter(f => f.endsWith('.md'))) {
        const content = await readFile(join(reportsDir, file), 'utf-8');
        const { data } = matter(content);
        if (data.featured) {
          featured.push({
            ...data,
            url: `/reports/${file.replace('.md', '')}/`,
            section: 'reports'
          });
        }
      }
    } catch (e) {
      // Reports directory might not exist yet
    }
    
    // Check dashboards
    const dashboardsDir = join(rootDir, 'src', 'dashboards');
    try {
      const dashboardFiles = await readdir(dashboardsDir);
      for (const file of dashboardFiles.filter(f => f.endsWith('.md'))) {
        const content = await readFile(join(dashboardsDir, file), 'utf-8');
        const { data } = matter(content);
        if (data.featured) {
          featured.push({
            ...data,
            url: `/dashboards/${file.replace('.md', '')}/`,
            section: 'dashboards'
          });
        }
      }
    } catch (e) {
      // Dashboards directory might not exist yet
    }
    
    // Sort by date
    featured.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate homepage content
    const homepageContent = `---
title: Home
layout: home
featured_content: ${JSON.stringify(featured.slice(0, 6), null, 2)}
---

# Welcome to the Climate Policy Platform

Access cutting-edge research, real-time data dashboards, and policy insights on climate action and sustainable development.

## Our Focus Areas

- **Climate Finance**: Tracking global flows and identifying gaps
- **Ocean Conservation**: Monitoring health indicators across the Pacific
- **Policy Analysis**: Evidence-based recommendations for climate action
- **Data Visualization**: Interactive tools for exploring complex datasets

## Latest Updates

Stay informed with our latest reports, dashboards, and analysis.`;
    
    const homepagePath = join(rootDir, 'src', 'index.md');
    await writeFile(homepagePath, homepageContent);
    
    console.log('✓ Generated homepage');
    
  } catch (error) {
    console.error('Error generating homepage:', error);
  }
}

// Main execution
async function main() {
  try {
    await processNewsArticles();
    await generateHomepage();
    
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
# Static Publishing Stack Architecture for Think Tank

## Overview

This document presents a fully static, serverless publishing architecture that requires zero ongoing hosting costs beyond a GitHub subscription and free-tier static hosting (Vercel/Netlify). Perfect for budget-conscious think tanks that still need professional publishing capabilities.

## Core Principles

- **Zero server costs** - Everything runs at build time
- **Professional output** - High-quality web presence and PDFs
- **Full automation** - GitHub Actions handles all processing
- **No vendor lock-in** - Can migrate between static hosts easily

## Architecture Components

### Upstream (Authoring & Content Management)

#### 1. Enhanced Observable Framework with Frontmatter

```yaml
---
title: "Global Health Equity Report 2024"
type: "report" # or "dashboard", "brief", "article"
tags: ["health", "equity", "global-development"]
doi: "10.5281/zenodo.1234567" # Pre-registered via Zenodo
pdf: true # Generate PDF at build time
featured: true # Show on homepage
authors: ["Dr. Sarah Chen", "Prof. James Williams"]
date: 2024-01-15
cover_image: "images/health-equity-cover.jpg"
abstract: "Comprehensive analysis of health equity trends..."
---
```

#### 2. Static Content Organization

```
src/
├── index.md                    # Homepage with featured content
├── reports/                    # Long-form reports
│   ├── 2024-health-equity.md
│   └── _category.json         # Category metadata
├── dashboards/                 # Interactive visualizations
│   ├── climate-tracker.md
│   └── _category.json
├── briefs/                     # Policy briefs
├── data/                       # Data loaders
├── components/                 # Reusable components
└── _theme/                     # Custom theme files
    ├── layouts/
    ├── partials/
    └── assets/
```

### Midstream (Build-Time Processing)

#### 1. Static Site Generation Pipeline

```
GitHub Actions (on push to main):
├── Observable Build
│   ├── Process markdown with frontmatter
│   ├── Generate static HTML pages
│   ├── Build interactive dashboards
│   └── Create search index (Pagefind)
├── Content Processing
│   ├── Generate category pages
│   ├── Create tag archives
│   ├── Build RSS/JSON feeds
│   └── Generate sitemap.xml
├── PDF Generation
│   ├── Convert flagged content to PDF
│   ├── Apply print stylesheets
│   └── Store in GitHub Releases
├── DOI Integration
│   ├── Register with Zenodo (free)
│   └── Update frontmatter with DOI
└── Deploy
    └── Push to Vercel/Netlify
```

#### 2. Build Scripts

```javascript
// build-scripts/enhance-observable.js
import { globby } from 'globby';
import matter from 'gray-matter';
import { Feed } from 'feed';

export async function enhanceContent() {
  const files = await globby('src/**/*.md');
  const contentIndex = [];
  
  // Process each file
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const { data, content: body } = matter(content);
    
    // Add to content index for search
    contentIndex.push({
      title: data.title,
      tags: data.tags,
      type: data.type,
      url: file.replace('src/', '').replace('.md', ''),
      abstract: data.abstract
    });
    
    // Generate individual page with custom layout
    await generatePage(file, data, body);
  }
  
  // Generate category and tag pages
  await generateTaxonomyPages(contentIndex);
  
  // Create search index
  await generateSearchIndex(contentIndex);
  
  // Generate feeds
  await generateFeeds(contentIndex);
}

// Static search using Pagefind
async function generateSearchIndex(content) {
  // Pagefind will index at build time
  await fs.writeJson('dist/_pagefind/content.json', content);
}
```

### Downstream (Static Presentation)

#### 1. Frontend Architecture

```javascript
// src/_theme/assets/js/app.js
// Client-side interactivity (vanilla JS, no framework needed)

// Tag filtering
document.addEventListener('DOMContentLoaded', () => {
  const tagFilters = document.querySelectorAll('.tag-filter');
  const contentItems = document.querySelectorAll('.content-item');
  
  tagFilters.forEach(filter => {
    filter.addEventListener('click', (e) => {
      const selectedTag = e.target.dataset.tag;
      
      contentItems.forEach(item => {
        const itemTags = item.dataset.tags.split(',');
        if (selectedTag === 'all' || itemTags.includes(selectedTag)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
});

// Search integration
if (window.pagefind) {
  const search = document.querySelector('#search');
  search.addEventListener('input', async (e) => {
    const results = await pagefind.search(e.target.value);
    displayResults(results);
  });
}
```

#### 2. Custom Theme Structure

```html
<!-- src/_theme/layouts/report.html -->
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }} - Think Tank Name</title>
  <link rel="stylesheet" href="/assets/css/style.css">
  {% if doi %}
  <meta name="citation_doi" content="{{ doi }}">
  {% endif %}
</head>
<body>
  <header>
    <nav><!-- Navigation --></nav>
  </header>
  
  <article class="report">
    <header>
      <h1>{{ title }}</h1>
      <div class="metadata">
        <time>{{ date | date: "%B %d, %Y" }}</time>
        <div class="authors">{{ authors | join: ", " }}</div>
        {% if doi %}
        <a href="https://doi.org/{{ doi }}" class="doi-badge">{{ doi }}</a>
        {% endif %}
      </div>
    </header>
    
    <div class="actions">
      {% if pdf %}
      <a href="{{ pdf_url }}" class="button">Download PDF</a>
      {% endif %}
      <button onclick="window.print()" class="button secondary">Print</button>
    </div>
    
    <div class="content">
      {{ content }}
    </div>
    
    <footer>
      <div class="tags">
        {% for tag in tags %}
        <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
        {% endfor %}
      </div>
    </footer>
  </article>
  
  <script src="/assets/js/app.js"></script>
</body>
</html>
```

## Implementation Guide

### Phase 1: Observable Enhancement (Week 1)

```javascript
// observablehq.config.js
export default {
  title: "Think Tank Name",
  pages: [
    {name: "Home", path: "/"},
    {name: "Reports", path: "/reports/"},
    {name: "Dashboards", path: "/dashboards/"},
    {name: "Policy Briefs", path: "/briefs/"}
  ],
  // Custom build hooks
  build: {
    async before() {
      await import('./build-scripts/enhance-observable.js');
    },
    async after() {
      await import('./build-scripts/generate-pdfs.js');
      await import('./build-scripts/create-search-index.js');
    }
  }
};
```

### Phase 2: GitHub Actions Setup (Week 2)

```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy Static Site
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Observable site
        run: npm run build
      
      - name: Generate PDFs
        run: |
          npm run pdf:install
          npm run pdf:export
      
      - name: Upload PDFs as Release Assets
        uses: softprops/action-gh-release@v1
        with:
          tag_name: pdfs-${{ github.sha }}
          files: pdf-export/output/*.pdf
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Update PDF URLs in content
        run: |
          node build-scripts/update-pdf-urls.js \
            --release-tag=pdfs-${{ github.sha }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          working-directory: ./dist
```

### Phase 3: DOI Integration (Week 3)

```javascript
// build-scripts/zenodo-integration.js
const axios = require('axios');

async function createZenodoDeposition(metadata) {
  // Use Zenodo's free DOI service
  const response = await axios.post(
    'https://zenodo.org/api/deposit/depositions',
    {
      metadata: {
        title: metadata.title,
        creators: metadata.authors.map(name => ({ name })),
        description: metadata.abstract,
        keywords: metadata.tags,
        publication_date: metadata.date,
        upload_type: 'publication',
        publication_type: 'report'
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.ZENODO_TOKEN}`
      }
    }
  );
  
  return response.data.doi;
}
```

## Cost Analysis

### Completely Free Tier
- **GitHub Free**: Private repos, 2000 GitHub Actions minutes/month
- **Vercel/Netlify Free**: 100GB bandwidth, custom domain
- **Zenodo**: Free DOI minting for academic content
- **Total**: $0/month

### Enhanced Free Options
- **Cloudflare Pages**: Unlimited bandwidth, faster CDN
- **GitHub Pages**: If public repo is acceptable
- **jsDelivr CDN**: For serving PDFs from GitHub releases

## Advantages of Static Architecture

1. **Zero maintenance** - No servers to update or monitor
2. **Infinite scalability** - CDN handles any traffic spike
3. **Perfect security** - No attack surface beyond static files
4. **Version control** - Everything in Git, including PDFs
5. **Fast performance** - Edge-cached content globally
6. **SEO optimized** - Pre-rendered HTML with metadata

## Migration Path

If you outgrow the static architecture:
1. Export all content (already in markdown)
2. Import into any CMS (Ghost, WordPress, etc.)
3. Redirect domains to new platform
4. No data lock-in or migration complexity

## Conclusion

This static architecture provides a professional, scalable publishing platform with zero ongoing costs. Perfect for think tanks that prioritize content quality over complex CMS features.
# Unified Static Architecture: News Design + D3 Visualizations + PDF/DOI Pipeline

## Overview

This document unifies the modern news design with Observable Framework's D3 visualization capabilities and academic publishing features (PDF generation, DOI minting) - all in a completely static, zero-cost architecture.

## Enhanced Architecture Components

### 1. Extended Frontmatter for Multi-Content Types

```yaml
---
# Base metadata
title: "Climate Finance Flows: A Decade of Change"
date: 2024-01-30
type: "report" # report | dashboard | article | brief
featured: true

# Visual design (for news-style cards)
card_color: "sky"
illustration: "climate-finance.svg"
excerpt: "Interactive analysis of global climate finance patterns 2014-2024"

# Academic metadata
authors: 
  - name: "Dr. Maria Garcia"
    orcid: "0000-0002-1234-5678"
  - name: "Prof. John Smith"
    affiliation: "Global Policy Institute"
doi: true # Will mint via Zenodo
pdf: true # Generate PDF version

# Interactive elements
has_visualizations: true
visualization_modules:
  - "components/climate-finance-flow.js"
  - "components/regional-breakdown.js"
data_sources:
  - "data/climate-finance-2024.csv"
  - "data/country-commitments.json"

# Categorization
tags: ["climate", "finance", "data-visualization", "policy"]
read_time: "15 min"
---
```

### 2. Unified Project Structure

```
src/
├── _theme/
│   ├── layouts/
│   │   ├── base.html           # Shared base template
│   │   ├── news-list.html      # News/blog listing
│   │   ├── article.html        # Standard article
│   │   ├── report.html         # Academic report with DOI
│   │   ├── dashboard.html      # Full-page visualization
│   │   └── embedded-viz.html   # Visualization within article
│   ├── components/
│   │   ├── news-card.html      # Card component
│   │   ├── viz-container.html  # D3 viz wrapper
│   │   └── pdf-header.html     # PDF-specific header
│   └── assets/
│       ├── css/
│       │   ├── base.css        # Core styles
│       │   ├── cards.css       # News cards
│       │   ├── viz.css         # Visualization styles
│       │   └── print.css       # PDF-specific styles
│       └── js/
│           ├── observable-runtime.js
│           └── viz-loader.js
├── reports/
│   └── 2024-climate-finance.md
├── dashboards/
│   └── climate-tracker.md
├── news/
│   └── 2024-01-30-climate-update.md
├── components/               # Observable/D3 modules
│   ├── climate-finance-flow.js
│   └── shared-scales.js
└── data/                    # Data files and loaders
    ├── climate-finance-2024.csv
    └── loaders/
        └── process-climate-data.js
```

### 3. Observable Framework Integration in Static Context

#### A. Build-Time Processing

```javascript
// build-scripts/process-observable-content.js
import { Runtime, Inspector } from "@observablehq/runtime";
import * as d3 from "d3";
import { JSDOM } from "jsdom";

export async function processObservableContent(articles) {
  for (const article of articles) {
    if (article.has_visualizations) {
      // Create virtual DOM for server-side rendering
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.document = dom.window.document;
      global.window = dom.window;
      
      // Load and execute visualization modules
      for (const modulePath of article.visualization_modules) {
        const module = await import(`../${modulePath}`);
        
        // Pre-render static version for SEO/initial load
        const staticViz = await renderStaticVisualization(module);
        article.static_visualizations = article.static_visualizations || [];
        article.static_visualizations.push(staticViz);
      }
    }
  }
}

async function renderStaticVisualization(module) {
  // Render D3 visualization to SVG string
  const container = document.createElement('div');
  const runtime = new Runtime();
  const main = runtime.module(module);
  
  // Wait for async data loading
  await main.value("chart");
  
  return container.innerHTML;
}
```

#### B. Client-Side Hydration

```javascript
// _theme/assets/js/viz-loader.js
import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";

class VizLoader {
  constructor() {
    this.runtime = new Runtime();
    this.loadedModules = new Map();
  }
  
  async loadVisualization(containerId, modulePath) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Check if module already loaded
    if (this.loadedModules.has(modulePath)) {
      return this.loadedModules.get(modulePath);
    }
    
    try {
      // Dynamic import of Observable module
      const module = await import(modulePath);
      const main = this.runtime.module(module, Inspector.into(container));
      
      this.loadedModules.set(modulePath, main);
      
      // Handle responsive sizing
      this.observeResize(container, main);
      
      return main;
    } catch (error) {
      console.error(`Failed to load visualization: ${modulePath}`, error);
      container.innerHTML = '<p class="viz-error">Failed to load visualization</p>';
    }
  }
  
  observeResize(container, main) {
    const resizeObserver = new ResizeObserver(() => {
      // Trigger Observable reactive updates
      main.redefine("width", container.clientWidth);
    });
    resizeObserver.observe(container);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const vizLoader = new VizLoader();
  
  // Load all visualizations on page
  document.querySelectorAll('[data-viz-module]').forEach(container => {
    vizLoader.loadVisualization(
      container.id,
      container.dataset.vizModule
    );
  });
});
```

#### C. Observable Module Example

```javascript
// components/climate-finance-flow.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "https://cdn.jsdelivr.net/npm/d3-require@1/+esm";

export default function define(runtime, observer) {
  const main = runtime.module();
  
  // Reactive width
  main.variable(observer("width")).define("width", () => 
    document.querySelector("#chart-container")?.clientWidth || 800
  );
  
  // Load data
  main.variable(observer("data")).define("data", async () => {
    return await d3.csv("/data/climate-finance-2024.csv", d3.autoType);
  });
  
  // Create chart
  main.variable(observer("chart")).define("chart", ["d3", "data", "width"], (d3, data, width) => {
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};
    
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);
    
    // Chart implementation
    // ... (standard D3 code)
    
    return svg.node();
  });
  
  return main;
}
```

### 4. PDF Generation Pipeline

```javascript
// build-scripts/generate-pdfs.js
import puppeteer from 'puppeteer';
import { readFile, writeFile } from 'fs/promises';
import matter from 'gray-matter';

export async function generatePDFs(articles) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  for (const article of articles) {
    if (article.pdf) {
      const page = await browser.newPage();
      
      // Load article with print styles
      await page.goto(`file://${article.distPath}`, {
        waitUntil: 'networkidle0'
      });
      
      // Inject print-specific CSS
      await page.addStyleTag({
        content: `
          @page {
            size: ${article.type === 'report' ? 'A4' : 'Letter'};
            margin: 2cm;
          }
          
          .no-print { display: none !important; }
          
          /* Ensure D3 visualizations render properly */
          svg { 
            max-width: 100% !important; 
            height: auto !important;
            page-break-inside: avoid;
          }
          
          /* Academic formatting */
          .doi-badge {
            position: absolute;
            top: 1cm;
            right: 1cm;
            font-size: 10pt;
          }
          
          /* Force charts to be static in PDF */
          .interactive-controls { display: none !important; }
        `
      });
      
      // Wait for all visualizations to render
      await page.evaluate(() => {
        return new Promise(resolve => {
          // Wait for all D3 transitions to complete
          setTimeout(resolve, 2000);
        });
      });
      
      // Generate PDF with academic formatting
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%;">
            <span class="title"></span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `
      });
      
      // Save PDF
      const pdfPath = `dist/pdfs/${article.slug}.pdf`;
      await writeFile(pdfPath, pdf);
      
      article.pdf_url = `/pdfs/${article.slug}.pdf`;
      
      await page.close();
    }
  }
  
  await browser.close();
}
```

### 5. DOI Minting Integration

```javascript
// build-scripts/mint-dois.js
import axios from 'axios';
import { readFile } from 'fs/promises';

export async function mintDOIs(articles) {
  const ZENODO_TOKEN = process.env.ZENODO_TOKEN;
  const ZENODO_API = 'https://zenodo.org/api';
  
  for (const article of articles) {
    if (article.doi === true && article.pdf_url) {
      try {
        // Create new deposition
        const deposition = await axios.post(
          `${ZENODO_API}/deposit/depositions`,
          {},
          { headers: { 'Authorization': `Bearer ${ZENODO_TOKEN}` } }
        );
        
        const depositionId = deposition.data.id;
        
        // Upload PDF
        const pdfBuffer = await readFile(`dist${article.pdf_url}`);
        await axios.put(
          `${ZENODO_API}/deposit/depositions/${depositionId}/files`,
          pdfBuffer,
          {
            headers: {
              'Authorization': `Bearer ${ZENODO_TOKEN}`,
              'Content-Type': 'application/pdf'
            },
            params: {
              filename: `${article.slug}.pdf`
            }
          }
        );
        
        // Add metadata
        await axios.put(
          `${ZENODO_API}/deposit/depositions/${depositionId}`,
          {
            metadata: {
              title: article.title,
              publication_type: 'report',
              description: article.abstract,
              creators: article.authors.map(author => ({
                name: author.name,
                orcid: author.orcid
              })),
              keywords: article.tags,
              publication_date: article.date,
              access_right: 'open',
              license: 'cc-by-4.0'
            }
          },
          { headers: { 'Authorization': `Bearer ${ZENODO_TOKEN}` } }
        );
        
        // Publish to get DOI
        const publishResponse = await axios.post(
          `${ZENODO_API}/deposit/depositions/${depositionId}/actions/publish`,
          {},
          { headers: { 'Authorization': `Bearer ${ZENODO_TOKEN}` } }
        );
        
        article.doi = publishResponse.data.doi;
        console.log(`Minted DOI: ${article.doi} for ${article.title}`);
        
      } catch (error) {
        console.error(`Failed to mint DOI for ${article.title}:`, error);
      }
    }
  }
}
```

### 6. Unified Template System

```html
<!-- _theme/layouts/report.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ title }} - {{ site.title }}</title>
  
  <!-- Academic metadata -->
  {% if doi %}
  <meta name="citation_doi" content="{{ doi }}">
  <meta name="citation_title" content="{{ title }}">
  <meta name="citation_publication_date" content="{{ date | date: '%Y/%m/%d' }}">
  {% for author in authors %}
  <meta name="citation_author" content="{{ author.name }}">
  {% endfor %}
  {% endif %}
  
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/viz.css">
  <link rel="stylesheet" href="/assets/css/print.css" media="print">
</head>
<body>
  <article class="report" itemscope itemtype="http://schema.org/ScholarlyArticle">
    <header class="report-header">
      <h1 itemprop="headline">{{ title }}</h1>
      
      <div class="report-meta">
        <div class="authors" itemprop="author">
          {% for author in authors %}
          <span class="author">
            {{ author.name }}
            {% if author.orcid %}
            <a href="https://orcid.org/{{ author.orcid }}" class="orcid">
              <img src="/assets/icons/orcid.svg" alt="ORCID">
            </a>
            {% endif %}
          </span>
          {% endfor %}
        </div>
        
        <time datetime="{{ date | date: '%Y-%m-%d' }}" itemprop="datePublished">
          {{ date | date: "%B %d, %Y" }}
        </time>
        
        {% if doi %}
        <a href="https://doi.org/{{ doi }}" class="doi-badge no-print">
          DOI: {{ doi }}
        </a>
        {% endif %}
      </div>
      
      <div class="report-actions no-print">
        {% if pdf_url %}
        <a href="{{ pdf_url }}" class="button button--primary">
          Download PDF
        </a>
        {% endif %}
        <button onclick="window.print()" class="button">Print</button>
        <button onclick="sharePage()" class="button">Share</button>
      </div>
    </header>
    
    {% if abstract %}
    <section class="abstract" itemprop="abstract">
      <h2>Abstract</h2>
      <p>{{ abstract }}</p>
    </section>
    {% endif %}
    
    <main class="report-content" itemprop="articleBody">
      {{ content }}
      
      <!-- Dynamic visualization containers -->
      {% for viz in visualization_modules %}
      <figure class="visualization-container">
        <div id="viz-{{ forloop.index }}" 
             class="viz-mount-point"
             data-viz-module="/{{ viz }}">
          <!-- Static fallback rendered at build time -->
          {{ static_visualizations[forloop.index0] }}
        </div>
        <figcaption>{{ viz_captions[forloop.index0] }}</figcaption>
      </figure>
      {% endfor %}
    </main>
    
    <footer class="report-footer">
      <div class="tags">
        {% for tag in tags %}
        <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
        {% endfor %}
      </div>
    </footer>
  </article>
  
  <!-- Load Observable runtime and visualizations -->
  <script type="module" src="/assets/js/viz-loader.js"></script>
</body>
</html>
```

### 7. GitHub Actions Workflow

```yaml
name: Build and Deploy Complete Static Site
on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  ZENODO_TOKEN: ${{ secrets.ZENODO_TOKEN }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build Observable Framework site
        run: |
          npm run build
          node build-scripts/process-observable-content.js
          
      - name: Generate news pages and cards
        run: |
          node build-scripts/generate-news-pages.js
          node build-scripts/generate-illustrations.js
          
      - name: Generate PDFs for flagged content
        run: |
          npm run pdf:install
          node build-scripts/generate-pdfs.js
          
      - name: Upload PDFs as artifacts
        uses: actions/upload-artifact@v3
        with:
          name: pdf-reports
          path: dist/pdfs/
          
      - name: Mint DOIs via Zenodo
        if: github.ref == 'refs/heads/main'
        run: node build-scripts/mint-dois.js
        
      - name: Update content with DOIs
        run: node build-scripts/update-doi-references.js
        
      - name: Generate search index
        run: npx pagefind --source dist
        
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
          enable-pull-request-comment: true
          enable-commit-comment: true
          overwrites-pull-request-comment: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Complete Feature Set

### 1. **Modern News Interface**
- Card-based layout with custom illustrations
- Tag filtering and search
- Featured content sections
- Responsive design

### 2. **D3/Observable Visualizations**
- Server-side pre-rendering for SEO
- Client-side hydration for interactivity
- Responsive sizing
- Print-friendly static versions

### 3. **Academic Publishing**
- Automated PDF generation
- DOI minting via Zenodo
- Proper citation metadata
- ORCID integration

### 4. **Zero Cost Hosting**
- Static files on Netlify/Vercel free tier
- PDFs stored in GitHub releases
- No database or server required
- Unlimited scalability via CDN

## Performance Optimizations

```javascript
// Lazy load visualizations
const vizObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const container = entry.target;
      vizLoader.loadVisualization(
        container.id,
        container.dataset.vizModule
      );
      vizObserver.unobserve(container);
    }
  });
});

document.querySelectorAll('.viz-mount-point').forEach(el => {
  vizObserver.observe(el);
});
```

## Conclusion

This unified architecture provides:
- **Professional news/blog interface** matching modern standards
- **Full D3/Observable support** with static fallbacks
- **Academic credibility** via DOIs and proper PDFs
- **Zero hosting costs** while maintaining all features
- **Complete automation** through GitHub Actions

The result is a think tank publishing platform that rivals expensive solutions while remaining entirely static and free to operate.
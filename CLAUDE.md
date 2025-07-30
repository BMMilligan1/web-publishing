# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a unified static publishing platform combining Observable Framework's data visualization capabilities with modern news design, academic publishing features (PDF generation, DOI minting), and a completely static, zero-cost architecture. The platform supports multiple content types including reports, dashboards, articles, and briefs.

## Essential Commands

```bash
# Core Observable Framework
npm install              # Install dependencies (requires Node.js v18+)
npm run dev             # Start local development server at http://localhost:3000
npm run build           # Build static site to ./dist
npm run deploy          # Deploy to Observable platform
npm run clean           # Clear data loader cache in .observablehq/cache/

# PDF Export
npm run pdf:install     # Install PDF export dependencies (run once)
npm run pdf:export      # Convert all HTML files in dist/ to PDFs
npm run pdf:build       # Build Observable site and export to PDF
npm run pdf:watch       # Watch for changes and auto-export

# Build Pipeline
npm run process:content # Process Observable modules for static rendering
npm run generate:pdfs   # Generate PDFs for flagged content
npm run mint:dois       # Mint DOIs via Zenodo API
npm run build:all       # Complete build pipeline with all features
```

## Architecture

### Extended Directory Structure
```
src/
├── _theme/                     # Theme and template system
│   ├── layouts/               # Page templates
│   │   ├── base.html         # Shared base template
│   │   ├── news-list.html    # News/blog listing
│   │   ├── article.html      # Standard article
│   │   ├── report.html       # Academic report with DOI
│   │   ├── dashboard.html    # Full-page visualization
│   │   └── embedded-viz.html # Visualization within article
│   ├── components/            # Reusable template components
│   │   ├── news-card.html    # Card component
│   │   ├── viz-container.html # D3 viz wrapper
│   │   └── pdf-header.html   # PDF-specific header
│   └── assets/
│       ├── css/
│       │   ├── base.css      # Core styles with teal color system
│       │   ├── cards.css     # News cards with gradient effects
│       │   ├── viz.css       # Visualization styles
│       │   └── print.css     # PDF-specific styles
│       └── js/
│           ├── observable-runtime.js
│           └── viz-loader.js # Client-side viz hydration
├── reports/                   # Academic reports with DOIs
├── dashboards/               # Interactive dashboards
├── news/                     # News and blog articles
├── components/               # Observable/D3 modules
│   ├── shared-scales.js     # Reusable visualization utilities
│   └── [visualization].js   # Individual visualization modules
├── data/                    # Data files and loaders
│   ├── loaders/            # Data processing scripts
│   └── [data files]        # CSV, JSON, etc.
├── build-scripts/          # Build pipeline scripts
│   ├── process-observable-content.js
│   ├── generate-pdfs.js
│   ├── mint-dois.js
│   └── generate-illustrations.js
└── pdf-export/             # PDF export module
    ├── config/
    │   ├── config.json     # PDF settings
    │   └── styles.css      # Print styles
    └── output/             # Generated PDFs
```

### Content Types and Frontmatter

All content supports enhanced frontmatter for different publishing needs:

```yaml
---
# Base metadata (required)
title: "Climate Finance Flows: A Decade of Change"
date: 2024-01-30
type: "report" # report | dashboard | article | brief
featured: true

# Visual design (for news-style cards)
card_color: "teal" # teal | turquoise | aqua | marine | slate
illustration: "climate-finance.svg" # Generated or custom SVG
excerpt: "Interactive analysis of global climate finance patterns"

# Academic metadata (for reports)
authors: 
  - name: "Dr. Maria Garcia"
    orcid: "0000-0002-1234-5678"
    affiliation: "Institution Name"
  - name: "Prof. John Smith"
    affiliation: "Global Policy Institute"
doi: true # Will mint via Zenodo
pdf: true # Generate PDF version
abstract: "Full abstract text for academic citations..."

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

## Core Concepts

### 1. Static Pre-rendering with Hydration
All Observable visualizations are pre-rendered server-side for SEO and initial load performance, then hydrated client-side for interactivity.

### 2. Multi-format Publishing
Content can be rendered as:
- Interactive web pages with D3 visualizations
- Static PDFs with proper academic formatting
- DOI-minted publications via Zenodo

### 3. Zero-cost Architecture
Everything compiles to static files hostable on free tiers (Netlify, Vercel, GitHub Pages).

## Observable Framework Integration

### Data Loading Pattern
```javascript
// src/data/loaders/process-climate-data.js
import { csv } from 'd3-fetch';
import { rollup } from 'd3-array';

export default async function() {
  const raw = await csv('/data/climate-finance-raw.csv');
  
  // Process data at build time
  const processed = rollup(
    raw,
    v => sum(v, d => d.amount),
    d => d.year,
    d => d.category
  );
  
  return processed;
}
```

### Component Pattern with Static Fallback
```javascript
// src/components/climate-finance-flow.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default function define(runtime, observer) {
  const main = runtime.module();
  
  // Reactive width for responsiveness
  main.variable(observer("width")).define("width", () => 
    document.querySelector("#chart-container")?.clientWidth || 800
  );
  
  // Load processed data
  main.variable(observer("data")).define("data", async () => {
    return await d3.csv("/data/climate-finance-2024.csv", d3.autoType);
  });
  
  // Create chart with print-friendly output
  main.variable(observer("chart")).define("chart", ["d3", "data", "width"], 
    (d3, data, width) => {
      const height = 500;
      const svg = d3.create("svg")
          .attr("viewBox", [0, 0, width, height])
          .attr("class", "chart-svg"); // For print styling
      
      // Chart implementation...
      
      return svg.node();
    }
  );
  
  return main;
}
```

### Client-side Hydration
The `viz-loader.js` script handles dynamic loading and hydration of visualizations:
- Lazy loads visualizations when they enter viewport
- Manages Observable runtime lifecycle
- Handles responsive resizing
- Provides fallback for failed loads

## Build Pipeline

### 1. Observable Content Processing
`build-scripts/process-observable-content.js`:
- Pre-renders all visualizations to static SVG
- Extracts data dependencies
- Generates module manifests

### 2. PDF Generation
`build-scripts/generate-pdfs.js`:
- Uses Puppeteer for high-quality rendering
- Applies print-specific styles
- Waits for all visualizations to render
- Supports A4/Letter formats with proper margins

### 3. DOI Minting
`build-scripts/mint-dois.js`:
- Integrates with Zenodo API
- Uploads PDFs automatically
- Adds proper academic metadata
- Updates content with minted DOIs

### 4. Illustration Generation
`build-scripts/generate-illustrations.js`:
- Creates consistent SVG illustrations for news cards
- Uses D3 for programmatic generation
- Matches brand colors and style

## GitHub Actions Workflow

The complete build and deploy pipeline runs automatically on push to main:

1. Build Observable Framework site
2. Process visualizations for static rendering
3. Generate news pages and card layouts
4. Create PDFs for flagged content
5. Mint DOIs for academic reports
6. Update content with DOI references
7. Generate search index with Pagefind
8. Deploy to Netlify/Vercel

## Environment Variables and Secrets

Required for full functionality:
```bash
# GitHub Secrets
ZENODO_TOKEN          # For DOI minting
NETLIFY_AUTH_TOKEN    # For deployment
NETLIFY_SITE_ID       # Site identifier

# Optional
GITHUB_TOKEN          # For releases (auto-provided)
```

## Development Workflow

### Adding a New Report
1. Create markdown file in `src/reports/` with full frontmatter
2. Add visualization modules to `src/components/`
3. Place data in `src/data/` with optional loader
4. Set `pdf: true` and `doi: true` in frontmatter
5. Push to trigger build pipeline

### Creating a Dashboard
1. Create markdown file in `src/dashboards/`
2. Use `type: "dashboard"` for full-width layout
3. Add multiple visualization modules
4. Dashboards typically don't need PDF/DOI

### Adding News Articles
1. Create markdown file in `src/news/` with date prefix
2. Set card color and illustration
3. Use `type: "article"` or `"brief"`
4. Featured articles appear on homepage

## PDF Export Details

### Configuration
`pdf-export/config/config.json`:
```json
{
  "documents": {
    "report": {
      "format": "A4",
      "margin": "2cm",
      "displayHeaderFooter": true
    },
    "dashboard": {
      "format": "A3",
      "orientation": "landscape",
      "margin": "1cm"
    }
  }
}
```

### Custom Print Styles
`pdf-export/config/styles.css`:
- Removes navigation and interactive elements
- Ensures visualizations fit page boundaries
- Adds page numbers and headers
- Optimizes fonts for print

## Performance Optimizations

### Lazy Loading
Visualizations load only when scrolled into view using Intersection Observer.

### Static Fallbacks
Pre-rendered SVGs display immediately while JavaScript loads.

### CDN Assets
All libraries load from CDN with proper versioning.

### Build Caching
- Observable Framework caches data loader results
- GitHub Actions caches dependencies
- Netlify caches build artifacts

## Troubleshooting

### Visualizations Not Loading
1. Check browser console for errors
2. Verify data files exist in `/data/`
3. Ensure module exports match Observable format
4. Check that container IDs match

### PDF Generation Issues
1. Increase Puppeteer timeout for complex visualizations
2. Verify print CSS doesn't hide critical content
3. Check that all fonts are embedded
4. Ensure SVGs have explicit dimensions

### DOI Minting Failures
1. Verify ZENODO_TOKEN is set correctly
2. Check Zenodo API status
3. Ensure PDF was generated successfully
4. Verify metadata meets Zenodo requirements

## Design System and Color Palette

Based on the Design Colours.png, the platform uses a sophisticated teal/turquoise color scheme:

### Primary Colors
```css
:root {
  /* Core palette from Design Colours.png */
  --color-slate: #4a5568;      /* Dark slate gray */
  --color-teal-dark: #2c7a7b;  /* Deep teal */
  --color-teal: #319795;       /* Primary teal */
  --color-turquoise: #4fd1c5;  /* Bright turquoise */
  --color-aqua: #81e6d9;       /* Light aqua */
  --color-mint: #b2f5ea;       /* Pale mint */
  
  /* Grayscale */
  --color-gray-900: #1a202c;
  --color-gray-700: #4a5568;
  --color-gray-500: #a0aec0;
  --color-gray-300: #e2e8f0;
  --color-gray-100: #f7fafc;
  
  /* Functional colors */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-700);
  --color-background: #ffffff;
  --color-surface: var(--color-gray-100);
}
```

### News Card Colors
Each content type gets a designated color from the palette:
- **Reports**: Deep teal (`--color-teal-dark`)
- **Dashboards**: Primary teal (`--color-teal`)
- **Articles**: Turquoise (`--color-turquoise`)
- **Briefs**: Light aqua (`--color-aqua`)

Example card styling:
```css
.news-card--report {
  background: linear-gradient(135deg, var(--color-teal-dark) 0%, var(--color-teal) 100%);
  border-left: 4px solid var(--color-teal-dark);
}

.news-card--dashboard {
  background: linear-gradient(135deg, var(--color-teal) 0%, var(--color-turquoise) 100%);
  border-left: 4px solid var(--color-teal);
}
```

### Visualization Colors
D3 visualizations should use the teal palette with proper contrast:
```javascript
const colorScale = d3.scaleOrdinal()
  .domain(['category1', 'category2', 'category3'])
  .range(['#2c7a7b', '#319795', '#4fd1c5']);
```

### Print/PDF Styles
For PDF generation, colors are adjusted for print:
- Backgrounds: Convert to light gray tints
- Text: Ensure AAA contrast ratios
- Charts: Use patterns in addition to colors

## Security Considerations

- Never commit API tokens or secrets
- Use GitHub Secrets for sensitive values
- Validate all user inputs in data loaders
- Sanitize dynamic content in visualizations
- Review dependencies for vulnerabilities
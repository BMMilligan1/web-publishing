# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Observable Framework application for creating data-driven technical reports and dashboards. Observable Framework uses file-based routing where Markdown files in `src/` become pages, and supports embedding JavaScript code blocks for interactive visualizations.

## Essential Commands

```bash
npm install     # Install dependencies (requires Node.js v18+)
npm run dev     # Start local development server at http://localhost:3000
npm run build   # Build static site to ./dist
npm run deploy  # Deploy to Observable platform
npm run clean   # Clear data loader cache in .observablehq/cache/
```

## Architecture

### Key Directories
- `src/` - Source root with file-based routing
- `src/components/` - Reusable JavaScript modules (e.g., timeline.js)
- `src/data/` - Data loaders (.js files) and static data files
- `dist/` - Build output (gitignored)

### Core Concepts
1. **Pages**: Markdown files that mix content with JavaScript code blocks
2. **Data Loaders**: JavaScript files that fetch/transform data at build time
3. **Components**: ES modules that export reusable visualization functions
4. **Reactive Execution**: Code blocks in Markdown re-run when dependencies change

### Data Loading Pattern
Data loaders are JavaScript files that export data:
```javascript
// src/data/example.csv.js
export default async function() {
  // Fetch, process, and return data
  return data;
}
```

### Component Pattern
Components export functions that create visualizations:
```javascript
// src/components/chart.js
export function createChart(data, options) {
  return Plot.plot({...});
}
```

## Current Setup

- **Framework**: Observable Framework v1.13.3
- **Visualization**: D3.js and Observable Plot
- **No linting/testing**: Currently no eslint, prettier, or test runner configured
- **Configuration**: `observablehq.config.js` defines site structure and navigation

## Development Notes

- Observable Framework caches data loader results; use `npm run clean` to refresh
- The framework supports hot reloading during development
- No environment variables or build configuration needed
- To add a new page, create a `.md` file in `src/`
- To add data, create a loader in `src/data/` or place static files there

## PDF Export

This project includes a PDF export module that converts Observable Framework HTML output to high-quality PDFs.

### PDF Export Commands

```bash
npm run pdf:install  # Install PDF export dependencies (run once)
npm run pdf:export   # Convert all HTML files in dist/ to PDFs
npm run pdf:build    # Build Observable site and export to PDF
npm run pdf:watch    # Watch for changes and auto-export
```

### PDF Export Architecture

The PDF export is completely separate from Observable Framework:
- Located in `pdf-export/` directory with its own dependencies
- Reads from `dist/` without modifying any files
- Outputs PDFs to `pdf-export/output/`
- Configured via `pdf-export/config/config.json`

### PDF Configuration

- **Document-specific settings**: Dashboard pages use A3 landscape, reports use A4 portrait
- **Custom styling**: PDF-specific CSS removes Observable UI elements and optimizes for print
- **D3 visualizations**: SVGs are preserved with proper sizing and fonts

### Customization

To customize PDF output:
1. Edit `pdf-export/config/styles.css` for print styling
2. Modify `pdf-export/config/config.json` for page settings
3. Add document-specific rules based on filename patterns
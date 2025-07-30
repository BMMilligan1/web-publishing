# PDF Export Implementation Strategy for Observable Framework

## Overview

This document outlines the implementation strategy for adding PDF export functionality to the Observable Framework project without modifying or interfering with the framework's standard operation. The PDF export will work as a post-processing step on the generated HTML files in the `dist` folder.

## Core Principles

1. **Non-invasive**: PDF export operates entirely on the output files, never modifying Observable Framework source or build process
2. **Modular**: Completely separate from Observable Framework, can be added or removed without impact
3. **Configurable**: Flexible styling and layout options per document type
4. **Preserves Fidelity**: Maintains the quality of D3 visualizations and interactive elements in static form

## Architecture

### Directory Structure
```
technical-report/
├── src/                     # Observable Framework source (untouched)
├── dist/                    # Observable Framework output (read-only for PDF)
├── pdf-export/              # PDF export module (completely separate)
│   ├── config/
│   │   ├── styles.css       # PDF-specific styling
│   │   ├── config.json      # PDF generation settings
│   │   └── templates/       # Page templates if needed
│   ├── src/
│   │   ├── converter.js     # Main conversion logic
│   │   ├── preprocessor.js  # HTML preprocessing
│   │   ├── styler.js        # Style injection
│   │   └── utils.js         # Helper functions
│   ├── output/              # Generated PDFs
│   └── package.json         # Separate dependencies
└── package.json             # Main project (Observable Framework)
```

### Key Components

1. **HTML Preprocessor**
   - Reads HTML files from `dist/`
   - Removes Observable UI elements (sidebar, header, footer)
   - Optimizes content for print layout
   - Ensures all assets are embedded or referenced absolutely

2. **Style Manager**
   - Injects print-specific CSS
   - Handles page breaks and margins
   - Ensures D3 visualizations render correctly
   - Manages typography and spacing for print

3. **PDF Converter**
   - Uses Puppeteer for accurate rendering
   - Configurable per document type
   - Handles multi-page documents
   - Preserves vector graphics quality

4. **Configuration System**
   - JSON-based configuration
   - Per-document settings
   - Global defaults
   - Template selection

## Implementation Phases

### Phase 1: Basic Infrastructure
- Set up separate `pdf-export` directory
- Install dependencies (Puppeteer, glob, etc.)
- Create basic converter that reads from `dist/`
- Test with simple HTML-to-PDF conversion

### Phase 2: Style System
- Develop comprehensive print CSS
- Hide Observable UI elements
- Optimize typography and spacing
- Ensure D3 charts render properly
- Handle page breaks intelligently

### Phase 3: Configuration & Flexibility
- Implement JSON configuration system
- Add per-document type settings
- Support different page sizes and orientations
- Create template system for headers/footers

### Phase 4: Enhancement & Optimization
- Add parallel processing for multiple files
- Implement caching for faster re-builds
- Add command-line options
- Create progress reporting

### Phase 5: Integration & Automation
- Add npm scripts to main package.json
- Create watch mode for development
- Add GitHub Actions for CI/CD
- Document usage and configuration

## Technical Specifications

### Dependencies
- **Puppeteer**: For HTML to PDF conversion
- **Glob**: For file pattern matching
- **Commander**: For CLI interface
- **Chalk**: For console output styling

### CSS Strategy
```css
/* Core print optimizations */
@page {
  size: A4;
  margin: 20mm 15mm;
}

/* Hide Observable Framework UI */
.observablehq-header,
.observablehq-footer,
.observablehq-sidebar { 
  display: none !important; 
}

/* Preserve D3 visualization quality */
svg {
  max-width: 100% !important;
  page-break-inside: avoid;
}
```

### Configuration Schema
```json
{
  "defaults": {
    "format": "A4",
    "margin": { "top": "20mm", "right": "15mm", "bottom": "20mm", "left": "15mm" },
    "printBackground": true
  },
  "documents": {
    "dashboard": { "format": "A3", "landscape": true },
    "report": { "format": "A4", "headerTemplate": "<custom-header>" }
  }
}
```

## Usage Workflow

1. **Standard Observable Development**
   ```bash
   npm run dev          # Develop normally
   npm run build        # Build to dist/
   ```

2. **PDF Export**
   ```bash
   npm run pdf:export   # Convert all HTML to PDF
   npm run pdf:export --file=dashboard  # Convert specific file
   npm run pdf:watch    # Watch mode for development
   ```

3. **Output**
   - PDFs generated in `pdf-export/output/`
   - Maintains directory structure from `dist/`
   - Logs progress and any issues

## Advantages of This Approach

1. **Zero Framework Modification**: Observable Framework remains completely untouched
2. **Flexible Deployment**: Can be added to any Observable project
3. **Version Independence**: Works with any Observable Framework version
4. **Easy Maintenance**: Updates to PDF export don't affect main project
5. **Clean Separation**: Can be developed and tested independently

## Future Enhancements

1. **Template System**: Pre-built templates for common report types
2. **TOC Generation**: Automatic table of contents for multi-page documents
3. **Batch Processing**: Export multiple configurations simultaneously
4. **Cloud Integration**: Direct upload to S3/Google Drive
5. **API Endpoint**: Serve PDFs dynamically via API

## Development Guidelines

1. Always read from `dist/`, never modify
2. Keep all PDF-specific code in `pdf-export/`
3. Use semantic versioning for the PDF export module
4. Document all configuration options
5. Include comprehensive error handling
6. Test with various Observable Framework projects

## Testing Strategy

1. **Unit Tests**: Test individual components (preprocessor, styler, etc.)
2. **Integration Tests**: Test full HTML-to-PDF pipeline
3. **Visual Tests**: Compare PDF output with HTML source
4. **Performance Tests**: Ensure reasonable conversion times
5. **Compatibility Tests**: Test with different Observable Framework versions

This modular approach ensures the PDF export functionality enhances the Observable Framework project without any risk of breaking existing functionality or complicating the development workflow.
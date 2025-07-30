# Technical Report

An [Observable Framework](https://observablehq.com/framework/) application for creating data-driven technical reports and dashboards with PDF export capabilities.

## Features

- 📊 **Interactive Visualizations**: Built with D3.js and Observable Plot
- 📝 **Markdown-based Content**: Write reports in Markdown with embedded JavaScript
- 🎨 **Custom Styling**: Beautiful, responsive design with multiple theme options
- 📄 **PDF Export**: Convert your reports to high-quality PDFs with preserved visualizations
- 🔄 **Live Reload**: Hot reloading during development for instant feedback
- 📦 **Data Loaders**: Dynamic data fetching and processing at build time

## Quick Start

### Prerequisites

- Node.js 18 or later
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/technical-report.git
cd technical-report

# Install dependencies
npm install

# Install PDF export dependencies
npm run pdf:install
```

### Development

```bash
# Start the development server
npm run dev
```

Then visit http://localhost:3000 to preview your app.

### Building

```bash
# Build static site
npm run build

# Build and export to PDF
npm run pdf:build
```

## Project Structure

```
technical-report/
├── src/                        # Source files
│   ├── components/             # Reusable JavaScript modules
│   │   └── timeline.js         # Timeline visualization component
│   ├── data/                   # Data loaders and static data
│   │   ├── events.json         # Static timeline events
│   │   └── launches.csv.js     # Dynamic data loader
│   ├── index.md                # Home page
│   └── example-report.md       # Example report page
├── dist/                       # Build output (generated)
├── pdf-export/                 # PDF export module
│   ├── config/                 # PDF configuration
│   │   ├── styles.css          # Print-specific styles
│   │   └── config.json         # Export settings
│   ├── src/                    # PDF converter source
│   └── output/                 # Generated PDFs
├── observablehq.config.js      # Framework configuration
└── package.json                # Project dependencies
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start local development server |
| `npm run build` | Build static site to `./dist` |
| `npm run deploy` | Deploy to Observable |
| `npm run clean` | Clear data loader cache |
| **PDF Export** | |
| `npm run pdf:install` | Install PDF export dependencies |
| `npm run pdf:export` | Convert HTML files to PDF |
| `npm run pdf:build` | Build site and export to PDF |
| `npm run pdf:watch` | Watch mode for PDF export |

## Creating Content

### Pages

Create new pages by adding Markdown files to the `src/` directory:

```markdown
---
title: My New Report
---

# My New Report

This is a new page with a visualization:

\```js
Plot.plot({
  marks: [
    Plot.line(data, {x: "date", y: "value"})
  ]
})
\```
```

### Data Loaders

Create data loaders in `src/data/`:

```javascript
// src/data/mydata.csv.js
export default async function() {
  const response = await fetch("https://api.example.com/data");
  return response.json();
}
```

### Components

Create reusable visualization components in `src/components/`:

```javascript
// src/components/chart.js
import * as Plot from "@observablehq/plot";

export function createChart(data, options = {}) {
  return Plot.plot({
    ...options,
    marks: [
      Plot.line(data, {x: "date", y: "value"})
    ]
  });
}
```

## PDF Export

The PDF export module converts your Observable Framework reports to high-quality PDFs while preserving all visualizations.

### Features

- ✅ Preserves D3.js and Observable Plot visualizations
- ✅ Custom print styling with page breaks
- ✅ Configurable page sizes and orientations
- ✅ Automatic removal of UI elements (sidebar, navigation)
- ✅ Support for landscape/portrait modes per document

### Configuration

Edit `pdf-export/config/config.json` to customize PDF output:

```json
{
  "defaults": {
    "format": "A4",
    "margin": { "top": "20mm", "right": "15mm", "bottom": "20mm", "left": "15mm" }
  },
  "documents": {
    "dashboard": { "format": "A3", "landscape": true },
    "report": { "format": "A4" }
  }
}
```

### Custom Styling

Modify `pdf-export/config/styles.css` to customize print appearance.

## Examples

The project includes several example pages:

- **Home Page** (`src/index.md`): Interactive charts with real-time data
- **Dashboard** (`src/example-dashboard.md`): Multi-chart dashboard layout
- **Report** (`src/example-report.md`): Long-form report with timeline visualization

## Deployment

### Observable

Deploy directly to Observable:

```bash
npm run deploy
```

### Static Hosting

Build and deploy the `dist/` folder to any static hosting service:

```bash
npm run build
# Upload dist/ folder to your hosting service
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Visualizations not appearing in PDF

Ensure you've built the site before exporting:
```bash
npm run build
npm run pdf:export
```

### Data loader cache issues

Clear the cache if data seems outdated:
```bash
npm run clean
npm run build
```

### PDF export installation issues

If you encounter issues with Puppeteer installation:
```bash
cd pdf-export
npm install puppeteer --no-save
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Observable Framework](https://observablehq.com/framework/)
- Visualizations powered by [D3.js](https://d3js.org/) and [Observable Plot](https://observablehq.com/plot/)
- PDF export uses [Puppeteer](https://pptr.dev/)

## Resources

- [Observable Framework Documentation](https://observablehq.com/framework/)
- [Observable Plot Documentation](https://observablehq.com/plot/)
- [D3.js Documentation](https://d3js.org/)
- [Markdown Guide](https://www.markdownguide.org/)

---

For more information about Observable Framework, visit https://observablehq.com/framework/

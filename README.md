# Climate Policy Platform

A modern, static website built with Observable Framework for publishing climate research, data dashboards, and policy insights. Features a unified architecture combining academic publishing capabilities with interactive data visualizations.

## 🌟 Features

- **Static Site Generation** with Observable Framework
- **Academic Publishing** with DOI minting via Zenodo
- **PDF Generation** for all reports and pages
- **Interactive Dashboards** with D3.js visualizations
- **Responsive Design** with custom teal color scheme
- **SEO Optimized** with proper metadata
- **GitHub Actions** ready for CI/CD

## 📋 Prerequisites

- Node.js v18 or higher
- npm or yarn
- Git
- Optional: Python 3 (for local preview server)

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/web-publishing.git
cd web-publishing
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your tokens:
```
ZENODO_TOKEN=your_zenodo_api_token
NETLIFY_AUTH_TOKEN=your_netlify_token
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your site.

## 📁 Project Structure

```
web-publishing/
├── src/                    # Source files
│   ├── index.md           # Homepage
│   ├── reports/           # Research reports
│   ├── dashboards/        # Interactive dashboards
│   ├── news/              # News and updates
│   ├── series/            # Article series
│   ├── data/              # JSON data files
│   ├── components/        # Reusable JS modules
│   └── _theme/            # Theme assets
│       └── assets/
│           ├── css/       # Stylesheets
│           └── illustrations/ # SVG graphics
├── dist/                  # Built static site (gitignored)
├── pdf-export/            # PDF generation module
├── observablehq.config.js # Observable Framework config
└── package.json
```

## 🎨 Content Management

### Creating a Report

1. Create a new markdown file in `src/reports/`:
```markdown
---
title: Your Report Title
date: 2024-02-01
type: report
excerpt: Brief description for listings
authors: 
  - Dr. Jane Smith
  - Prof. John Doe
tags: 
  - climate-finance
  - adaptation
doi: true  # Enable DOI minting
pdf: true  # Enable PDF generation
---

# Your Report Title

Report content here...
```

2. Reports will automatically appear in listings and navigation.

### Creating a Dashboard

1. Create a new markdown file in `src/dashboards/`:
```markdown
---
title: Dashboard Name
date: 2024-02-01
type: dashboard
excerpt: Brief description
update_frequency: Daily
data_sources:
  - NOAA
  - World Bank
---

# Dashboard Title

```js
// Your Observable Framework code
import {Plot} from "@observablehq/plot";

// Create visualizations
```
```

### Adding News Articles

1. Create a new markdown file in `src/news/`:
```markdown
---
title: Article Title
date: 2024-02-01
type: news  # or 'announcement', 'update'
excerpt: Brief summary
tags:
  - policy
  - ocean
featured: true  # Optional: highlight on homepage
---

Article content...
```

### Updating Data

Edit the JSON files in `src/data/`:
- `all-reports.json` - Report metadata
- `dashboards-list.json` - Dashboard listings
- `news-articles.json` - News metadata

## 🛠️ Build Commands

### Development
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build static site to ./dist
npm run clean        # Clear Observable cache
```

### Illustrations
```bash
npm run generate:illustrations  # Generate SVG illustrations
```

### PDF Export
```bash
npm run pdf:install  # Install PDF dependencies (run once)
npm run pdf:build    # Build site and export all PDFs
npm run pdf:export   # Export PDFs from existing build
npm run pdf:watch    # Watch for changes and auto-export
```

### DOI Minting
```bash
npm run mint:dois              # Mint DOIs for reports
npm run mint:dois -- --dry-run # Test without creating DOIs
```

### Observable Content Processing
```bash
node src/build-scripts/process-observable-content.js
```

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect GitHub repository** to Netlify

2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Set environment variables** in Netlify:
   - `ZENODO_TOKEN`
   - `NETLIFY_AUTH_TOKEN`

4. **Deploy**:
   - Push to main branch triggers automatic deployment
   - Or use manual deploy: `npm run deploy`

### GitHub Pages

1. **Build the site**:
```bash
npm run build
```

2. **Deploy to GitHub Pages**:
```bash
npm run deploy:github
```

### Custom Server

1. **Build the site**:
```bash
npm run build
```

2. **Serve the `dist` folder** with any static file server:
```bash
# Using Python
cd dist && python3 -m http.server 8000

# Using Node.js
npx http-server dist

# Using nginx
# Copy dist contents to /var/www/html
```

## 📊 Features in Detail

### DOI Minting

The platform integrates with Zenodo for automatic DOI minting:

1. **Get a Zenodo token** from https://zenodo.org/account/settings/applications/
2. **Add to `.env`**: `ZENODO_TOKEN=your_token`
3. **Enable in frontmatter**: `doi: true`
4. **Run**: `npm run mint:dois`

DOIs are saved back to the markdown files and displayed on the site.

### PDF Generation

High-quality PDFs are generated using Puppeteer:

1. **Configure** in `pdf-export/config/config.json`
2. **Custom styles** in `pdf-export/config/styles.css`
3. **Generate**: `npm run pdf:build`

PDFs are saved to `pdf-export/output/` with the same structure as the site.

### Illustrations

SVG illustrations are auto-generated based on content:

1. **Manifest** in `src/_theme/assets/illustrations/_manifest.json`
2. **Generate**: `npm run generate:illustrations`
3. **Use in content**: Reference by filename in frontmatter

### Observable Framework

The site uses Observable Framework for reactive data visualizations:

1. **JavaScript blocks** with reactive execution
2. **FileAttachment** API for data loading
3. **Built-in libraries**: D3, Plot, htl
4. **Hot module replacement** in development

## 🎨 Customization

### Theme Colors

Edit color variables in `src/_theme/assets/css/base.css`:
```css
:root {
  --color-teal-dark: #2c7a7b;
  --color-teal: #319795;
  --color-turquoise: #4fd1c5;
  --color-aqua: #81e6d9;
  --color-mint: #b2f5ea;
}
```

### Navigation

Update `observablehq.config.js`:
```javascript
pages: [
  {name: "Reports", path: "/reports/"},
  {name: "Dashboards", path: "/dashboards/"},
  {name: "News", path: "/news/"}
]
```

### Homepage

Edit `src/index.md` to customize:
- Hero section
- Focus areas
- Content sections

## 🐛 Troubleshooting

### Common Issues

1. **"SyntaxError: invalid expression"**
   - Ensure you're not using `await` in template literals
   - Use JavaScript blocks with `display()`

2. **Images not loading**
   - Illustrations must be in `src/` root
   - Use `FileAttachment()` API for dynamic paths

3. **Build failures**
   - Clear cache: `npm run clean`
   - Check Node version: `node --version` (must be 18+)
   - Reinstall dependencies: `rm -rf node_modules && npm install`

4. **PDF generation errors**
   - Install dependencies: `npm run pdf:install`
   - Check file permissions
   - Ensure Chromium is installed

### Debug Mode

```bash
# Verbose Observable build
DEBUG=observable:* npm run build

# Test individual scripts
node src/build-scripts/generate-illustrations.js
node src/build-scripts/mint-dois.js --dry-run
```

## 📚 Documentation

- [Observable Framework Docs](https://observablehq.com/framework/)
- [D3.js Documentation](https://d3js.org/)
- [Zenodo API Docs](https://developers.zenodo.org/)
- [Puppeteer Documentation](https://pptr.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly: `npm run build`
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/web-publishing/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/web-publishing/discussions)
- **Email**: support@yourdomain.com

## 🙏 Acknowledgments

Built with:
- [Observable Framework](https://observablehq.com/framework/)
- [D3.js](https://d3js.org/)
- [Puppeteer](https://pptr.dev/)
- [Zenodo](https://zenodo.org/)

---

Made with ❤️ for climate action and ocean conservation.
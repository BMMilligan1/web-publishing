# Static Implementation of Modern News/Blog Design

## Overview

This guide demonstrates how to build a professional, minimalist news/blog interface similar to Anthropic's newsroom using only static site generation. The design features a card-based layout, custom illustrations, and excellent typography—all without any server-side components.

## Design Principles

### Core Visual Elements
- **Card-based grid layout** with consistent spacing
- **Custom illustrations** for each article (SVG-based)
- **Muted color palette** with subtle background variations
- **Generous whitespace** for readability
- **Clear typography hierarchy**
- **Minimal UI elements** focusing on content

## Implementation Architecture

### 1. Enhanced Frontmatter Structure

```yaml
---
title: "Advancing AI Safety Through Research Collaboration"
date: 2024-01-30
type: "announcement"
tags: ["safety", "research", "collaboration"]
featured: true
card_color: "clay" # Options: clay, heather, sky, olive, sand
illustration: "research-collab.svg" # Custom SVG in /assets/illustrations/
thumbnail: "research-collab-thumb.jpg" # Fallback for social sharing
excerpt: "We're partnering with leading institutions to advance the field of AI safety research."
read_time: "5 min"
authors: ["Research Team"]
---
```

### 2. Project Structure

```
src/
├── _theme/
│   ├── layouts/
│   │   ├── base.html
│   │   ├── news-list.html
│   │   ├── news-item.html
│   │   └── home.html
│   ├── components/
│   │   ├── news-card.html
│   │   ├── featured-card.html
│   │   └── filter-nav.html
│   └── assets/
│       ├── css/
│       │   ├── base.css
│       │   ├── cards.css
│       │   └── typography.css
│       ├── js/
│       │   └── filters.js
│       └── illustrations/
│           └── [svg files]
├── news/
│   ├── index.md
│   ├── 2024-01-30-ai-safety-research.md
│   └── _category.json
└── index.md
```

### 3. CSS Implementation

```css
/* _theme/assets/css/base.css */
:root {
  /* Color palette */
  --color-clay: #E8D5C4;
  --color-heather: #D8D3E8;
  --color-sky: #C4D8E8;
  --color-olive: #D5E8C4;
  --color-sand: #F5E6D3;
  
  /* Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-size-base: 16px;
  --font-size-h1: 2.5rem;
  --font-size-h2: 1.875rem;
  --font-size-h3: 1.5rem;
  --font-size-small: 0.875rem;
  
  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-xxl: 4rem;
  
  /* Layout */
  --max-width: 1200px;
  --card-radius: 12px;
  --transition-base: all 0.2s ease;
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: #1a1a1a;
  background: #ffffff;
  margin: 0;
  padding: 0;
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* _theme/assets/css/cards.css */
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
  margin: var(--space-xxl) 0;
}

.news-card {
  background: #ffffff;
  border-radius: var(--card-radius);
  overflow: hidden;
  transition: var(--transition-base);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.news-card__illustration {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.news-card__illustration--clay { background-color: var(--color-clay); }
.news-card__illustration--heather { background-color: var(--color-heather); }
.news-card__illustration--sky { background-color: var(--color-sky); }
.news-card__illustration--olive { background-color: var(--color-olive); }
.news-card__illustration--sand { background-color: var(--color-sand); }

.news-card__content {
  padding: var(--space-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  color: #666;
  font-size: var(--font-size-small);
}

.news-card__title {
  font-size: var(--font-size-h3);
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 var(--space-sm) 0;
  color: #1a1a1a;
}

.news-card__excerpt {
  color: #4a4a4a;
  flex: 1;
  margin-bottom: var(--space-md);
}

.news-card__tags {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: var(--font-size-small);
  color: #666;
  text-decoration: none;
  transition: var(--transition-base);
}

.tag:hover {
  background: #e0e0e0;
}

/* Featured section */
.featured-section {
  margin: var(--space-xxl) 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
}

.featured-card {
  background: #f8f8f8;
  border-radius: var(--card-radius);
  padding: var(--space-xl);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: center;
}

@media (max-width: 768px) {
  .featured-card {
    grid-template-columns: 1fr;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
  }
}
```

### 4. HTML Templates

```html
<!-- _theme/layouts/news-list.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ site.title }} - News</title>
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/cards.css">
  <link rel="stylesheet" href="/assets/css/typography.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <nav class="nav">
        <a href="/" class="logo">{{ site.title }}</a>
        <ul class="nav__menu">
          <li><a href="/news/">News</a></li>
          <li><a href="/reports/">Reports</a></li>
          <li><a href="/dashboards/">Data</a></li>
          <li><a href="/about/">About</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="main">
    <div class="container">
      <section class="hero">
        <h1>News & Updates</h1>
        <p class="lead">Latest insights, research, and announcements from our team.</p>
      </section>

      <!-- Filter navigation -->
      <nav class="filter-nav" id="filter-nav">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="announcement">Announcements</button>
        <button class="filter-btn" data-filter="research">Research</button>
        <button class="filter-btn" data-filter="policy">Policy</button>
        <button class="filter-btn" data-filter="report">Reports</button>
      </nav>

      <!-- Featured items -->
      {% assign featured = collections.news | where: "featured", true | limit: 2 %}
      {% if featured.size > 0 %}
      <section class="featured-section">
        <h2 class="section-title">Featured</h2>
        <div class="featured-grid">
          {% for item in featured %}
          <article class="featured-card">
            <div class="featured-card__content">
              <div class="news-card__meta">
                <time datetime="{{ item.date | date: '%Y-%m-%d' }}">
                  {{ item.date | date: "%B %d, %Y" }}
                </time>
                <span class="separator">•</span>
                <span>{{ item.read_time }}</span>
              </div>
              <h3 class="featured-card__title">
                <a href="{{ item.url }}">{{ item.title }}</a>
              </h3>
              <p class="featured-card__excerpt">{{ item.excerpt }}</p>
              <div class="news-card__tags">
                {% for tag in item.tags %}
                <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
                {% endfor %}
              </div>
            </div>
            <div class="featured-card__illustration featured-card__illustration--{{ item.card_color }}">
              <img src="/assets/illustrations/{{ item.illustration }}" alt="">
            </div>
          </article>
          {% endfor %}
        </div>
      </section>
      {% endif %}

      <!-- News grid -->
      <section class="news-section">
        <h2 class="section-title">All News</h2>
        <div class="news-grid" id="news-grid">
          {% for item in collections.news %}
          <article class="news-card" data-type="{{ item.type }}" data-tags="{{ item.tags | join: ',' }}">
            <div class="news-card__illustration news-card__illustration--{{ item.card_color }}">
              <img src="/assets/illustrations/{{ item.illustration }}" alt="" loading="lazy">
            </div>
            <div class="news-card__content">
              <div class="news-card__meta">
                <time datetime="{{ item.date | date: '%Y-%m-%d' }}">
                  {{ item.date | date: "%B %d, %Y" }}
                </time>
                <span class="separator">•</span>
                <span>{{ item.type | capitalize }}</span>
              </div>
              <h3 class="news-card__title">
                <a href="{{ item.url }}">{{ item.title }}</a>
              </h3>
              <p class="news-card__excerpt">{{ item.excerpt }}</p>
              <div class="news-card__tags">
                {% for tag in item.tags %}
                <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
                {% endfor %}
              </div>
            </div>
          </article>
          {% endfor %}
        </div>
      </section>
    </div>
  </main>

  <script src="/assets/js/filters.js"></script>
</body>
</html>
```

### 5. JavaScript for Filtering

```javascript
// _theme/assets/js/filters.js
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const newsItems = document.querySelectorAll('.news-card');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      const filter = e.target.dataset.filter;
      
      // Filter items
      newsItems.forEach(item => {
        if (filter === 'all') {
          item.style.display = 'block';
        } else {
          const itemType = item.dataset.type;
          const itemTags = item.dataset.tags.split(',');
          
          if (itemType === filter || itemTags.includes(filter)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        }
      });
      
      // Smooth scroll to top of grid
      document.querySelector('.news-section').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    });
  });
});
```

### 6. Build Process Integration

```javascript
// build-scripts/generate-illustrations.js
import { createCanvas } from 'canvas';
import fs from 'fs-extra';
import crypto from 'crypto';

// Generate unique abstract SVG illustrations for articles without custom ones
export async function generateIllustrations(articles) {
  for (const article of articles) {
    if (!article.illustration) {
      const hash = crypto.createHash('md5').update(article.title).digest('hex');
      const svg = generateAbstractSVG(hash, article.card_color);
      
      const filename = `${article.slug}-generated.svg`;
      await fs.writeFile(
        `dist/assets/illustrations/${filename}`,
        svg
      );
      
      article.illustration = filename;
    }
  }
}

function generateAbstractSVG(seed, color) {
  // Use seed to generate consistent abstract patterns
  const shapes = [];
  const random = seedRandom(seed);
  
  // Generate 3-5 geometric shapes
  const shapeCount = Math.floor(random() * 3) + 3;
  
  for (let i = 0; i < shapeCount; i++) {
    const shapeType = ['circle', 'rect', 'polygon'][Math.floor(random() * 3)];
    const opacity = 0.3 + random() * 0.4;
    
    shapes.push(generateShape(shapeType, random, opacity));
  }
  
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${shapes.join('\n')}
      </g>
    </svg>
  `;
}
```

### 7. Observable Framework Integration

```javascript
// observablehq.config.js
export default {
  title: "Think Tank Name",
  theme: ["default", "custom"],
  root: "src",
  output: "dist",
  
  // Custom build hooks
  build: {
    async before() {
      // Process news articles
      await processNewsArticles();
      
      // Generate missing illustrations
      await generateIllustrations();
      
      // Create tag pages
      await generateTagPages();
    },
    
    async after() {
      // Generate search index
      await generateSearchIndex();
      
      // Create RSS feeds
      await generateRSSFeeds();
      
      // Optimize images
      await optimizeImages();
    }
  }
};

// src/news/index.md
---
layout: news-list
title: News & Updates
---

// Page content is handled by the template
```

## Advanced Features

### 1. Progressive Enhancement

```javascript
// Add view transitions for modern browsers
if ('startViewTransition' in document) {
  document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="/news/"]')) {
      e.preventDefault();
      document.startViewTransition(() => {
        window.location = e.target.href;
      });
    }
  });
}
```

### 2. Search Integration

```javascript
// Integrate with Pagefind for static search
import { PagefindUI } from '@pagefind/default-ui';

new PagefindUI({ 
  element: "#search",
  showSubResults: true,
  excerptLength: 100
});
```

### 3. Social Sharing

```html
<!-- Add to news-item.html template -->
<div class="share-buttons">
  <a href="https://twitter.com/intent/tweet?text={{ title }}&url={{ absolute_url }}" 
     class="share-btn share-btn--twitter">
    Share on Twitter
  </a>
  <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ absolute_url }}" 
     class="share-btn share-btn--linkedin">
    Share on LinkedIn
  </a>
</div>
```

## Deployment

### GitHub Actions Workflow

```yaml
name: Build and Deploy News Site
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
      
      - name: Build site
        run: |
          npm run build
          npm run generate:illustrations
          npm run optimize:images
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Performance Optimization

### 1. Image Optimization
```bash
# In build process
sharp input.jpg --resize 800 --webp --quality 85 --output output.webp
```

### 2. CSS Critical Path
```javascript
// Extract critical CSS for above-the-fold content
import { extract } from '@fullhuman/postcss-purgecss';

const critical = await extract({
  content: ['dist/**/*.html'],
  css: ['dist/assets/css/*.css']
});
```

### 3. Preloading
```html
<link rel="preload" href="/assets/fonts/primary.woff2" as="font" crossorigin>
<link rel="preload" href="/assets/css/base.css" as="style">
```

## Conclusion

This static implementation provides:
- **Professional aesthetics** matching modern news sites
- **Zero server costs** using static hosting
- **Excellent performance** with pre-rendered content
- **Easy maintenance** through markdown files
- **Scalability** via CDN distribution
- **Full customization** without platform constraints

The result is a beautiful, functional news/blog site that rivals any dynamic CMS while maintaining the simplicity and cost-effectiveness of static generation.
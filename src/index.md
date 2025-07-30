---
title: Home
---

<style>
  @import url("/_theme/assets/css/base.css");
  @import url("/_theme/assets/css/cards.css");
  
  /* Hero section */
  .hero {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, var(--color-teal-dark) 0%, var(--color-teal) 100%);
    color: white;
    margin: -2rem -2rem 3rem -2rem;
  }
  
  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: white;
  }
  
  .hero p {
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.95;
  }
  
  /* Focus areas */
  .focus-areas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 3rem 0;
  }
  
  .focus-card {
    background: var(--color-surface);
    padding: 2rem;
    border-radius: 0.5rem;
    text-align: center;
    transition: transform 0.2s;
  }
  
  .focus-card:hover {
    transform: translateY(-4px);
  }
  
  .focus-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  /* Content sections */
  .content-section {
    margin: 4rem 0;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .section-header h2 {
    margin: 0;
  }
  
  .view-all {
    color: var(--color-teal);
    text-decoration: none;
    font-weight: 500;
  }
  
  .view-all:hover {
    text-decoration: underline;
  }
</style>

<div class="hero">
  <h1>Climate Policy Platform</h1>
  <p>Access cutting-edge research, real-time data dashboards, and policy insights on climate action and sustainable development.</p>
</div>

```js
// Load all content with error handling
let reports = [];
let dashboards = [];
let articles = [];

try {
  reports = await FileAttachment("/data/all-reports.json").json();
  if (!Array.isArray(reports)) {
    console.error('Invalid reports data - expected array');
    reports = [];
  }
} catch (error) {
  console.error('Failed to load reports:', error);
}

try {
  dashboards = await FileAttachment("/data/dashboards-list.json").json();
  if (!Array.isArray(dashboards)) {
    console.error('Invalid dashboards data - expected array');
    dashboards = [];
  }
} catch (error) {
  console.error('Failed to load dashboards:', error);
}

try {
  articles = await FileAttachment("/data/news-articles.json").json();
  if (!Array.isArray(articles)) {
    console.error('Invalid articles data - expected array');
    articles = [];
  }
} catch (error) {
  console.error('Failed to load articles:', error);
}

// Get latest content with fallback
const latestReports = reports.slice(0, 3);
const latestDashboards = dashboards.slice(0, 2);
const latestArticles = articles.slice(0, 3);

// Pre-load all illustration URLs
const illustrations = {
  'climate-finance.svg': await FileAttachment('climate-finance.svg').url(),
  'ocean-waves.svg': await FileAttachment('ocean-waves.svg').url(),
  'pacific-summit.svg': await FileAttachment('pacific-summit.svg').url(),
  'coral-reef.svg': await FileAttachment('coral-reef.svg').url(),
  'data-flow.svg': await FileAttachment('data-flow.svg').url(),
  'global-network.svg': await FileAttachment('global-network.svg').url(),
  'policy-document.svg': await FileAttachment('policy-document.svg').url(),
  'renewable-energy.svg': await FileAttachment('renewable-energy.svg').url()
};

// Add illustration URLs to items
for (const report of latestReports) {
  if (report.illustration && illustrations[report.illustration]) {
    report.illustrationUrl = illustrations[report.illustration];
  }
}

for (const dashboard of latestDashboards) {
  if (dashboard.illustration && illustrations[dashboard.illustration]) {
    dashboard.illustrationUrl = illustrations[dashboard.illustration];
  }
}

for (const article of latestArticles) {
  if (article.illustration && illustrations[article.illustration]) {
    article.illustrationUrl = illustrations[article.illustration];
  }
}
```

## Our Focus Areas

<div class="focus-areas">
  <div class="focus-card">
    <div class="focus-icon">💰</div>
    <h3>Climate Finance</h3>
    <p>Tracking global flows and identifying gaps in climate funding</p>
  </div>
  <div class="focus-card">
    <div class="focus-icon">🌊</div>
    <h3>Ocean Conservation</h3>
    <p>Monitoring health indicators across the Pacific region</p>
  </div>
  <div class="focus-card">
    <div class="focus-icon">📊</div>
    <h3>Policy Analysis</h3>
    <p>Evidence-based recommendations for climate action</p>
  </div>
  <div class="focus-card">
    <div class="focus-icon">📈</div>
    <h3>Data Visualization</h3>
    <p>Interactive tools for exploring complex datasets</p>
  </div>
</div>

```js
// Display latest reports
display(html`
  <div class="content-section">
    <div class="section-header">
      <h2>Latest Reports</h2>
      <a href="/reports/" class="view-all">View all reports →</a>
    </div>
    <div class="news-grid">
      ${latestReports.map(report => html`
        <a href="${report.url}" class="news-card news-card--report">
          <div class="news-card__header">
            ${report.illustration ? html`
              <div class="news-card__illustration">
                <img src="${report.illustrationUrl}" alt="">
              </div>
            ` : ''}
            ${(report.hasDoi || report.hasPdf) ? html`
              <div class="news-card__badges">
                ${report.hasDoi ? html`<span class="badge badge--doi">DOI</span>` : ''}
                ${report.hasPdf ? html`<span class="badge badge--pdf">PDF</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="news-card__body">
            <span class="news-card__type">Report</span>
            <h3 class="news-card__title">${report.title}</h3>
            <p class="news-card__excerpt">${report.excerpt}</p>
            <div class="news-card__meta">
              <span class="news-card__date">${report.dateFormatted}</span>
              ${report.read_time ? html`
                <span class="news-card__read-time">${report.read_time}</span>
              ` : ''}
            </div>
          </div>
        </a>
      `)}
    </div>
  </div>
`);
```

```js
// Display latest dashboards
display(html`
  <div class="content-section">
    <div class="section-header">
      <h2>Interactive Dashboards</h2>
      <a href="/dashboards/" class="view-all">View all dashboards →</a>
    </div>
    <div class="news-grid">
      ${latestDashboards.map(dashboard => html`
        <a href="${dashboard.url}" class="news-card news-card--dashboard">
          <div class="news-card__header">
            ${dashboard.illustration ? html`
              <div class="news-card__illustration">
                <img src="${dashboard.illustrationUrl}" alt="">
              </div>
            ` : ''}
          </div>
          <div class="news-card__body">
            <span class="news-card__type">Dashboard</span>
            <h3 class="news-card__title">${dashboard.title}</h3>
            <p class="news-card__excerpt">${dashboard.excerpt}</p>
            <div class="news-card__meta">
              <span class="news-card__date">Updated ${dashboard.dateFormatted}</span>
            </div>
          </div>
        </a>
      `)}
    </div>
  </div>
`);
```

```js
// Display latest news
display(html`
  <div class="content-section">
    <div class="section-header">
      <h2>Latest News & Insights</h2>
      <a href="/news/" class="view-all">View all news →</a>
    </div>
    <div class="news-grid">
      ${latestArticles.map(article => html`
        <a href="${article.url}" class="news-card news-card--${article.type}">
          <div class="news-card__header">
            ${article.illustration ? html`
              <div class="news-card__illustration">
                <img src="${article.illustrationUrl}" alt="">
              </div>
            ` : ''}
          </div>
          <div class="news-card__body">
            <span class="news-card__type">${article.type}</span>
            <h3 class="news-card__title">${article.title}</h3>
            <p class="news-card__excerpt">${article.excerpt}</p>
            <div class="news-card__meta">
              <span class="news-card__date">${article.dateFormatted}</span>
              ${article.read_time ? html`
                <span class="news-card__read-time">${article.read_time}</span>
              ` : ''}
            </div>
          </div>
        </a>
      `)}
    </div>
  </div>
`);
```
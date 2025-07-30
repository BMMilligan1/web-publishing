---
title: Research Reports
---

<style>
  @import url("/_theme/assets/css/base.css");
  @import url("/_theme/assets/css/cards.css");
  
  .reports-header {
    text-align: center;
    padding: 3rem 0;
    background: var(--color-surface);
    margin: -2rem -2rem 2rem -2rem;
  }
  
  .reports-description {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    max-width: 600px;
    margin: 1rem auto 0;
  }
  
  .reports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .filter-bar {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
    flex-wrap: wrap;
  }
  
  .filter-button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    background: var(--color-white);
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .filter-button:hover {
    background: var(--color-surface);
  }
  
  .filter-button.active {
    background: var(--color-teal);
    color: white;
    border-color: var(--color-teal);
  }
</style>

<div class="reports-header">
  <h1>Research Reports</h1>
  <p class="reports-description">
    Our comprehensive research reports provide in-depth analysis of climate policy, ocean science, and sustainable development topics.
  </p>
</div>

```js
// Load reports data
const reports = await FileAttachment("/data/all-reports.json").json();
const tags = [...new Set(reports.flatMap(r => r.tags || []))];

// Pre-load illustration URLs
const illustrations = {
  'climate-finance.svg': await FileAttachment('../climate-finance.svg').url(),
  'ocean-waves.svg': await FileAttachment('../ocean-waves.svg').url(),
  'pacific-summit.svg': await FileAttachment('../pacific-summit.svg').url(),
  'coral-reef.svg': await FileAttachment('../coral-reef.svg').url(),
  'data-flow.svg': await FileAttachment('../data-flow.svg').url()
};

// Add illustration URLs to reports
for (const report of reports) {
  if (report.illustration && illustrations[report.illustration]) {
    report.illustrationUrl = illustrations[report.illustration];
  }
}

// Create reactive filter state
const selectedTag = view(Inputs.select([null, ...tags], {
  label: "Filter by topic:",
  format: (tag) => tag || "All topics"
}));

// Filter reports based on selection
const filteredReports = selectedTag 
  ? reports.filter(r => r.tags && r.tags.includes(selectedTag))
  : reports;
```

<div class="news-grid">
  ${filteredReports.map(report => html`
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
          ${report.authors ? html`
            <span class="news-card__authors">${report.authors.join(", ")}</span>
          ` : ''}
        </div>
        ${report.tags ? html`
          <div class="news-card__tags">
            ${report.tags.slice(0, 3).map(tag => html`
              <span class="tag">${tag}</span>
            `)}
          </div>
        ` : ''}
      </div>
    </a>
  `)}
</div>

${filteredReports.length === 0 ? html`
  <div style="text-align: center; padding: 3rem 0; color: var(--color-text-secondary);">
    <p>No reports found for the selected topic.</p>
  </div>
` : ''}
---
title: News & Insights
---

<style>
  @import url("/_theme/assets/css/base.css");
  @import url("/_theme/assets/css/cards.css");
  
  /* Page specific styles */
  .news-header {
    text-align: center;
    padding: 3rem 0;
    background: var(--color-surface);
    margin: -2rem -2rem 2rem -2rem;
  }
  
  .news-description {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    max-width: 600px;
    margin: 1rem auto 0;
  }
</style>

<div class="news-header">
  <h1>News & Insights</h1>
  <p class="news-description">
    Latest updates, analysis, and insights on climate policy and sustainable development
  </p>
</div>

```js
// Load news articles data
const articles = await FileAttachment("/data/news-articles.json").json();
const featured = articles.filter(a => a.featured);
const regular = articles.filter(a => !a.featured);

// Pre-load illustration URLs
const illustrations = {
  'climate-finance.svg': await FileAttachment('../climate-finance.svg').url(),
  'ocean-waves.svg': await FileAttachment('../ocean-waves.svg').url(),
  'pacific-summit.svg': await FileAttachment('../pacific-summit.svg').url(),
  'coral-reef.svg': await FileAttachment('../coral-reef.svg').url(),
  'data-flow.svg': await FileAttachment('../data-flow.svg').url()
};

// Add illustration URLs to articles
for (const article of articles) {
  if (article.illustration && illustrations[article.illustration]) {
    article.illustrationUrl = illustrations[article.illustration];
  }
}
```

<div class="news-page">
  ${featured.length > 0 ? html`
    <section class="featured-section">
      <h2>Featured</h2>
      <div class="news-grid">
        ${featured.map(article => html`
          <a href="${article.url}" class="news-card news-card--featured news-card--${article.type}">
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
              ${article.tags ? html`
                <div class="news-card__tags">
                  ${article.tags.slice(0, 3).map(tag => html`
                    <span class="tag">${tag}</span>
                  `)}
                </div>
              ` : ''}
            </div>
          </a>
        `)}
      </div>
    </section>
  ` : ''}
  
  <section class="all-content">
    <h2>All Articles</h2>
    <div class="news-grid">
      ${regular.map(article => html`
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
            ${article.tags ? html`
              <div class="news-card__tags">
                ${article.tags.slice(0, 3).map(tag => html`
                  <span class="tag">${tag}</span>
                `)}
              </div>
            ` : ''}
          </div>
        </a>
      `)}
    </div>
  </section>
</div>
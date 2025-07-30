---
title: Interactive Dashboards
---

<style>
  @import url("/_theme/assets/css/base.css");
  @import url("/_theme/assets/css/cards.css");
  
  .dashboards-header {
    text-align: center;
    padding: 3rem 0;
    background: var(--color-surface);
    margin: -2rem -2rem 2rem -2rem;
  }
  
  .dashboards-description {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    max-width: 600px;
    margin: 1rem auto 0;
  }
  
  .dashboards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .dashboard-card {
    background: var(--color-surface);
    border-radius: 0.5rem;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid var(--color-border);
  }
  
  .dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  
  .dashboard-card__header {
    position: relative;
    height: 200px;
    background: linear-gradient(135deg, var(--color-teal-dark) 0%, var(--color-teal) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .dashboard-card__illustration {
    width: 120px;
    height: 120px;
    opacity: 0.9;
  }
  
  .dashboard-card__body {
    padding: 1.5rem;
  }
  
  .dashboard-card__title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: var(--color-text-primary);
  }
  
  .dashboard-card__excerpt {
    color: var(--color-text-secondary);
    margin: 0 0 1rem 0;
  }
  
  .dashboard-card__meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }
  
  .dashboard-card__meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .view-dashboard {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--color-teal);
    color: white;
    text-decoration: none;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }
  
  .view-dashboard:hover {
    background: var(--color-teal-dark);
  }
</style>

<div class="dashboards-header">
  <h1>Interactive Dashboards</h1>
  <p class="dashboards-description">
    Explore real-time data and interactive visualizations for ocean health, climate finance, and environmental indicators.
  </p>
</div>

```js
// Load dashboards data
const dashboards = await FileAttachment("/data/dashboards-list.json").json();

// Pre-load illustration URLs
const illustrations = {
  'ocean-waves.svg': await FileAttachment('../ocean-waves.svg').url(),
  'data-flow.svg': await FileAttachment('../data-flow.svg').url(),
  'climate-finance.svg': await FileAttachment('../climate-finance.svg').url()
};

// Add illustration URLs to dashboards
for (const dashboard of dashboards) {
  if (dashboard.illustration && illustrations[dashboard.illustration]) {
    dashboard.illustrationUrl = illustrations[dashboard.illustration];
  }
}

// Calculate relative update times
function getRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 7) return `Updated ${days} days ago`;
  if (days < 30) return `Updated ${Math.floor(days / 7)} weeks ago`;
  return `Updated ${then.toLocaleDateString()}`;
}
```

<div class="dashboards-grid">
  ${dashboards.map(dashboard => html`
    <div class="dashboard-card">
      <div class="dashboard-card__header">
        ${dashboard.illustration ? html`
          <img src="${dashboard.illustrationUrl}" 
               alt="" 
               class="dashboard-card__illustration">
        ` : ''}
      </div>
      <div class="dashboard-card__body">
        <h3 class="dashboard-card__title">${dashboard.title}</h3>
        <p class="dashboard-card__excerpt">${dashboard.excerpt}</p>
        <div class="dashboard-card__meta">
          <div class="dashboard-card__meta-item">
            📅 ${getRelativeTime(dashboard.date)}
          </div>
          ${dashboard.update_frequency ? html`
            <div class="dashboard-card__meta-item">
              🔄 Updates: ${dashboard.update_frequency}
            </div>
          ` : ''}
          ${dashboard.data_sources ? html`
            <div class="dashboard-card__meta-item">
              📊 Sources: ${dashboard.data_sources.join(", ")}
            </div>
          ` : ''}
        </div>
        <a href="${dashboard.url}" class="view-dashboard">View Dashboard →</a>
      </div>
    </div>
  `)}
</div>

## Featured Visualizations

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0;">
  <div style="background: var(--color-surface); padding: 2rem; border-radius: 0.5rem;">
    <h3>🌊 Ocean Temperature Anomalies</h3>
    <p>Track real-time changes in ocean surface temperatures across the Pacific region.</p>
  </div>
  <div style="background: var(--color-surface); padding: 2rem; border-radius: 0.5rem;">
    <h3>💰 Climate Finance Flows</h3>
    <p>Visualize funding streams from developed to developing nations for climate action.</p>
  </div>
  <div style="background: var(--color-surface); padding: 2rem; border-radius: 0.5rem;">
    <h3>🐠 Marine Biodiversity Index</h3>
    <p>Monitor ecosystem health through species diversity and population trends.</p>
  </div>
</div>
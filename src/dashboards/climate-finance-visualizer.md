---
title: Climate Finance Flow Visualizer
date: 2024-01-25
type: dashboard
excerpt: Interactive visualization of global climate finance flows between countries and sectors.
tags:
  - finance
  - visualization
  - interactive
update_frequency: Monthly
data_sources:
  - OECD
  - World Bank
  - Climate Funds Update
---

# Climate Finance Flow Visualizer

<style>
  .dashboard-header {
    background: linear-gradient(135deg, var(--color-teal-dark) 0%, var(--color-teal) 100%);
    color: white;
    padding: 2rem;
    margin: -2rem -2rem 2rem -2rem;
  }
  
  .dashboard-header h1 {
    color: white;
    margin: 0;
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .metric-card {
    background: var(--color-surface);
    padding: 1.5rem;
    border-radius: 0.5rem;
    text-align: center;
  }
  
  .metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-teal);
  }
  
  .metric-label {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
</style>

<div class="dashboard-header">
  <h1>Climate Finance Flow Visualizer</h1>
  <p>Track global climate finance commitments and disbursements in real-time</p>
</div>

## Key Metrics

<div class="metrics-grid">
  <div class="metric-card">
    <div class="metric-value">$83.3B</div>
    <div class="metric-label">Total Climate Finance (2023)</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">62%</div>
    <div class="metric-label">Mitigation vs Adaptation</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">147</div>
    <div class="metric-label">Recipient Countries</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">$12.4B</div>
    <div class="metric-label">Private Sector Mobilized</div>
  </div>
</div>

## Finance Flows by Region

```js
import {Plot} from "@observablehq/plot";

// Sample data for visualization
const financeData = [
  {region: "Sub-Saharan Africa", amount: 18.5, type: "Adaptation"},
  {region: "Sub-Saharan Africa", amount: 12.3, type: "Mitigation"},
  {region: "Asia-Pacific", amount: 15.2, type: "Adaptation"},
  {region: "Asia-Pacific", amount: 28.7, type: "Mitigation"},
  {region: "Latin America", amount: 8.4, type: "Adaptation"},
  {region: "Latin America", amount: 16.9, type: "Mitigation"},
  {region: "MENA", amount: 6.7, type: "Adaptation"},
  {region: "MENA", amount: 10.2, type: "Mitigation"}
];

display(Plot.plot({
  marginLeft: 120,
  x: {label: "Amount (USD Billions)"},
  y: {label: null},
  color: {
    domain: ["Adaptation", "Mitigation"],
    range: ["#4fd1c5", "#319795"]
  },
  marks: [
    Plot.barX(financeData, {
      x: "amount",
      y: "region",
      fill: "type",
      sort: {y: "x", reverse: true}
    }),
    Plot.gridX({stroke: "var(--color-border)", strokeOpacity: 0.5}),
    Plot.ruleX([0])
  ]
}));
```

## Top Donor Countries

```js
const donorData = [
  {country: "United States", amount: 11.4},
  {country: "Germany", amount: 10.2},
  {country: "Japan", amount: 9.8},
  {country: "France", amount: 7.6},
  {country: "United Kingdom", amount: 6.3},
  {country: "Canada", amount: 4.2},
  {country: "Netherlands", amount: 3.8},
  {country: "Norway", amount: 3.5}
];

display(Plot.plot({
  marginLeft: 120,
  x: {label: "Committed Amount (USD Billions)"},
  y: {label: null},
  marks: [
    Plot.barX(donorData, {
      x: "amount",
      y: "country",
      fill: "var(--color-teal)",
      sort: {y: "x", reverse: true}
    }),
    Plot.text(donorData, {
      x: "amount",
      y: "country",
      text: d => `$${d.amount}B`,
      textAnchor: "start",
      dx: 3
    })
  ]
}));
```

## Data Sources & Methodology

This dashboard aggregates data from:
- **OECD DAC**: Development finance statistics
- **World Bank**: Climate finance tracking
- **Climate Funds Update**: Independent climate finance data

Last updated: January 25, 2024
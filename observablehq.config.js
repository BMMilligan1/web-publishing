// See https://observablehq.com/framework/config for documentation.
import MarkdownItFootnote from "markdown-it-footnote";

export default {
  // The app's title; used in the sidebar and webpage titles.
  title: "Climate Policy Platform",
  
  // Configure markdown-it plugins
  markdownIt: (md) => md.use(MarkdownItFootnote),

  // Organize pages into sections
  pages: [
    {
      name: "Home",
      path: "/"
    },
    {
      name: "Reports",
      pages: [
        {name: "Climate Finance Flows", path: "/reports/2024-climate-finance-flows"}
      ]
    },
    {
      name: "Dashboards", 
      pages: [
        {name: "Ocean Health Tracker", path: "/dashboards/ocean-health-tracker"}
      ]
    },
    {
      name: "News",
      pages: [
        {name: "All Articles", path: "/news/"},
        {name: "Pacific Climate Summit", path: "/news/2024-01-25-pacific-climate-summit"}
      ]
    }
  ],

  // Enhanced head content with custom CSS
  head: `
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/_theme/assets/css/base.css">
    <link rel="stylesheet" href="/_theme/assets/css/cards.css">
    <link rel="stylesheet" href="/_theme/assets/css/viz.css">
    <link rel="stylesheet" href="/_theme/assets/css/print.css" media="print">
    <!-- Custom fonts if needed -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <style>
      /* Override Observable defaults */
      :root {
        --theme-foreground: var(--color-text-primary, #1a202c);
        --theme-background: var(--color-background, #ffffff);
      }
      
      /* Hide Observable UI elements for cleaner look */
      .observablehq-link svg { display: none; } /* Remove Observable logo */
      
      /* Custom header styling */
      #observablehq-header {
        background: var(--color-white);
        border-bottom: 1px solid var(--color-border);
        padding: 1rem 0;
      }
      
      /* Enhance content area */
      #observablehq-main {
        max-width: 1200px;
        margin: 0 auto;
      }
      
      /* Sidebar customization */
      #observablehq-sidebar {
        background: var(--color-surface);
      }
    </style>
  `,

  // The path to the source root.
  root: "src",

  // Theme configuration
  theme: ["air", "near-midnight"], // Light and dark themes
  
  // Custom header
  header: `
    <div style="display: flex; align-items: center; gap: 2rem; padding: 0 1rem;">
      <a href="/" style="text-decoration: none; color: var(--color-teal, #319795); font-weight: 600; font-size: 1.25rem;">
        Climate Policy Platform
      </a>
      <nav style="margin-left: auto; display: flex; gap: 1.5rem;">
        <a href="/reports/" style="text-decoration: none; color: var(--theme-foreground);">Reports</a>
        <a href="/dashboards/" style="text-decoration: none; color: var(--theme-foreground);">Dashboards</a>
        <a href="/news/" style="text-decoration: none; color: var(--theme-foreground);">News</a>
      </nav>
    </div>
  `,
  
  footer: `
    <div style="text-align: center; padding: 2rem 0; color: var(--theme-foreground-faint);">
      <p>© ${new Date().getFullYear()} Climate Policy Platform. 
      Part of the Centre for Sustainable Development Reform.</p>
    </div>
  `,
  
  // Enable features
  sidebar: true,
  toc: true,
  pager: true,
  search: true,
  
  // Output configuration
  output: "dist",
  
  // URL handling
  cleanUrls: true,
};

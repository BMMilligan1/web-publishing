// Client-side visualization loader for Observable Framework
import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";

class VizLoader {
  constructor() {
    this.runtime = new Runtime();
    this.loadedModules = new Map();
    this.observers = new Map();
    
    // Bind methods
    this.loadVisualization = this.loadVisualization.bind(this);
    this.observeResize = this.observeResize.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }
  
  async loadVisualization(containerId, modulePath, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container not found: ${containerId}`);
      return null;
    }
    
    // Check if module already loaded
    if (this.loadedModules.has(modulePath)) {
      console.log(`Module already loaded: ${modulePath}`);
      return this.loadedModules.get(modulePath);
    }
    
    try {
      // Show loading state
      container.classList.add('viz-mount-point--loading');
      
      // Remove static fallback if present
      const staticFallback = container.querySelector('.static-viz-fallback');
      if (staticFallback) {
        staticFallback.style.display = 'none';
      }
      
      // Dynamic import of Observable module
      console.log(`Loading visualization: ${modulePath}`);
      const module = await import(modulePath);
      
      // Create inspector
      const inspector = Inspector.into(container);
      
      // Create module instance
      const main = this.runtime.module(module.default || module, (name) => {
        // Only show specific cells (chart, map, etc.)
        if (name === "chart" || name === "map" || name === "visualization" || name === "plot") {
          return inspector();
        }
        // Hide other cells
        return true;
      });
      
      // Store module reference
      this.loadedModules.set(modulePath, main);
      
      // Remove loading state
      container.classList.remove('viz-mount-point--loading');
      
      // Handle responsive sizing
      this.observeResize(container, main);
      
      // Apply initial configuration
      if (config.width) {
        main.redefine("width", config.width);
      }
      
      // Listen for filter changes if dashboard
      if (container.dataset.vizInline !== 'true') {
        window.addEventListener('filtersChanged', (event) => {
          this.handleFilterChange(main, event.detail);
        });
      }
      
      console.log(`✓ Loaded visualization: ${modulePath}`);
      return main;
      
    } catch (error) {
      console.error(`Failed to load visualization: ${modulePath}`, error);
      
      // Show error state
      container.classList.remove('viz-mount-point--loading');
      container.innerHTML = `
        <div class="viz-error">
          <p>Failed to load visualization</p>
          <p class="error-details">${error.message}</p>
        </div>
      `;
      
      return null;
    }
  }
  
  observeResize(container, main) {
    // Create ResizeObserver for responsive charts
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        
        // Update width variable in Observable module
        if (width > 0) {
          try {
            main.redefine("width", width);
          } catch (e) {
            // Module might not have a width variable
          }
        }
      }
    });
    
    resizeObserver.observe(container);
    this.observers.set(container, resizeObserver);
  }
  
  handleFilterChange(main, filters) {
    // Update filter variables in Observable module
    try {
      if (filters.dateRange) {
        main.redefine("dateRange", filters.dateRange);
      }
      if (filters.region) {
        main.redefine("region", filters.region);
      }
      // Add more filter types as needed
    } catch (e) {
      // Module might not have these filter variables
    }
  }
  
  // Lazy load visualizations when they come into view
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.01
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const modulePath = container.dataset.vizModule;
          const configStr = container.dataset.vizConfig;
          
          if (modulePath && !this.loadedModules.has(modulePath)) {
            let config = {};
            try {
              config = configStr ? JSON.parse(configStr) : {};
            } catch (e) {
              console.warn('Invalid viz config:', e);
            }
            
            this.loadVisualization(container.id, modulePath, config);
            observer.unobserve(container);
          }
        }
      });
    }, options);
    
    // Observe all visualization containers
    document.querySelectorAll('[data-viz-module]').forEach(container => {
      observer.observe(container);
    });
  }
  
  // Clean up observers
  cleanup() {
    this.observers.forEach((observer, container) => {
      observer.disconnect();
    });
    this.observers.clear();
    
    this.loadedModules.forEach(module => {
      // Observable modules don't have a specific cleanup method
      // but we can clear the reference
    });
    this.loadedModules.clear();
  }
}

// Initialize on DOM ready
let vizLoader;

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing visualization loader...');
  
  vizLoader = new VizLoader();
  
  // Setup lazy loading for visualizations
  vizLoader.setupIntersectionObserver();
  
  // Load any visualizations that are immediately visible
  const immediateContainers = document.querySelectorAll('[data-viz-module][data-viz-immediate="true"]');
  immediateContainers.forEach(container => {
    const modulePath = container.dataset.vizModule;
    vizLoader.loadVisualization(container.id, modulePath);
  });
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (vizLoader) {
    vizLoader.cleanup();
  }
});

// Export for use in other scripts
window.VizLoader = VizLoader;
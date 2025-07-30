#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import { Runtime, Inspector } from '@observablehq/runtime';
import * as d3 from 'd3';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

// Configure JSDOM for server-side rendering
function setupDOM() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    pretendToBeVisual: true,
    resources: 'usable'
  });
  
  // Use Object.defineProperty for read-only globals
  Object.defineProperty(global, 'window', {
    value: dom.window,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(global, 'document', {
    value: dom.window.document,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    writable: true,
    configurable: true
  });
  
  // These are typically writable
  global.requestAnimationFrame = dom.window.requestAnimationFrame;
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame;
  
  // Add D3 to global scope for Observable modules
  global.d3 = d3;
  
  return dom;
}

// Load and process Observable module
async function processObservableModule(modulePath, config = {}) {
  console.log(`Processing Observable module: ${modulePath}`);
  
  try {
    // Dynamic import of the module
    const module = await import(join(rootDir, 'src', modulePath));
    
    // Create container for rendering
    const container = document.createElement('div');
    container.id = 'observable-render';
    document.body.appendChild(container);
    
    // Create runtime and module
    const runtime = new Runtime();
    const main = runtime.module(module.default || module, Inspector.into(container));
    
    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract the rendered SVG or HTML
    const svg = container.querySelector('svg');
    const content = svg ? svg.outerHTML : container.innerHTML;
    
    // Clean up
    document.body.removeChild(container);
    
    return {
      success: true,
      content,
      type: svg ? 'svg' : 'html'
    };
  } catch (error) {
    console.error(`Error processing module ${modulePath}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Process all content files
async function processAllContent() {
  console.log('Starting Observable content processing...');
  
  // Setup DOM environment
  try {
    setupDOM();
  } catch (error) {
    console.error('Failed to setup DOM environment:', error);
    return;
  }
  
  // Find all markdown files with visualizations
  const contentDirs = ['reports', 'dashboards', 'news'];
  const processedFiles = [];
  
  for (const dir of contentDirs) {
    const dirPath = join(rootDir, 'src', dir);
    
    try {
      const files = await readdir(dirPath);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      for (const file of mdFiles) {
        const filePath = join(dirPath, file);
        const content = await readFile(filePath, 'utf-8');
        const { data, content: markdown } = matter(content);
        
        if (data.has_visualizations && data.visualization_modules) {
          console.log(`Processing visualizations for: ${file}`);
          
          const staticVisualizations = [];
          
          for (const vizModule of data.visualization_modules) {
            try {
              const result = await processObservableModule(vizModule, {
                width: data.viz_width || 800,
                height: data.viz_height || 500
              });
              
              if (result.success) {
                staticVisualizations.push(result.content);
              } else {
                // Add placeholder for failed visualizations
                console.warn(`Visualization failed for ${vizModule}: ${result.error}`);
                staticVisualizations.push(`
                  <div class="viz-error">
                    <p>Failed to render visualization: ${vizModule}</p>
                    <p>${result.error}</p>
                  </div>
                `);
              }
            } catch (error) {
              // Catch any unexpected errors
              console.error(`Error processing visualization ${vizModule}:`, error);
              staticVisualizations.push(`
                <div class="viz-error">
                  <p>Error loading visualization: ${vizModule}</p>
                  <p>${error.message}</p>
                </div>
              `);
            }
          }
          
          // Save static visualizations
          const outputDir = join(rootDir, 'dist', '_static-viz', dir);
          await mkdir(outputDir, { recursive: true });
          
          const outputPath = join(outputDir, `${file}.json`);
          await writeFile(outputPath, JSON.stringify({
            file: file,
            visualizations: staticVisualizations,
            processed: new Date().toISOString()
          }, null, 2));
          
          processedFiles.push({
            file: filePath,
            visualizations: staticVisualizations.length
          });
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dir}:`, error);
    }
  }
  
  // Generate manifest
  const manifestPath = join(rootDir, 'dist', '_static-viz', 'manifest.json');
  await writeFile(manifestPath, JSON.stringify({
    processed: processedFiles,
    timestamp: new Date().toISOString(),
    total: processedFiles.length
  }, null, 2));
  
  console.log(`\nProcessing complete!`);
  console.log(`Processed ${processedFiles.length} files with visualizations`);
}

// Create a simple Observable module for testing
async function createTestModule() {
  const testModulePath = join(rootDir, 'src', 'components', 'test-chart.js');
  const testModule = `
export default function define(runtime, observer) {
  const main = runtime.module();
  
  main.variable(observer("chart")).define("chart", ["d3"], function(d3) {
    const width = 640;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};
    
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);
    
    // Sample data
    const data = [
      {x: 0, y: 20},
      {x: 1, y: 35},
      {x: 2, y: 30},
      {x: 3, y: 45},
      {x: 4, y: 40}
    ];
    
    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height - margin.bottom, margin.top]);
    
    // Line generator
    const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));
    
    // Add axes
    svg.append("g")
        .attr("transform", \`translate(0,\${height - margin.bottom})\`)
        .call(d3.axisBottom(x));
    
    svg.append("g")
        .attr("transform", \`translate(\${margin.left},0)\`)
        .call(d3.axisLeft(y));
    
    // Add line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#319795")
        .attr("stroke-width", 2)
        .attr("d", line);
    
    // Add dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 4)
        .attr("fill", "#319795");
    
    return svg.node();
  });
  
  return main;
}
`;
  
  await mkdir(dirname(testModulePath), { recursive: true });
  await writeFile(testModulePath, testModule);
  console.log('Created test Observable module');
}

// Main execution
async function main() {
  try {
    // Create test module if needed
    await createTestModule();
    
    // Process all content
    await processAllContent();
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
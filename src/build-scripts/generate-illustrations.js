#!/usr/bin/env node

import { readdir, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as d3 from 'd3';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

// Color palette based on Design Colours.png
const COLORS = {
  slate: '#4a5568',
  tealDark: '#2c7a7b',
  teal: '#319795',
  turquoise: '#4fd1c5',
  aqua: '#81e6d9',
  mint: '#b2f5ea',
  white: '#ffffff',
  gray: '#e2e8f0'
};

// Illustration patterns
const PATTERNS = {
  'climate-finance': generateClimateFinance,
  'ocean-waves': generateOceanWaves,
  'pacific-summit': generatePacificSummit,
  'data-flow': generateDataFlow,
  'global-network': generateGlobalNetwork,
  'policy-document': generatePolicyDocument,
  'renewable-energy': generateRenewableEnergy,
  'coral-reef': generateCoralReef
};

// Setup DOM for D3
function setupDOM() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  return dom;
}

// Generate climate finance illustration
function generateClimateFinance() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Background circle
  svg.append('circle')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .attr('r', 80)
    .attr('fill', COLORS.mint)
    .attr('opacity', 0.3);
  
  // Dollar sign with arrow
  const g = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
  
  // Dollar sign
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-size', 48)
    .attr('font-weight', 'bold')
    .attr('fill', COLORS.white)
    .text('$');
  
  // Upward arrow
  const arrow = d3.line()
    .x(d => d[0])
    .y(d => d[1]);
  
  g.append('path')
    .attr('d', arrow([[20, -20], [35, -35], [35, -25], [45, -35], [35, -45], [35, -35]]))
    .attr('fill', COLORS.white)
    .attr('stroke', 'none');
  
  // Circular arrows around
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120) * Math.PI / 180;
    const x = Math.cos(angle) * 60;
    const y = Math.sin(angle) * 60;
    
    g.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 8)
      .attr('fill', COLORS.white)
      .attr('opacity', 0.7);
  }
  
  return svg.node().outerHTML;
}

// Generate ocean waves illustration
function generateOceanWaves() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Wave generator
  const waveData = d3.range(3).map(i => {
    const amplitude = 15 - i * 3;
    const frequency = 0.02 + i * 0.005;
    const phase = i * Math.PI / 3;
    
    return d3.range(0, width + 1).map(x => ({
      x: x,
      y: height / 2 + amplitude * Math.sin(frequency * x + phase) - i * 20
    }));
  });
  
  const line = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveBasis);
  
  // Draw waves
  waveData.forEach((wave, i) => {
    svg.append('path')
      .attr('d', line(wave))
      .attr('fill', 'none')
      .attr('stroke', COLORS.white)
      .attr('stroke-width', 3)
      .attr('opacity', 1 - i * 0.2);
  });
  
  // Add decorative circles (bubbles)
  const bubbles = d3.range(5).map(i => ({
    x: 30 + Math.random() * 140,
    y: 120 + Math.random() * 60,
    r: 3 + Math.random() * 5
  }));
  
  svg.selectAll('.bubble')
    .data(bubbles)
    .enter().append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.r)
    .attr('fill', COLORS.white)
    .attr('opacity', 0.4);
  
  return svg.node().outerHTML;
}

// Generate Pacific summit illustration
function generatePacificSummit() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Islands representation
  const islands = [
    { x: 50, y: 80, r: 15 },
    { x: 100, y: 60, r: 20 },
    { x: 150, y: 85, r: 18 },
    { x: 80, y: 120, r: 12 },
    { x: 130, y: 110, r: 16 }
  ];
  
  // Draw connections
  islands.forEach((island1, i) => {
    islands.slice(i + 1).forEach(island2 => {
      svg.append('line')
        .attr('x1', island1.x)
        .attr('y1', island1.y)
        .attr('x2', island2.x)
        .attr('y2', island2.y)
        .attr('stroke', COLORS.white)
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    });
  });
  
  // Draw islands
  islands.forEach(island => {
    svg.append('circle')
      .attr('cx', island.x)
      .attr('cy', island.y)
      .attr('r', island.r)
      .attr('fill', COLORS.white)
      .attr('opacity', 0.8);
  });
  
  // Central star (summit location)
  const star = d3.symbol()
    .type(d3.symbolStar)
    .size(400);
  
  svg.append('path')
    .attr('d', star)
    .attr('transform', `translate(100, 90)`)
    .attr('fill', COLORS.white);
  
  return svg.node().outerHTML;
}

// Generate data flow illustration
function generateDataFlow() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Create nodes
  const nodes = [
    { x: 50, y: 50, type: 'source' },
    { x: 150, y: 50, type: 'source' },
    { x: 100, y: 100, type: 'process' },
    { x: 50, y: 150, type: 'output' },
    { x: 150, y: 150, type: 'output' }
  ];
  
  // Draw connections with animation paths
  const connections = [
    [0, 2], [1, 2], [2, 3], [2, 4]
  ];
  
  connections.forEach(([from, to]) => {
    const x1 = nodes[from].x;
    const y1 = nodes[from].y;
    const x2 = nodes[to].x;
    const y2 = nodes[to].y;
    
    svg.append('path')
      .attr('d', `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 20} ${x2} ${y2}`)
      .attr('fill', 'none')
      .attr('stroke', COLORS.white)
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);
  });
  
  // Draw nodes
  nodes.forEach(node => {
    const shape = node.type === 'process' ? 'rect' : 'circle';
    
    if (shape === 'rect') {
      svg.append('rect')
        .attr('x', node.x - 15)
        .attr('y', node.y - 15)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', COLORS.white)
        .attr('rx', 4);
    } else {
      svg.append('circle')
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', 12)
        .attr('fill', COLORS.white);
    }
  });
  
  return svg.node().outerHTML;
}

// Generate additional illustrations
function generateGlobalNetwork() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Globe outline
  svg.append('circle')
    .attr('cx', 100)
    .attr('cy', 100)
    .attr('r', 70)
    .attr('fill', 'none')
    .attr('stroke', COLORS.white)
    .attr('stroke-width', 3);
  
  // Network points
  const points = d3.range(8).map(i => {
    const angle = (i * 45) * Math.PI / 180;
    const r = 50 + Math.random() * 20;
    return {
      x: 100 + Math.cos(angle) * r,
      y: 100 + Math.sin(angle) * r
    };
  });
  
  // Connect points
  points.forEach((p1, i) => {
    points.slice(i + 1).forEach(p2 => {
      if (Math.random() > 0.5) {
        svg.append('line')
          .attr('x1', p1.x)
          .attr('y1', p1.y)
          .attr('x2', p2.x)
          .attr('y2', p2.y)
          .attr('stroke', COLORS.white)
          .attr('stroke-width', 1)
          .attr('opacity', 0.3);
      }
    });
  });
  
  // Draw points
  points.forEach(p => {
    svg.append('circle')
      .attr('cx', p.x)
      .attr('cy', p.y)
      .attr('r', 4)
      .attr('fill', COLORS.white);
  });
  
  return svg.node().outerHTML;
}

function generatePolicyDocument() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Document shape
  svg.append('rect')
    .attr('x', 50)
    .attr('y', 30)
    .attr('width', 100)
    .attr('height', 140)
    .attr('fill', COLORS.white)
    .attr('rx', 4);
  
  // Document lines
  for (let i = 0; i < 5; i++) {
    svg.append('rect')
      .attr('x', 65)
      .attr('y', 50 + i * 20)
      .attr('width', 70)
      .attr('height', 3)
      .attr('fill', COLORS.teal)
      .attr('opacity', 0.3);
  }
  
  // Seal/badge
  svg.append('circle')
    .attr('cx', 130)
    .attr('cy', 140)
    .attr('r', 20)
    .attr('fill', COLORS.white);
  
  svg.append('path')
    .attr('d', d3.symbol().type(d3.symbolStar).size(200))
    .attr('transform', 'translate(130, 140)')
    .attr('fill', COLORS.teal);
  
  return svg.node().outerHTML;
}

function generateRenewableEnergy() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Sun
  svg.append('circle')
    .attr('cx', 60)
    .attr('cy', 60)
    .attr('r', 25)
    .attr('fill', COLORS.white);
  
  // Sun rays
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45) * Math.PI / 180;
    const x1 = 60 + Math.cos(angle) * 30;
    const y1 = 60 + Math.sin(angle) * 30;
    const x2 = 60 + Math.cos(angle) * 40;
    const y2 = 60 + Math.sin(angle) * 40;
    
    svg.append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('stroke', COLORS.white)
      .attr('stroke-width', 3);
  }
  
  // Wind turbine
  const turbineX = 140;
  const turbineY = 120;
  
  svg.append('rect')
    .attr('x', turbineX - 3)
    .attr('y', turbineY)
    .attr('width', 6)
    .attr('height', 50)
    .attr('fill', COLORS.white);
  
  // Turbine blades
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 - 90) * Math.PI / 180;
    svg.append('path')
      .attr('d', `M ${turbineX} ${turbineY} L ${turbineX + Math.cos(angle) * 30} ${turbineY + Math.sin(angle) * 30}`)
      .attr('stroke', COLORS.white)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');
  }
  
  return svg.node().outerHTML;
}

function generateCoralReef() {
  const width = 200;
  const height = 200;
  
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  
  // Coral branches
  const drawCoral = (x, y, size) => {
    const g = svg.append('g')
      .attr('transform', `translate(${x}, ${y})`);
    
    // Main stem
    g.append('path')
      .attr('d', `M 0 0 Q -5 -${size} 0 -${size * 2}`)
      .attr('fill', 'none')
      .attr('stroke', COLORS.white)
      .attr('stroke-width', 3);
    
    // Branches
    for (let i = 0; i < 3; i++) {
      const branchY = -size * 0.6 * (i + 1);
      g.append('path')
        .attr('d', `M 0 ${branchY} Q -10 ${branchY - 10} -15 ${branchY - 5}`)
        .attr('fill', 'none')
        .attr('stroke', COLORS.white)
        .attr('stroke-width', 2);
      
      g.append('path')
        .attr('d', `M 0 ${branchY} Q 10 ${branchY - 10} 15 ${branchY - 5}`)
        .attr('fill', 'none')
        .attr('stroke', COLORS.white)
        .attr('stroke-width', 2);
    }
  };
  
  // Draw multiple coral formations
  drawCoral(50, 150, 30);
  drawCoral(100, 160, 35);
  drawCoral(150, 155, 28);
  
  // Add fish silhouettes
  const fish = svg.append('g')
    .attr('transform', 'translate(100, 80)');
  
  fish.append('ellipse')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('rx', 15)
    .attr('ry', 8)
    .attr('fill', COLORS.white);
  
  fish.append('path')
    .attr('d', 'M 10 0 L 20 -5 L 20 5 Z')
    .attr('fill', COLORS.white);
  
  return svg.node().outerHTML;
}

// Generate all illustrations
async function generateAllIllustrations() {
  console.log('Generating illustrations...\n');
  
  setupDOM();
  
  const outputDir = join(rootDir, 'src', '_theme', 'assets', 'illustrations');
  await mkdir(outputDir, { recursive: true });
  
  const results = [];
  
  for (const [name, generator] of Object.entries(PATTERNS)) {
    try {
      const svg = generator();
      const filePath = join(outputDir, `${name}.svg`);
      
      await writeFile(filePath, svg);
      console.log(`✓ Generated: ${name}.svg`);
      
      results.push({
        name,
        success: true,
        path: filePath
      });
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
      results.push({
        name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Generate summary
  const summary = {
    generated: new Date().toISOString(),
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    illustrations: results
  };
  
  const summaryPath = join(outputDir, '_manifest.json');
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`\nIllustration Generation Complete!`);
  console.log(`Total: ${summary.total}`);
  console.log(`Successful: ${summary.successful}`);
  console.log(`Failed: ${summary.failed}`);
}

// Main execution
async function main() {
  try {
    await generateAllIllustrations();
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
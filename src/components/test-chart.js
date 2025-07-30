
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
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
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

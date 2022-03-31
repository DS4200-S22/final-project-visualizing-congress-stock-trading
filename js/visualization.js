var margin = {top: 40, right: 20, bottom: 20, left: 20},
  width = 800 - margin.left - margin.right,
  height = 445 - margin.top - margin.bottom;

// adds an svg within which to build
let svg = d3.select("#vis-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const svg2 = d3.select("#vis-container2")
                .append("svg")
                .attr("width", width + margin.left + margin.right + 100 )
                .attr("height", height - margin.top - margin.bottom)
                .attr("viewBox", [0, 0, width, height]); 

d3.csv("data/Purchase.csv").then((data) => {

  let data2 = data.slice(0,20);

  // stratifies the data for D3
  var root = d3.stratify()
    .id(function(d) { return d.name; }) // name of entity
    .parentId(function(d) {return d.parent; }) // name of parent
    (data2);
  root.sum(function(d) {return + d.value }) // numeric value

  // computes the coordinate position of each element
  d3.treemap()
      .size([width, height])
      .padding(4)
      (root)

  // Adds rectangles:
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .style("fill", "#69b3a2");

  // Adds the stock labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+15})    // +20 to adjust position (lower)
      .text(function(d){ return d.data.name})
      .attr("font-size", "10px")
      .attr("fill", "white")
})

const color = d3.scaleOrdinal()
                .domain(["Hon. Josh Gottheimer", "Hon. Gilbert Cisneros", "Hon. Susie Lee", "Hon. Alan S. Lowenthal", "Hon. Donna Shalala"])
                .range(["#426cf5", "#426cf5", "#426cf5", "#426cf5", "#426cf5"]);

d3.csv("data/Frequency.csv").then((data) => {

  let data3 = data.slice(0,20);

  let x1, y1;
  let xKey, yKey;

  xKey = "name";
  yKey = "frequency";

  // Find max x
  let maxX1 = d3.max(data3, (d) => { return d[xKey]; });

  let xScale1 = d3.scaleBand()
  .domain(d3.range(data.length))
  .range([margin.left, width - margin.right])
  .padding(0.1); 

  // Create X scale
  x1 = d3.scaleLinear()
              .domain([0,maxX1])
              .range([margin.left, width-margin.right]); 
  
  // Add x axis 
  svg2.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`) 
      .call(d3.axisBottom(xScale1).tickFormat(i => data[i].name))

      .attr("font-size", '10px')
      .call((g) => g.append("text")
                    .attr("x", width - margin.right)
                    .attr("y", margin.bottom - 4)
                    .attr("fill", "black")
                    .attr("text-anchor", "end")
                    .text(xKey)
    );

  // Finx max y 
  let maxY1 = d3.max(data, (d) => { return d[yKey]; }); 

  // Create y scale   
  let yScale1 = d3.scaleLinear()
  .domain([0,maxY1])
  .range([height-margin.bottom,margin.top]); 

  // Create Y scale
  y1 = d3.scaleLinear()
              .domain([0, maxY1])
              .range([height - margin.bottom, margin.top]); 

  // Add y axis 
  svg2.append("g")
      .attr("transform", `translate(${margin.left}, 0)`) 
      .call(d3.axisLeft(y1)) 
      .attr("font-size", '10px') 
      .call((g) => g.append("text")
                    .attr("x", 0)
                    .attr("y", margin.top)
                    .attr("fill", "black")
                    .attr("text-anchor", "end")
                    .text(yKey)
    );

    // Add bars to the webpage
    bars = svg2.selectAll(".bar") 
      .data(data) 
      .enter()  
      .append("rect") 
        .attr("id", (data) => data.name)
        .attr("x", (data,i) => xScale1(i)) 
        .attr("y", (data) => yScale1(data.frequency)) 
        .attr("height", (data) => (height - margin.bottom) - yScale1(data.frequency)) 
        .attr("width", xScale1.bandwidth()) 
        .style("fill", (data) => color(data.name))
        .style("opacity", 0.5)

    svg2.append("text")
    .attr("x", (width / 2))             
    .attr("y", 445 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "10px") 
    .style("text-decoration", "underline")  
    .text("Top 5 Congressional Traders by Volume");
})

 


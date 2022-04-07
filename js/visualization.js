let margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 445 - margin.left - margin.right,
  height = 445 - margin.top - margin.bottom;

// adds an svg within which to build
let svg = d3.select("#vis-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // creating the tool tip
let Tooltip = d3.select("#vis-container")
.append("div")
.style("opacity", 0)
.attr("class", "tooltip")
.style("background-color", "red")
.style("border", "solid")
.style("width", "120px")
.style("height", "100px")
.style("top", "250px")
.style("right", "250px")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px")

let mouseover = function(d) {
  if (d.relatedTarget !== undefined) {
    console.log(d.relatedTarget.__data__.data);
  }
  
  Tooltip
    .style("opacity", 1)
    .html("Ticker: " + d.relatedTarget.__data__.data.name + "<br/>Value: " + d.relatedTarget.__data__.data.value)
  d3.select(this)
    .style("stroke", "black")
    .style("color", "red")
    .style("opacity", 1)
}
let mousemove = function(d) {
  Tooltip
    .style("right", (d.pageX + "px"))
    .style("top", (d.pageY + "px"));
}



d3.csv("data/Purchase.csv").then((data) => {

  

  let data2 = data.slice(0,20);

  // stratifies the data for D3
  let root = d3.stratify()
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
      .style("fill", "#69b3a2")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove);

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

// Prints the first 10 lines of Congressional Trading dataset
d3.csv("data/Congressional Trading.csv").then((data) => {
  for (let i = 0; i < 10; i++) {
  console.log(data[i])
  }
})

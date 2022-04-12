d3.csv('data/CongressionalTrading.csv').then((tradingData) => {
let margin = {top: 40, right: 20, bottom: 20, left: 20},
  width = 800 - margin.left - margin.right,
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

let mouseClick = function(d) {
  console.log()
  svg2.selectAll("*").remove();
  const top5TradersData = getAggregatedDataTopTraders(tradingData, d.target.__data__.data.name);
  makeTop5TradersVis(top5TradersData);
}

let mouseover = function(d) {
  if (d.relatedTarget !== undefined) {
  }
  
  Tooltip
    .style("opacity", 1)
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



const svg2 = d3.select("#vis-container2")
                .append("svg")
                .attr("width", width + margin.left + margin.right + 100 )
                .attr("height", height - margin.top - margin.bottom)
                .attr("viewBox", [0, 0, width, height]); 

const svg3 = d3.select("#vis-container3")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform","translate(" + margin.left + "," + margin.top + ")");


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
      .on("click", mouseClick)
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

const color = d3.scaleOrdinal()
                .domain(["Hon. Josh Gottheimer", "Hon. Gilbert Cisneros", "Hon. Susie Lee", "Hon. Alan S. Lowenthal", "Hon. Donna Shalala"])
                .range(["#426cf5", "#426cf5", "#426cf5", "#426cf5", "#426cf5"]);

// helper function for getting Aggregated Data for 
// Volume of Congressman Trades
function getByValue(map, searchVal) {
  for (let [key, value] of map.entries()){
    if (key === searchVal) {
      // make a new map to be returned (to keep data in same state for parent function)
      const map = new Map();
      map.set(key, value);
      return map
    }
  };
}
// Aggregating data for congressman data
function getAggregatedDataTopTraders(data, searchTicker) {
  let groupedTickers = d3.group(data, d => d.ticker);

  if(searchTicker) {
  groupedTickers = getByValue(groupedTickers, searchTicker);
  }

  const congressInvestments = {};

  for (const [key, value] of groupedTickers.entries()) {
    value.map(d => {
      if (congressInvestments[d.representative]) {
        congressInvestments[d.representative] += parseFloat(d.amount);
      } else {
        congressInvestments[d.representative] = parseFloat(d.amount);
      }
    });
  }
  let arrayOfInvestments = [];

  for (const obj of Object.entries(congressInvestments)) {

    arrayOfInvestments.push({name: obj[0], value: obj[1]});
  }

  const sortedInvestments = arrayOfInvestments.sort(function(obj1, obj2) {
    return obj2.value - obj1.value;
  });

  return sortedInvestments;
}

// gets aggregated data for a map object with disclosure_date and amoutn.
function getAggregatedDataTradeVolume(data) {
  const groupedByDate = d3.group(data, d => d.disclosure_date);
  
  const dateTotalVolume = {};
  for (const [key, value] of groupedByDate.entries()) {
    value.map(d => {
    if (dateTotalVolume[key]){
      dateTotalVolume[key] += parseFloat(d.amount);
    } else {
      dateTotalVolume[key] = parseFloat(d.amount);
      }
    });
  };

  const arrayOfDateVolume = [];
  // from an object to an array of single objects
  // fix to be date object
  for (const obj of Object.entries(dateTotalVolume)) {
    const newDate =  d3.timeParse("%m/%d/%Y")(obj[0]);
    arrayOfDateVolume.push({date: newDate, value: obj[1]})
   
  }
  // sort by date
  const sortedDateVolume = arrayOfDateVolume.sort(function(obj1, obj2) {
    return obj1['date'] - obj2['date'];
  });

  // find NaN and fix to 0;
  for (const idx in sortedDateVolume) {
    if(isNaN(sortedDateVolume[idx].value)) {
      console.log(sortedDateVolume[idx]);
      sortedDateVolume[idx].value = 0;
    }
    
  }
  console.log(sortedDateVolume);
  return sortedDateVolume;

}

function makeTop5TradersVis(dataTrader) {
  const data = dataTrader.slice(0,5);

  let x1, y1;
  let xKey, yKey;

  xKey = "name";
  yKey = "frequency";

  // Finx max y 
  let maxY1 = data[0].value; 
  // Create y scale   
  let yScale1 = d3.scaleLinear()
  .domain([0,maxY1])
  .range([height-margin.bottom,margin.top]); 

  //Find max x
  let maxX1 = data.length;

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
        .attr("y", (data) => yScale1(data.value)) 
        .attr("height", (data) => (height - margin.bottom) - yScale1(data.value)) 
        .attr("width", xScale1.bandwidth()) 
        .style("fill", (data) => color(data.name))
        .style("opacity", 0.5)

  //   svg2.append("text")
  //   .attr("x", (width / 2))             
  //   .attr("y", 445 - (margin.top / 2))
  //   .attr("text-anchor", "middle")  
  //   .style("font-size", "10px") 
  //   .style("text-decoration", "underline")  
  //   .text("Top 5 Congressional Traders by Volume");
};

function makeVolumeOverTimeVis(data) {

  // Build x time scale
  let xScale3 = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]);

  // Add x axis to graph
  svg3.append("g")
    .attr("transform", `translate(${125}, ${height})`)
    .call(d3.axisBottom(xScale3))
    .attr("font-size", '10px') 
    .call((g) => g.append("text")
                  .attr("x", width - 110)
                  .attr("y", margin.bottom)
                  .attr("fill", "black")
                  .attr("text-anchor", "end")
                  .text("Time"));

  //Fin max y value
  let maxY3 = d3.max(data, (d) => { return +d.value; });

  //Build y linear scale
  let yScale3 = d3.scaleLinear()
    .domain([0,maxY3])
    .range([height, 0]);

  //Add y axis 
  svg3.append("g")
    .attr("transform", `translate(${125}, 0)`)
    .call(d3.axisLeft(yScale3))
    .attr("font-size", '10px') 
    .call((g) => g.append("text")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("fill", "black")
                  .attr("text-anchor", "end")
                  .text("Volume of Transactions in USD"));


  // Add line component
  svg3.append("path")
    .attr("transform", `translate(${150}, 0)`)
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x((d) => xScale3(d.date))
      .y((d) => yScale3(d.value))
      )
}


  const myData = getAggregatedDataTopTraders(tradingData, "MSFT");
  
  makeTop5TradersVis(myData);

  // make it so this function can be sorted by stock ticker
  const volumeData = getAggregatedDataTradeVolume(tradingData);
  makeVolumeOverTimeVis(volumeData);
});


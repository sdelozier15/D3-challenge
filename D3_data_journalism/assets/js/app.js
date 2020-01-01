// Set Up Margins
var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//SVG wrapper
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "obesity";

//Function for x-scale that adjusts with data
// function xScale(ACSData, chosenXAxis) {
//     var xLinearScale = d3.scaleLinear()
//       .domain([d3.min(ACSData, d => d[chosenXAxis]) * 0.9,
//         d3.max(ACSData, d => d[chosenXAxis]) * 1.1
//       ])
//       .range([0, width]);
  
//     return xLinearScale;
//   }
  
  function xScale(ACSData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([5,40])
      .range([0, width]);
  
    return xLinearScale;
  }

//updates for xAxis
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
      xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
      return xAxis;
  }

//circles group
  function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("r", 10.5);
      return circlesGroup;
  }

  //abbreviations group
  function renderAbbr(abbrGroup, newXScale, chosenXAxis) {
    abbrGroup.transition()
      .duration(1000)
      .attr("x", d => (newXScale(d[chosenXAxis]))-7);
      return abbrGroup;
  }
 

//circles tooltip (changed to apply to abbreviation which is on top)
  function updateToolTip(chosenXAxis, abbrGroup) {
    if (chosenXAxis === "obesity") {
      var label = "Obese:";
    }
    else {
      var label = "Smokers:";
    }
      var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([10, 70])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}%`);
      });
  
    abbrGroup.call(toolTip);
  
    abbrGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
      return abbrGroup;
  }

  // Retrieve data from the CSV file
d3.csv("assets/data/data.csv").then(function(ACSData, err) {
    if (err) throw err;
  
    // parse data
    ACSData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.abbr = String(data.abbr);
    });
console.log(ACSData)
// xLinearScale function above csv import
var xLinearScale = xScale(ACSData, chosenXAxis);

// Create y scale function
var yLinearScale = d3.scaleLinear()
  .domain([5, d3.max(ACSData, d => d.poverty)])
  .range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
chartGroup.append("g")
  .call(leftAxis);

//color scale
// var colScale = d3.scaleOrdinal()
//     .domain(ACSData)
//     .range(d3.scalecategory20b);


// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
.data(ACSData)
.enter()
.append("circle")
.attr("cx", d => xLinearScale(d[chosenXAxis]))
.attr("cy", d => yLinearScale(d.poverty))
.attr("r", d => 10.5)
.attr("fill", "blue")
//.attr("fill", function(d){return colScale(d.abbr})
.attr("opacity", ".8");

// append state names
var abbrGroup = chartGroup.selectAll()
.data(ACSData)
.enter()
.append("text")
.text(d => d.abbr)
.attr("x", d => (xLinearScale(d[chosenXAxis]))-9)
.attr("y", d => (yLinearScale(d.poverty))+5)
.attr("fill", "white")
.attr("font-size", "11px")
.attr("font-weight", "bold");


console.log(abbrGroup);

// Create group for  2 x- axis labels
var labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + 20})`);

var obesityLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 20)
.attr("value", "obesity") // value to grab for event listener
.classed("active", true)
.text("Obesity (%)");

var smokesLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "smokes") // value to grab for event listener
.classed("inactive", true)
.text("Smokers (%)");

// append y axis
chartGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.classed("active", true)
.text("Below Poverty Line (%)");

// updateToolTip function above csv import
var abbrGroup = updateToolTip(chosenXAxis, abbrGroup);

// x axis labels event listener
labelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenXAxis) {

    // replaces chosenXAxis with value
    chosenXAxis = value;

    // console.log(chosenXAxis)

    // functions here found above csv import
    // updates x scale for new data
    xLinearScale = xScale(ACSData, chosenXAxis);

    // updates x axis with transition
    xAxis = renderAxes(xLinearScale, xAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
    
    // updates abbreviations
    abbrGroup = renderAbbr(abbrGroup, xLinearScale, chosenXAxis);
    
    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenXAxis === "smokes") {
      smokesLabel
        .classed("active", true)
        .classed("inactive", false);
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else {
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
      obesityLabel
        .classed("active", true)
        .classed("inactive", false);
    }
  }
});
}).catch(function(error) {
console.log(error);
});
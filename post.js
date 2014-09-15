///////////////////////////////////////////////////////////////////////
//
// Global Variables
//
///////////////////////////////////////////////////////////////////////

var width = 1200,
    height = 700,
    barchart_margin = {top: 20, right: 40, bottom: 30, left: 20},
    barchart_width = width - barchart_margin.left - barchart_margin.right - 250,
    barchart_height = 180 - barchart_margin.top - barchart_margin.bottom,
    centered,
    barWidth = 25,
    num_mapped = 50,
    totalShown = 100,
    mappedHeight = 71,
    unmappedHeight = 29,
    brushYearEnd = 2000;

var z = d3.scale.ordinal().range(["#193441", "#3E606F"]);
currentZoom = -99;

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([.8, 8])
    .on("zoom", zoomed);

// Scales
var x = d3.scale.ordinal().rangeRoundBands([0, barchart_width - 60], .1);
var y = d3.scale.linear().range([barchart_height, 0]);

// Legend variables
var legend_x = 0,
    legend_y = 5,
    legend_width = 175,
    legend_height = 620,
    legend_margin = 20
    key_y = 40,
    key_x = 16,
    mapped_y = legend_y + legend_height - 90;

// Colors
var aliveThroughout = "#009939"; // active throughout
var diesDuring =  "#ff6600";     // closed
var bornDuring =  "0089cd";      // established
var aliveDuring = "#C00000";     // est and closed
var autoColor = "#15b290";
var currYearColor = "#CB709D";

// Brush Dates
var brushYearStart = 1847;
var brushYearEnd = 1903;
var defaultDis = 1905;
var currYear = 0;
var shownOpacity = .9;
var fadeOpacity = 0;

var tooltip = d3.select("body")
  .append("tooltipView")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Get our data ready
queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/post_data.csv")
    .await(ready);

///////////////////////////////////////////////////////////////////////
//
// Map
//
///////////////////////////////////////////////////////////////////////

var projection = d3.geo.azimuthalEqualArea()
    .translate([680, 380])
    .rotate([118.9, 0])
    .center([6, 37.5])
    .scale(1170 * 2);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "mapviz");

var graticule = d3.geo.graticule()
    .extent([
        [-98 - 45, 38 - 45],
        [-98 + 45, 38 + 45]
    ])
    .step([22.5 / 4, 22.5 / 4]);

path = d3.geo.path()
    .projection(projection);

var carto = svg.append("g");
var postOfficePoints = svg.append("g");

// Printing the map
function ready(error, us, post) {
    if (error) { console.log(error); }

    // A little coercion, since the CSV is untyped.
    post.forEach(function (d, i) {
        d.index = i;
        d.name = d["Name"];
        d.est = parseInt(d.Est.split("-")[0]);
        d.re1 = parseInt(d.Re1.split("-")[0]);
        d.re2 = parseInt(d.Re2.split("-")[0]);
        d.re3 = parseInt(d.Re3.split("-")[0]);
        d.dis1 = parseInt(d.Dis1.split("-")[0]);
        d.dis1 = parseInt(d.Dis1.split("-")[0]);
        if (d.Dis1 == "") {
            d.dis1 = defaultDis;
        }
        d.dis2 = parseInt(d.Dis2.split("-")[0]);
        if (d.Dis2 == "") {
            d.dis2 = defaultDis;
        }

        d.dis3 = parseInt(d.Dis3.split("-")[0]);
        if (d.dis3 == "") {
            d.dis3 = defaultDis;
        }
        d.dis4 = parseInt(d.Dis4.split("-")[0]);
        if (d.Dis4 == "") {
            d.dis4 = defaultDis;
        }
        d.latitude = d["Latitude"];
        d.longitude = d["Longitude"];
    });

    carto.append("path")
        .datum(graticule.outline)
        .attr("class", "background")
        .attr("d", path);

    carto.append("path")
        .datum(topojson.feature(us, us.objects.land))
        .attr("class", "land")
        .attr("d", path);

    land = carto.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) {
            return a.id !== b.id;
        }))
        .attr("class", "boundary")
        .attr("d", path);

    carto.append("clipPath")
        .attr("id", "clip")
        .append("use")
        .attr("xlink:href", "#land");

    svg
     .call(zoom)
     .on("mousewheel.zoom", null) // disable mousewheel
     .on("wheel.zoom", null) // disable mousewheel
     .on("dblclick.zoom", null);  // disable doubleclick zoom

    // Printing all points
    postoffices = postOfficePoints.selectAll("g.points-est")
        .data(post)
      .enter().append("g")
        .attr("class", "points-est")
        .style("fill", "midnightblue")
        .attr("transform", function (d) {
            return "translate(" + projection([d.longitude, d.latitude]) + ")";
        })
        .on("mouseover", showLabel)
        .on("mouseout", removeLabel);

    postoffices
        .append("circle")
        .attr("r", 2.5)
        .attr("class", "points-est")
        .style("fill", autoColor);


    //********************************
    // Legend
    //********************************

    var legend = svg.append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("id", "legendBox")
        .attr("x", legend_x)
        .attr("y", legend_y - 15)
        .attr("width", legend_width)
        .attr("height", legend_height);

    // Numbers showing the start and end brush dates.
    var brushYears = legend.append("g")
    brushYears.append("text")
        .attr("id", "brushYears")
        .classed("yearText", true)
        .text(brushYearStart + " - " + brushYearEnd)
        .attr("x", legend_x + 35)
        .attr("y", legend_y + 12);

    var key = legend.append("g")

    // Established during brush
    key.append("circle")
        .attr("id", "keyCircle1")
        .attr("cx", function () {
            return legend_x + key_x
        })
        .attr("cy", function () {
            return legend_y + key_y + 5
        })
        .attr("r", 5)
        .style("fill", autoColor);

    key.append("text")
        .attr("class", "legendText")
        .attr("id", "keyLabel1")
        .attr("x", function () {
            return legend_x + key_x + 10
        })
        .attr("y", function () {
            return legend_y + 10 + key_y
        })
        .text("Longer Lifespan");

    // Closed during brush
    key.append("circle")
        .attr("id", "keyCircle2")
        .attr("cx", function () {
            return legend_x + key_x
        })
        .attr("cy", function () {
            return legend_y + legend_margin + key_y + 5
        })
        .attr("r", 5)
        .style("fill", autoColor)
        .style("opacity", .75);

    key.append("text")
        .attr("class", "legendText")
        .attr("id", "keyLabel2")
        .attr("x", function () {
            return legend_x + key_x + 10
        })
        .attr("y", function () {
            return legend_y + legend_margin + 10 + key_y
        })
        .style("display", "none")
        .text("Closed");

    // Alive throughout brush
    key.append("circle")
        .attr("id", "keyCircle3")
        .attr("cx", function () {
            return legend_x + key_x
        })
        .attr("cy", function () {
            return legend_y + 2 * legend_margin + key_y + 5
        })
        .attr("r", 5)
        .style("fill", autoColor)
        .style("opacity", .5);

    key.append("text")
        .attr("class", "legendText")
        .attr("id", "keyLabel3")
        .attr("x", function () {
            return legend_x + key_x + 10
        })
        .attr("y", function () {
            return legend_y + 2 * legend_margin + 10 + key_y
        })
        .style("display", "none")
        .text("Active throughout");

    // Lives and dies during brush
    key.append("circle")
        .attr("id", "keyCircle4")
        .attr("cx", function () {
            return legend_x + key_x
        })
        .attr("cy", function () {
            return legend_y + 3 * legend_margin + key_y + 5
        })
        .attr("r", 5)
        .style("fill", autoColor)
        .style("opacity", .25);

    key.append("text")
        .attr("class", "legendText")
        .attr("id", "keyLabel4")
        .attr("x", function () {
            return legend_x + key_x + 10
        })
        .attr("y", function () {
            return legend_y + 3 * legend_margin + 10 + key_y
        })
        .text("Shorter Lifespan");

    //********************************
    // Post office toggles - Chart showing the percentage of mapped to
    // unmapped data points within the given brush
    //********************************

    var mappedChart = legend.append("g");

    // Mapped bar
    mappedChart.append("rect")
        .attr("id", "onMap")
        .attr("x", legend_x + 40)
        .attr("y", mapped_y - mappedHeight)
        .attr("width", barWidth)
        .attr("height", mappedHeight);

    // "Mapped" label
    mappedChart.append("text")
        .text("Mapped")
        .attr("class", "mapText")
        .attr("y", mapped_y + 15)
        .attr("x", legend_x + 25);

    // Mapped percentage label
    mappedChart.append("text")
        .text(mappedHeight + "%")
        .attr("class", "percentLabel")
        .attr("id", "mappedPercent")
        .attr("y", mapped_y - mappedHeight - 3)
        .attr("x", legend_x + 41);

    // Unmapped bar
    mappedChart.append("rect")
        .attr("id", "notOnMap")
        .attr("x", legend_x + 95)
        .attr("y", mapped_y - unmappedHeight)
        .attr("width", barWidth)
        .attr("height", unmappedHeight);

    // Unmapped percentage label
    mappedChart.append("text")
        .text(unmappedHeight + "%")
        .attr("class", "percentLabel")
        .attr("id", "unmappedPercent")
        .attr("y", mapped_y - unmappedHeight - 3)
        .attr("x", legend_x + 96);

    // "Unmapped" label
    mappedChart.append("text")
        .text("Unmapped")
        .attr("class", "mapText")
        .attr("y", mapped_y + 15)
        .attr("x", legend_x + 80);

    styleOpacity();

    // *********************************************
    // Map Callbacks
    // *********************************************

    var labelSize = 16;

    // Zoom function
    function zoomed() {
        postOfficePoints.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        carto.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        carto.select(".boundary").style("stroke-width", 1.5 / d3.event.scale + "px");
        if (currentZoom != d3.event.scale) {
            currentZoom = d3.event.scale;
            svg.selectAll("circle.points-est").attr("r", function () {
                return 2.5 / d3.event.scale + "px"
            });
        }
        // labelSize = 16 / d3.event.scale;
        // d3.select(".map-tooltip").style("font-size", 16 / d3.event.scale + "px");
    }

    // On hover, show point labels
    function showLabel(d, i) {
        this.parentNode.appendChild(this);
        var startDate = d.est;
        var endDate = d.dis1;
        d3.selectAll("rect.bar").transition().duration(600).style("fill", function (d) {

            if (d.x >= startDate && d.x <= endDate) {
                return "goldenrod";
            }

            if (d.x == currYear) {
                return currYearColor;
            }

        });

        tooltip.transition().duration(200).style("opacity", .8);
        tooltip.html(tooltipText(d));
    }

    function removeLabel(d,i) {
      // d3.selectAll("text.map-tooltip").remove();
      tooltip.transition().duration(500).style("opacity", 0);

      d3.selectAll("rect.bar").transition().duration(600).style("fill", function (d, i) {
          if (d.x == currYear) {
              return currYearColor;
          } else {
              return z[i]
          }
      });
    }
}


///////////////////////////////////////////////////////////////////////
//
// Bar Chart Timeline
//
///////////////////////////////////////////////////////////////////////

// Prepare the barchart canvas
var barchart = d3.select("body").append("svg")
    .attr("class", "barchart")
    .attr("width", "100%")
.attr("height", barchart_height + barchart_margin.top + barchart_margin.bottom)
    .attr("y", height - barchart_height - 100)
    .attr("x", legend_x + legend_width)
    .append("g")
    .attr("transform", "translate(" + (barchart_margin.left + legend_x + legend_width + 10) + "," + barchart_margin.top + ")");

// Plot the data
d3.csv("data/years_count2.csv", function (error, post) {

    // Coercion since CSV is untyped
    post.forEach(function (d) {
        d["established"] = +d["established"];
        d["discontinued"] = +d["discontinued"];
        d["year"] = d3.time.format("%Y").parse(d["year"]).getFullYear();
    });

    brush = d3.svg.brush()
        .x(x)
        .on("brush", brushmove)
        .on("brushend", brushend);

    var freqs = d3.layout.stack()(["established", "discontinued"].map(function (type) {
        return post.map(function (d) {
            return {
                x: d["year"],
                y: +d[type]
            };
        });
    }));

    x.domain(freqs[0].map(function (d) {
        return d.x;
    }));
    y.domain([0, d3.max(freqs[freqs.length - 1], function (d) {
        return d.y0 + d.y;
    })]);

    // Axis variables for the bar chart
    x_axis = d3.svg.axis().scale(x).tickValues([1850, 1855, 1860, 1865, 1870, 1875, 1880, 1885, 1890, 1895, 1900]).orient("bottom");
    y_axis = d3.svg.axis().scale(y).orient("right");

    // x axis
    barchart.append("g")
        .attr("class", "x axis")
        .style("fill", "#fff")
        .attr("transform", "translate(0," + barchart_height + ")")
        .call(x_axis);

    // y axis
    barchart.append("g")
        .attr("class", "y axis")
        .style("fill", "#fff")
        .attr("transform", "translate(" + (barchart_width - 70) + ",0)")
        .call(y_axis);

    var w = barchart_width - barchart_margin.right - barchart_margin.left;

    // Add a group for each cause.
    var freq = barchart.selectAll("g.freq")
        .data(freqs)
      .enter().append("g")
        .attr("class", "freq")
        .style("fill", function (d, i) { return z(i); })
        .style("stroke", "#CCE5E5");

    // Add a rect for each date.
    rect = freq.selectAll("rect")
        .data(Object)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.x); })
        .attr("y", function (d) { return y(d.y0) + y(d.y) - barchart_height; })
        .attr("height", function (d) { return barchart_height - y(d.y); })
        .attr("width", x.rangeBand())
        .attr("id", function (d) { return d["year"]; });

    // Draw the brush
    var arc = d3.svg.arc()
      .outerRadius(barchart_height / 15)
      .startAngle(0)
      .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

    brushg = barchart.append("g")
      .attr("class", "brush")
      .call(brush);

    brushg.selectAll(".resize").append("path")
        .attr("transform", "translate(0," +  barchart_height / 2 + ")")
        .attr("d", arc);

    brushg.selectAll("rect")
        .attr("height", barchart_height);

});

// ****************************************
// Barchart Callbacks
// ****************************************

function brushmove() {
    y.domain(x.range()).range(x.domain());
    b = brush.extent();

    brushYearStart = (brush.empty()) ? "1847" : Math.ceil(y(b[0]));
    brushYearEnd = (brush.empty()) ? "1903" : Math.ceil(y(b[1]));

    // Snap to rect edge
    d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(brushYearStart), y.invert(brushYearEnd)]));

    // Fade all years in the histogram not within the brush
    d3.selectAll("rect.bar").style("opacity", function (d, i) {
      return d.x >= brushYearStart && d.x < brushYearEnd || brush.empty() ? "1" : ".4"
    });
}

function brushend() {
  brushYearEnd = (brush.empty()) ? brushYearEnd : Math.floor(y(b[1]));
  brush.extent([b[0], Math.round(b[1]/10) * 10])

  // When brushed, depending on option selected call a function to show and style points
    filterPoints();
    colorPoints();
    styleOpacity();

    // Update percent mapped vs percent unmapped bars. We want to show that some
    // data isn't being mapped (where we're missing data, etc.)
    mappedHeight = (num_mapped / totalShown) * 100;
    unmappedHeight = ((totalShown - num_mapped) / totalShown) * 100;
    d3.select("#onMap").attr("height", mappedHeight)
        .attr("y", function () {
            return mapped_y - mappedHeight
        });
    d3.select("#notOnMap").attr("height", unmappedHeight)
        .attr("y", function () {
            return mapped_y - unmappedHeight
        });
    d3.select("#mappedPercent").text(Math.round(mappedHeight) + "%");
    d3.select("#unmappedPercent").text(Math.round(unmappedHeight) + "%");
    d3.select("#mappedPercent").attr("y", mapped_y - mappedHeight - 3);
    d3.select("#unmappedPercent").attr("y", mapped_y - unmappedHeight - 3);

    // Update start and end years in upper right-hand corner of the map
    d3.select("svg").append("brushYears");
    d3.select("#brushYears").text(brushYearStart == brushYearEnd ? brushYearStart : brushYearStart + " - " + brushYearEnd);

    console.log("============")
    console.log("Data check: ")
    console.log("============")
    console.log("Mapped height: ", mappedHeight);
    console.log("Unmapped height: ", unmappedHeight);
    console.log("totalShown: ", totalShown);
    console.log("num_mapped: ", num_mapped);
    console.log("num_unmapped: ", num_unmapped)
    console.log("============")
  }

function resetBrush() {
  brush
    .clear()
    .event(d3.select(".brush"));
}

// ****************************************
// Post office status functions
// ****************************************

var arrSize = 4;
//Returns whether or not the post office was alive at a given date
function isAliveStart(estArr, lifeSpanArr, brushDate) {
    for (var i = 0; i < arrSize; i++) {
        if (estArr[i] < brushDate && brushDate <= (estArr[i] + lifeSpanArr[i])) {
            return true;
        }
    }
    return false;
};

function isAliveEnd(estArr, lifeSpanArr, brushDate) {
    for (var j = 0; j < arrSize; j++) {
        if (estArr[j] <= brushDate && brushDate < (estArr[j] + lifeSpanArr[j])) {
            return true;
        }
    }
    return false;
};

//If the post office was established during the brush, it existed during the brush.
//Only post offices that were dead at the start and end of the brush are passed to this function.
function isDuring(est, brushMin, brushMax) {
    for (var k = 0; k < arrSize; k++) {
        if (brushMin <= est[k] && est[k] <= brushMax) {
            return true;
        }
    }
    return false;
};

function colorPoints() {

    //Colors the points to reflect their category within the brush
    d3.selectAll("circle.points-est").style("fill", function (d, i) {

        // Arrays of established dates and subsequent life spans of a single post office.
        // Note: assumes there are exactly 4 establish dates in the data
        var estArr = [d.est, d.re1, d.re2, d.re3];
        var lifespanArr = [d.dis1 - d.est, d.dis2 - d.re1, d.dis3 - d.re2, d.dis4 - d.re3];

        // Bools are true if post office was alive at the time of brushMin and brushMax
        var startAlive = false;
        var endAlive = false;

        // Determine whether or not a post is alive at the start and end of brush
        startAlive = isAliveStart(estArr, lifespanArr, brushYearStart);
        endAlive = isAliveEnd(estArr, lifespanArr, brushYearEnd);

        if (document.getElementById("regular").checked == true) {
            if (startAlive && endAlive) { //Alive throughout (or at least at start and end)
                return aliveThroughout; // Teal
            } else if (startAlive && !endAlive) { //Dies during brush
                return diesDuring; //Red
            } else if (!startAlive && endAlive) { //Established during brush
                return bornDuring; //Yellow
            } else if (isDuring(estArr, brushYearStart, brushYearEnd)) { //Est. and dies during brush.
                return aliveDuring; //Pink
            } else {
                return "black";
            }
        } else if (document.getElementById("snapshot").checked == true) {
            return autoColor;
        }

    });
};

function styleOpacity() {

    d3.selectAll("circle.points-est").style("opacity", function (d) {
        if (document.getElementById("regular").checked == true) {
            return shownOpacity;
        } else if (document.getElementById("snapshot").checked == true) {
            var estArr = [d.est, d.re1, d.re2, d.re3];
            var lifespanArr = [d.dis1 - d.est, d.dis2 - d.re1, d.dis3 - d.re2, d.dis4 - d.re3];

            // Bools are true if post office was alive at the time of brushMin and brushMax
            var startAlive = false;
            var endAlive = false;

            // Determine whether or not a post is alive at the start and end of brush
            startAlive = isAliveStart(estArr, lifespanArr, brushYearStart);
            endAlive = isAliveEnd(estArr, lifespanArr, brushYearEnd);

            var brushSpan = brushYearEnd - brushYearStart;
            var percentAlive = 0;

            for (var i = 0; i < arrSize; i++) {
                // If the post office was alive at the start of the brush, add appropriate number of years
                if (estArr[i] < brushYearStart && brushYearStart <= (estArr[i] + lifespanArr[i])) {
                    if (estArr[i] + lifespanArr[i] >= brushYearEnd) {
                        return 1;
                    } else {
                        percentAlive += (estArr[i] + lifespanArr[i] - brushYearStart);
                    }
                }
                // Otherwise, if the post office was established any number of times during the brush, add appropriate years
                else if (brushYearStart <= estArr[i] && estArr[i] <= brushYearEnd) {
                    if (brushYearEnd >= (estArr[i] + lifespanArr[i])) {
                        percentAlive += lifespanArr[i];
                    } else {
                        percentAlive += (brushYearEnd - estArr[i]);
                    }
                }
            }
            var nm = d.name;
            return percentAlive / brushSpan;
        }

    });
};

function showEst() {
    d3.selectAll("g.points-est").transition().duration(500).style("display", function (d) {

        var estArr = [d.est, d.re1, d.re2, d.re3];

        for (var i = 0; i < arrSize; i++) {
            if (estArr[i] <= brushYearEnd && estArr[i] >= brushYearStart) {
                return "block";
            }
        }
        return "none";
    });
    return "none";
};

function showDis() {

    d3.selectAll("g.points-est").transition().duration(500).style("display", function(d) {//.style("opacity", function (d) {

        var disArr = [d.dis1, d.dis2, d.dis3, d.dis4];

        for (var i = 0; i < arrSize; i++) {
            if (disArr[i] <= brushYearEnd && disArr[i] >= brushYearStart) {
                return "block";
            }
        }
        return "none";
    });
};

function showEstAndDis() {

    d3.selectAll("g.points-est").transition().duration(500).style("display", function(d) {//.style("opacity", function (d) {

        var estArr = [d.est, d.re1, d.re2, d.re3];
        var disArr = [d.dis1, d.dis2, d.dis3, d.dis4];

        for (var i = 0; i < arrSize; i++) {
            if (disArr[i] <= brushYearEnd && disArr[i] >= brushYearStart) {
                return "block";
            } else if (estArr[i] <= brushYearEnd && estArr[i] >= brushYearStart) {
                return "block";
            }
        }
        return "none";
    });
};

function showAll() {
    totalShown = 0;
    num_mapped = 0;
    num_unmapped = 0;


    var totalPoints = 0;
    var totalUnshown = 0;

    d3.selectAll("g.points-est").style("display", function (d) {
        totalPoints++;

        var estArr = [d.est];
        var lifespanArr = [d.dis1 - d.est];

        // Bools are true if post office was alive at the time of brushMin and brushMax
        var startAlive = false;
        var endAlive = false;

        // Determine whether or not a post is alive at the start and end of brush
        startAlive = isAliveStart(estArr, lifespanArr, brushYearStart);
        endAlive = isAliveEnd(estArr, lifespanArr, brushYearEnd);

        // Show all offices alive at some point if 'all', only established during that time if
        // 'established', and only disestablished if 'disestablished' radio button selected
        if (startAlive && endAlive) {
            d3.select(this).transition().duration(500).style("opacity", shownOpacity);
            totalShown++;
            if (d["GeocodeStatus"] === "Unmatched") {
              // d["Latitude"] === 0 || d["Latitude"] === "" || d["Latitude"] === null
                num_unmapped++;
                return "none";
            } else {
                num_mapped++;
                return "block";
            }
        // } else if (startAlive && !endAlive) {
        //     d3.select(this).transition().duration(500).style("opacity", shownOpacity);
        //     totalShown++;
        //     if (d["Latitude"] == 0 || d["Latitude"] == "") {
        //         num_unmapped++;
        //         return "none";
        //     } else {
        //         num_mapped++;
        //         return "block";
        //     }
        // } else if (!startAlive && endAlive) {
        //     d3.select(this).transition().duration(500).style("opacity", shownOpacity);
        //     totalShown++;
        //     if (d["Latitude"] == 0 || d["Latitude"] == "") {
        //         num_unmapped++;
        //         return "none";
        //     } else {
        //         num_mapped++;
        //         return "block";
        //     }
        } else if (isDuring(estArr, brushYearStart, brushYearEnd)) {
            d3.select(this).transition().duration(500).style("opacity", shownOpacity);
            totalShown++;
            if (d["GeocodeStatus"] === "Unmatched") {
                num_unmapped++;
                return "none";
            } else {
                num_mapped++;
                return "block";
            }
        }
        return "none";

    });
console.log("Total possible offices: ", totalShown);
console.log("Mapped offices: ", num_mapped);
console.log("Not mapped offices: ", num_unmapped);
};

// When a filter checkbox is selected or unselected, update the points shown to reflect current filter
function filterPoints() {

    if (document.getElementById("estab").checked && !document.getElementById("discont").checked) {
        showEst();
    } else if (!document.getElementById("estab").checked && document.getElementById("discont").checked) {
        showDis();
    } else if (document.getElementById("estab").checked && document.getElementById("discont").checked) {
        showEstAndDis();
    } else {
        showAll();
    }
};

// For use in year-by-year: show only offices that were established or discontinued during that year
// function showEstDis() {

//     d3.selectAll("g.points-est").style("display", function (d) {

//         var estArr = [d.est, d.re1, d.re2, d.re3];
//         var lifespanArr = [d.dis1 - d.est, d.dis2 - d.re1, d.dis3 - d.re2, d.dis4 - d.re3];

//         for (var i = 0; i < arrSize; i++) {
//             if (estArr[i] == currYear) {
//                 return "block"
//             } else if ((estArr[i] + lifespanArr[i]) == currYear) {
//                 return "block";
//             } else {
//                 return "none";
//             }
//         }

//     });

//     d3.selectAll("circle.points-est").style("fill", function (d) {

//         var estArr = [d.est, d.re1, d.re2, d.re3];
//         var lifespanArr = [d.dis1 - d.est, d.dis2 - d.re1, d.dis3 - d.re2, d.dis4 - d.re3];

//         for (var i = 0; i < arrSize; i++) {
//             if (estArr[i] == currYear) {
//                 d3.select(this).style("opacity", .8);
//             } else if ((estArr[i] + lifespanArr[i]) == currYear) {
//                 d3.select(this).style("opacity", .8);
//             }
//         }

//     });
// };

/**
 * View switching functions
 */
function showRegular() {
    fadeOpacity = .1;
    document.getElementById("regular").checked = true;
    // document.getElementById("statusView").style.zIndex = "-3";
    // document.getElementById("statusView").style.background = "#f7f7f7"
    // document.getElementById("durationView").style.zIndex = "-4";
    // document.getElementById("durationView").style.background = "#F5F1DE"
    showAll();
    document.getElementById("selections").style.visibility = "visible";
    colorPoints();
    styleOpacity();
    d3.selectAll("g.key").transition().duration(1000).style("opacity", .8);

    document.getElementById("keyCircle1").style.fill = bornDuring;
    document.getElementById("keyCircle2").style.fill = diesDuring;
    document.getElementById("keyCircle3").style.fill = aliveThroughout;
    document.getElementById("keyCircle4").style.fill = aliveDuring;
    document.getElementById("keyCircle2").style.opacity = 1;
    document.getElementById("keyCircle3").style.opacity = 1;
    document.getElementById("keyCircle4").style.opacity = 1;
    d3.select("#keyLabel1").text("Established");
    d3.select("#keyLabel2").style("display", "block");
    d3.select("#keyLabel3").style("display", "block");
    d3.select("#keyLabel4").text("Estab. and Closed");

};

function showSnapshot() {
    fadeOpacity = 0;
    document.getElementById("snapshot").checked = true;
    // document.getElementById("statusView").style.zIndex = "-4";
    // document.getElementById("statusView").style.background = "#F5F1DE";
    // document.getElementById("durationView").style.zIndex = "-3";
    // document.getElementById("durationView").style.background = "#f7f7f7"
    showAll();
    colorPoints();
    d3.selectAll("g.key").transition().duration(1000).style("opacity", 0);
    styleOpacity();
    document.getElementById("keyCircle1").style.fill = autoColor;
    document.getElementById("keyCircle1").style.opacity = 1;
    d3.select("#keyLabel1").text("Longer Lifespan");
    document.getElementById("keyCircle2").style.fill = autoColor;
    document.getElementById("keyCircle2").style.opacity = .75;
    d3.select("#keyLabel2").style("display", "none");
    document.getElementById("keyCircle3").style.fill = autoColor;
    document.getElementById("keyCircle3").style.opacity = .5;
    d3.select("#keyLabel3").style("display", "none");
    document.getElementById("keyCircle4").style.fill = autoColor;
    document.getElementById("keyCircle4").style.opacity = .25;
    d3.select("#keyLabel4").text("Shorter Lifespan");

    // d3.select("input[value='regular']").classed("active", true);

};

/**
 * Zoom functions
 */

function zoomed() {
    postOfficePoints.attr("transform", "translate(" + zoom.translate()[0]  +"," + zoom.translate()[1] + ")scale(" + zoom.scale() + ")");
    carto.attr("transform", "translate(" + zoom.translate()[0] +"," + zoom.translate()[1] + ")scale(" + zoom.scale() + ")");
    carto.select(".boundary").style("stroke-width", (1 / zoom.scale()) + "px");
}

function manualZoom(zoomDirection) {

  var newTransX = (((zoom.translate()[0] - width/2) * 1.5) + width/2);
  var newTransY = (((zoom.translate()[1] - height/2) * 1.5) + height/2);
  var newScale = zoom.scale() * 1.5;

    if (zoomDirection == "in") {

    } else {
      newTransX = (((zoom.translate()[0] - width/2) * .85) + width/2);
      newTransY = (((zoom.translate()[1] - height/2) * .85) + height/2);
      newScale = zoom.scale() * .85;
    }

  postOfficePoints.attr("transform", "translate(" + newTransX +","+newTransY + ")scale(" + newScale + ")");

  carto.attr("transform", "translate(" + newTransX +","+newTransY + ")scale(" + newScale + ")");
  carto.select(".boundary").style("stroke-width", (1 / newScale) + "px");

    svg.selectAll("circle.points-est").attr("r", function () {
        return (2.5 / newScale) + "px"
    });

    zoom.translate([newTransX,newTransY]).scale(newScale);
    // zoomed();
}

/**
 * Tooltip display
 */
function tooltipText(d) {
    var officeName        = isNaN(d.name) ? "n/a" : d.name,
        officeEstablished = isNaN(d.Est) ? "n/a" : d.Est,
        officeClosed      = isNaN(d.Dis1) ? "n/a" : d.Dis1;

    return  "<h5>" + d.name + "</h5>" +
            "Established: " + d.Est + "<br>" +
            "Closed: " + d.Dis1 + "<br>";
}

// Highlight selected view
$('.navbar-header button').click(function(e) {
    $('.navbar-header button.active').removeClass('active');
    var $this = $(this);
    if (!$this.hasClass('active')) {
        $this.addClass('active');
    }
    e.preventDefault();
});

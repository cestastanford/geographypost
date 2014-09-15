Automatic hexbinning in **[d3.carto.map](https://github.com/emeeks/d3-carto-map)** allows for the creation of granular or high resolution heatmaps.

The map.createHexbinLayer function takes two variable: a point d3.carto.layer (either CSV or XY Array) and a resolution (in degrees). It creates a feature carto layer that automatically bins the points in the source layer and which you can then add to the map easily.

In this example, I generate two different hexbin resolutions: One at 2-degree and one at .75 degree, so that you can see how simple it is. The original point objects are found in the properties.node attribute of each hex feature and can be used to count the number or average the population, etc.

This requires a slightly modified [hexbin.js](https://github.com/emeeks/d3-plugins/blob/master/hexbin/hexbin.js) (also in this gist) to work.
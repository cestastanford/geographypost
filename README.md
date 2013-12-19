Geography of the Post
---------------------

Researcher:

- Cameron Blevins, Department of History, Stanford University

Visualization team:

- Jason A. Heppler, Academic Technology Specialist, History, Stanford University
- Tara Balakrishnan, Undergraduate Research Assistant, Stanford University
- Jocelyn Hickox, Undergraduate Research Assistant, Stanford University
- Elijah Meeks, Digital Humanities Specialist, Stanford University

About
-----

The `Geography of the Post` seeks to visualize the spread of post offices across the American West during the nineteenth century.

The U.S. postal system was the nation's largest communications network in the nineteenth century. This visualization maps the spread of that network in the American West by charting the opening and closing of individual post offices over time. Users can click-and-drag the bar chart to see the extent of the network for any span of years. "Normal View" offers a snapshot of offices that were in existence at any point during a particular period. "Detailed View" gives more information about individual offices - whether they were opened, closed, and whether or not they were in existence for the entirety of the selected period. 

Three disclaimers are in order. First, the map is missing a significant amount of data. We attempted to find the locations of post offices by looking them up in the [Geographic Names Information System (GNIS)](http://geonames.usgs.gov/), but we were not successful for many post offices. In order to capture this missing data, the sidebar displays how many post offices are mapped and how many are missing from the map for the selected time period. Second, we have not captured when an office changed names. A name change shows up as if it were a brand-new post office, with the old office "closing" and the new office "opening," even if they were one and the same post office in continuous operation. Finally, the close date of an office represents a final date at which an office ceased to exist. Multiple openings and closings of the same office are not represented.

The map uses data from Richard Helbock, United States Post Offices, Volumes 1-8. Available for purchase at: [http://www.la-posta.com/images/ebooks.htm](http://geonames.usgs.gov/")</a>. We extend our gratitude to Richard Helbock for his incredible work to compile this data.

This visualization was built using [D3.js](http://d3js.org) by Jocelyn Hickox and [Jason Heppler](http://jasonheppler.org) as part of the [Geography of the Post](www.stanford.edu/group/spatialhistory/cgi-bin/site/project.php?id=1059) project at Stanford's [Center for Spatial and Textual Analysis](http://cesta.stanford.edu). Special thanks to Tara Balakrishnan for her initial work and to Elijah Meeks for his technical help.</p>

Installation
------------

To run this locally pull down a local copy and use Python's SimpleHTTPServer to 
run the visualization.

1. Open the Terminal (on Mac), under `Applications > Utilities > Terminal`.
2. In the terminal, navigate to directory to where you want the files to be. For example, `cd ~/Desktop`.
3. Now clone the files locally: `git clone https://github.com/stanford-history/geographypost.git`. 
   This will copy the files to a new directory called `geographyofthepost`.
4. Change your directory to the `geographyofthepost`: `cd geographyofthepost/`.
5. In this directory, run `python -m SimpleHTTPServer 8888`. Now visit 
   [http://localhost:8888/](http://localhost:8888/). Turn off the server by 
   hitting `CTRL + C`. More information about 
   running D3 locally can be found in the [documentation](https://github.com/mbostock/d3/wiki#installing).

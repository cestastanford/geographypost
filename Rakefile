task :shapefiles do
  sh "ogr2ogr -f GeoJSON geo.json \
  ~/git/research-data/nhgis-shapefiles/state_1870/US_state_1870.shp \
  -t_srs EPSG:4326"
  sh "topojson -o state_1870.json  \
  --id-property GISJOIN \
  -p name=STATENAM,gis=GISJOIN \
  -q 5e3 \
  --simplify-proportion 0.30 \
  -- states=geo.json"
  sh "rm geo.json"
end

desc "Run the development server"
task :server do
  sh "ruby -run -e httpd . -p 8888"
end 

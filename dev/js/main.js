
queue()
    .defer(d3.json, "data/germany.json")
    .defer(d3.json, "data/locations.json")
    .defer(d3.json, "data/contracts.json")
    .await(ready);

function ready(error, germany, locations, contracts) {

  if (error) throw error;

  var map = d3.select('#map');
  var tooltip = map.append("div").attr("class", "tooltip hidden");

  var width = parseInt(map.style('width'));
  var height = parseInt(map.style('height'));

  var feature = topojson.feature(germany, germany.objects.subunits);
  var mesh = topojson.mesh(germany, germany.objects.subunits, function (a, b) {

        return a !== b;
      });

  var center = d3.geo.centroid(feature);
  var scale  = 150;
  var offset = [width / 2, height / 2];
  var projection = d3.geo.mercator().scale(scale).center(center)
      .translate(offset);
  var path = d3.geo.path().projection(projection);
  var bounds = path.bounds(feature);
  var hscale = scale * width  / (bounds[1][0] - bounds[0][0]);
  var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
  var scale = (hscale < vscale) ? hscale : vscale;
  var offset = [width - (bounds[0][0] + bounds[1][0]) / 2, height - (bounds[0][1] + bounds[1][1]) / 2];

  projection = d3.geo.mercator().center(center)
    .scale(scale).translate(offset);
  path = path.projection(projection);

  var locationById = d3.map();

  locations.forEach(function (d) {

    locationById.set(d.id, d);
    d.clients = [];
    d.contractors = [];
  });

  contracts.forEach(function (contract) {

    var source = locationById.get(contract.source),
        target = locationById.get(contract.target),
        link = {source: source, target: target};

    source.clients.push(link);
    target.contractors.push(link);
  });

  locations = locations.filter(function (d) {

    if (d.count = Math.max(d.clients.length, d.contractors.length)) {

      d[0] = +d.long;
      d[1] = +d.lat;
      var position = projection(d);
      d.x = position[0];
      d.y = position[1];
      return true;
    }
  });

  var svg = map.append("svg")
      .attr("width", width)
      .attr("height", height);

  svg.append("path")
      .datum(feature)
      .attr("class", "states")
      .attr("d", path);

  svg.append("path")
      .datum(mesh)
      .attr("class", "state-borders")
      .attr("d", path);

  var location = svg.append("g")
      .attr("class", "locations")
    .selectAll("g")
      .data(locations.sort(function (a, b) {

        return b.count - a.count;
      }))
    .enter().append("g")
      .attr("class", "location")
    .on("mousemove", function (d, i) {

      console.log(d);

      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
      var left = Math.min(width - 12 * d.name.length, (mouse[0] + 20));
      var right = Math.min(width - 12 * d.name.length, (width - mouse[0] + 10));
      var top = Math.min(height - 40, (mouse[1] + 20));
      var bottom =  Math.min(height - 40, (height - mouse[1] + 10));

      tooltip.classed("hidden", false)
          .attr("style", function () {
              var position = "";
              if((mouse[0] / width) < 0.5) {
                  position += "left:"+left+"px;";
              } else {
                  position += "right:"+right+"px;";
              }
              if ((mouse[1] / height) < 0.5) {
                  position += "top:"+top+"px;";
              } else {
                  position += "bottom:"+bottom+"px;";   
              }
              return position;
          })
          .html(function() {

            return '<h3>' + d.name + '</h3>' +
              '<p>Ort: ' + d.city + '</p>' +
              '<p>Anzahl der Aufträge: ' + d.contractors.length + '</p>' + 
              '<p>Typ: ' + d.type + '</p>' + 
              '<p>Sector: ' + d.sector + '</p>';
          });
        })
      .on("mouseout",  function(d,i) {
          tooltip.classed("hidden", true);
      });

  location.append("path")
      .attr("class", "location-cell")
      .attr("d", function (d) {

        if (d.cell) return d.cell.length ? "M" + d.cell.join("L") + "Z" : null;
      });

  location.append("g")
      .attr("class", "location-arcs")
    .selectAll("path")
      .data(function (d) {

        return d.contractors;
      })
    .enter().append("path")
      .attr("d", function (d) {

        return path({type: "LineString", coordinates: [d.source, d.target]});
      });

  location.append("circle")
      .attr("class", function (d) {

        return d.contractors.length ? 'client' : 'contractor';
      })
      .attr("transform", function (d) {

        return "translate(" + d.x + "," + d.y + ")";
      })
      .attr("r", function (d, i) {

        return d.contractors.length ? ((d.count - 1) * 0.7 + 5) : 7;
      });

}

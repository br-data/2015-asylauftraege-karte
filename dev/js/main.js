
var $map = d3.select('.map');

var $info = d3.select('.info');
var $close = d3.select('.close');
var $open = d3.select('.open');
var $sidebar = d3.select('.sidebar');
var $list = d3.select('.list');
var $legend = d3.select('.legend');
var $window = d3.select(window);

var cached = {
  germany: undefined,
  locations: undefined,
  contracts: undefined
};

var timeout;
var currentId;

applyListHeight();

$close.on('click', function () {

  $sidebar.style('display', 'none');
  $close.style('display', 'none');
  $open.style('display', 'block');
  $map.style('width', '100%');

  resetGraph();
  drawMap(undefined, cached.germany, cached.locations, cached.contracts);
});

$open.on('click', function () {

  $sidebar.style('display', 'inline-block');
  $close.style('display', 'block');
  $open.style('display', 'none');
  $map.style('width', 'calc(100% - 240px)');

  resetGraph();
  drawMap(undefined, cached.germany, cached.locations, cached.contracts);
});

$window.on('resize', function() {

  clearTimeout(timeout);

  timeout = setTimeout(function () {

    resetGraph();
    drawMap(undefined, cached.germany, cached.locations, cached.contracts);

    applyListHeight();
  }, 500);
}); 

queue()
    .defer(d3.json, "data/germany.json")
    .defer(d3.json, "data/locations.json")
    .defer(d3.json, "data/contracts.json")
    .await(drawMap);

function drawMap(error, germany, locations, contracts) {

  console.log(locations[0]);

  if (!cached.locations) {

    cached.germany = germany;
    cached.locations = locations;
    cached.contracts = contracts;
  }
 
  if (error) {

    throw error;
  }

  var width = parseInt($map.style('width'));
  var height = parseInt($map.style('height'));



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
    d.contracts = [];
  });

  contracts.forEach(function (contract) {

    var source = locationById.get(contract.source);
    var target = locationById.get(contract.target);
    var link = {source: source, target: target};

    source.clients.push(link);
    target.contractors.push(link);
    target.contracts.push(contract);
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

  var linked = [];

  contracts.forEach(function (contract, i) {
  
    linked[contract.source + ',' + contract.target] = true;
  });

  var svg = $map.append("svg")
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
      .attr("class", function(d) {

        return 'location ' + d.type;
      })
    .on("mousemove", function (d, i) {

      if (d.id != currentId) {

        currentId = d.id;

        connectedNodes(d);

        $info.html(function() {

          return '<h2>' + d.name + '</h2>' +
            '<p>Ort: ' + d.city + '</p>' +
            '<p>Anzahl der Aufträge: ' + d.contractors.length + '</p>' + 
            '<p>Typ: ' + d.type + '</p>' + 
            '<p>Sector: ' + d.sector + '</p>';
        });

        $list.html(function () {

          var html = '';

          for (var i = 0; i < d.contracts.length; i++) {

            html += '<p><a title="' + d.contracts[i].name +'" href="' + d.contracts[i].url + '" target="_blank"> ' + d.contracts[i].name + ' (' + d.contracts[i].year + ')</a></p>';
          }

          return html;
        });
      }
    })
    .on("mouseout",  function (d, i) {

      connectedNodes();
    });

  function connectedNodes(d) {

    if (d) {

      location.style('opacity', function (o) {

        if (d.id === o.id || linked[o.id + ',' + d.id]) {

          return 1;
        } else {

          return 0.2;
        }
      });

      location.style('fill', function (o) {

        if (d.id === o.id || linked[o.id + ',' + d.id]) {

          return '#27AFFF';
        }
      });
    } else {

      location.attr('style', null);
    }
  }

  location.append("g")
      .attr("class", "link")
    .selectAll("path")
      .data(function (d) {

        //return d.clients.concat(d.contractors);
        return d.contractors;
      })
    .enter().append("path")
      .attr("d", function (d) {

        return path({type: "LineString", coordinates: [d.source, d.target]});
      })
      .attr("stroke-width", function (d) {

        return Math.floor((d.target.contractors.length - 1) * 0.3 + 2);

      });

  location.append("circle")
      .attr("class", function (d) {

        return d.type;
      })
      .attr("transform", function (d) {

        return "translate(" + d.x + "," + d.y + ")";
      })
      .attr("r", function (d, i) {

        return d.type === 'client' ? (Math.floor((d.count - 1) * 0.7 + 5)) : 7;
      });
}

function resetGraph() {

  d3.select('svg').remove();
}

function applyListHeight() {

  var sidebarHeight = parseInt($sidebar.style('height'));
  var infoHeight = parseInt($info.style('height'));
  var legendHeight = parseInt($legend.style('height'));
  var listHeight = sidebarHeight - infoHeight - legendHeight;

  $list.style('height', listHeight + 'px');
}

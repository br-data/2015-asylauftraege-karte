
(function app() {

  var svg, rect, zoom, drag, feature, mesh, projection, path,
  width, height, center, scale, offset, hscale, vscale, bounds,
  location, locationById, timeout, currentId;

  var linked = [];

  var element = {

    map: d3.select('.map'),
    info: d3.select('.info'),
    close: d3.select('.close'),
    open: d3.select('.open'),
    sidebar: d3.select('.sidebar'),
    list: d3.select('.list'),
    legend: d3.select('.legend'),
    window: d3.select(window)
  };

  var data = {

    germany: undefined,
    locations: undefined,
    contracts: undefined
  };

  d3.selectAll('div[data-zoom]').on('click', function () {

    setTranslationCenter(this.dataset.zoom);
    zoomed();
  });

  (function init() {

    applyListHeight();
    addEventListeners();
    
    queue()
      .defer(d3.json, "data/germany.json")
      .defer(d3.json, "data/locations.json")
      .defer(d3.json, "data/contracts.json")
      .await(drawMap);
  })();

  function drawMap(error, germany, locations, contracts) {

    if (!data.locations) {

      data.germany = germany;
      data.locations = locations;
      data.contracts = contracts;
    }
   
    if (error) {

      throw error;
    }

    width = parseInt(element.map.style('width'));
    height = parseInt(element.map.style('height'));

    feature = topojson.feature(germany, germany.objects.subunits);
    mesh = topojson.mesh(germany, germany.objects.subunits, function (a, b) {

        return a !== b;
      });

    center = d3.geo.centroid(feature);
    scale  = 150;
    offset = [width / 2, height / 2];
    projection = d3.geo.mercator().scale(scale).center(center)
        .translate(offset);
    path = d3.geo.path().projection(projection);
    bounds = path.bounds(feature);
    hscale = scale * width  / (bounds[1][0] - bounds[0][0]);
    vscale = scale * height / (bounds[1][1] - bounds[0][1]);
    scale = (hscale < vscale) ? hscale : vscale;
    offset = [width - (bounds[0][0] + bounds[1][0]) / 2, height - (bounds[0][1] + bounds[1][1]) / 2];

    projection = d3.geo.mercator().center(center)
      .scale(scale).translate(offset);
    path = path.projection(projection);

    locationById = d3.map();

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

    contracts.forEach(function (contract, i) {
    
      linked[contract.source + ',' + contract.target] = true;
    });

    zoom = d3.behavior.zoom()
        .scaleExtent([0.4, 2])
        .on('zoom', zoomed);

    svg = element.map.append("svg")
        .attr("width", width)
        .attr("height", height)
         .attr('pointer-events', 'all')
      .append('svg:g')
        .call(zoom)
      .append('svg:g');

    rect = svg.append('svg:rect')
        .attr('width', width * 2)
        .attr('height', height * 2)
        .attr('x', width / 2 - width)
        .attr('y', height / 2 - height)
        .attr('fill', '#fff')
        .attr('fill-opacity', '0');

    drag = d3.behavior.drag().origin(function(d) {

        return d;
      });

    svg.append("path")
        .datum(feature)
        .attr("class", "states")
        .attr("d", path);

    svg.append("path")
        .datum(mesh)
        .attr("class", "state-borders")
        .attr("d", path);

    location = svg.append("g")
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

          highlightLocation(d);
          updateInfo(d);
          updateList(d);
        }
      })
      .on("mouseout",  function (d, i) {

        highlightLocation();
      });

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

  function highlightLocation(d) {

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

  function updateInfo(d) {
    
    element.info.html(function() {

      var html = '';

      html += '<h2>' + d.name + '</h2>' +
              '<p>Ort: ' + d.city + '</p>' +
              '<p>Anzahl der Aufträge: ' + d.contractors.length + '</p>' + 
              '<p>Typ: ' + d.type + '</p>' + 
              '<p>Sector: ' + d.sector + '</p>';

      return html;
    });
  }

  function updateList(d) {

    element.list.html(function () {

      var html = '';

      for (var i = 0; i < d.contracts.length; i++) {

        html += '<p><a title="' + d.contracts[i].name +'" href="' +
                d.contracts[i].url + '" target="_blank"> ' +
                d.contracts[i].name + ' (' + d.contracts[i].year + ')</a></p>';
      }

      return html;
    });
  }

  function zoomed() {

    svg.attr('transform',
        'translate(' + zoom.translate() + ')' +
        ' scale(' + zoom.scale() + ')');
  }

  function setTranslationCenter(factor) {

    var direction = 1,
      targetZoom = 1,
      center = [width / 2, height / 2],
      extent = zoom.scaleExtent(),
      translate = zoom.translate(),
      translate0 = [],
      l = [],
      view = { x: translate[0], y: translate[1], k: zoom.scale() };

    d3.event.preventDefault();
    targetZoom = zoom.scale() * (1 + factor * direction);

    if (targetZoom < extent[0] || targetZoom > extent[1]) {

      return false;
    }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = targetZoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];
    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    zoom.scale(view.k).translate([view.x, view.y]);
  }

  function resetGraph() {

    d3.select('svg').remove();
  }

  function addEventListeners() {

    element.close.on('click', closeSidebar);

    element.open.on('click', openSidebar);

    element.window.on('resize', handleResize); 
  }

  function closeSidebar() {
    element.sidebar.style('display', 'none');
    element.close.style('display', 'none');
    element.open.style('display', 'block');
    element.map.style('width', '100%');

    resetGraph();
    drawMap(undefined, data.germany, data.locations, data.contracts);
  }

  function openSidebar() {

    element.sidebar.style('display', 'inline-block');
    element.close.style('display', 'block');
    element.open.style('display', 'none');
    element.map.style('width', 'calc(100% - 240px)');

    resetGraph();
    drawMap(undefined, data.germany, data.locations, data.contracts);
  }

  function handleResize() {

    clearTimeout(timeout);

    timeout = setTimeout(function () {

      resetGraph();
      drawMap(undefined, data.germany, data.locations, data.contracts);

      applyListHeight();
    }, 500);
  }

  function applyListHeight() {

    var sidebarHeight = parseInt(element.sidebar.style('height'));
    var infoHeight = parseInt(element.info.style('height'));
    var legendHeight = parseInt(element.legend.style('height'));
    var listHeight = sidebarHeight - infoHeight - legendHeight;

    element.list.style('height', listHeight + 'px');
  }
})();

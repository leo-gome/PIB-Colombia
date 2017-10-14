var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear()
		.range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);
	
var tooltip = 	d3.select('body').append('div')
					.style('position', 'absolute')
					.style('padding', '0 10 px')
					.style('background', 'white')
					.style('opacity', 0);
var	tempColor;	

var line = d3.line()
    .curve(d3.curveBundle)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.PIB); });	

d3.tsv("../data/regiones.tsv", type, function(error, data) {
  if (error) throw error;

  var dptos = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {year: d.year, PIB: d[id]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.year; }));

  y.domain([
    d3.min(dptos, function(c) { return d3.min(c.values, function(d) { return d.PIB; }); }),
    d3.max(dptos, function(c) { return d3.max(c.values, function(d) { return d.PIB; }); })
  ]);

  z.domain(dptos.map(function(c) { return c.id; }));

	//David Gomez: tal vez seria interesante modificar el rango y dibujar el eje X para observar los datos
	// de la serie de Amazonia ya que esta muy cercano a cero
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("PIB %");

   var dpto = g.selectAll(".dpto")
    .data(dptos)
    .enter().append("g")
      .attr("class", "dpto");

  dpto.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

  dpto.append("text")
		.datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
		.attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.PIB) + ")"; })
		.attr("x", 5)
		.attr("dy", "0.35em")
		.style("font", "10px sans-serif")
		.text(function(d) { return d.id; })
		.on('mouseover', function (d, i) {
			tooltip.transition()
				.style('opacity', .9)
			//David Gomez: tal vez no es necesario incluir el nombre de la region ya que el tooltip 
 +	  		//esta ubicado sobre el label de la serie de datos que tambien es el nombre de la region
			tooltip.html(d.id + " (" + d.value.PIB + " %)")
				.style('left', (d3.event.pageX + 30) + 'px')
				.style('top', (d3.event.pageY - 10) + 'px')
			
			tempColor = this.style.fill;
			d3.select(this)
				.style('opacity', .5)
				.style('fill', 'red')
			})
		//David Gomez: Se recomienda tambien ocultar el tool tip en la funcion mouse out
		.on('mouseout', function (d, i) {
			d3.select(this)
				.style('opacity', 1)
				.style('fill', tempColor)
			});
});

function type(d, _, columns) {
  d.year = parseTime(d.year);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}

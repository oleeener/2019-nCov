//(function() {

	// world map
	var id = '#chart6';

    var margin = ({top: 20, right: 0, bottom: 20, left: 0}),
        width = $(id).width() - margin.left - margin.right,
        height = 600;	

    var projection = d3.geoNaturalEarth1()
        //.center([113.915001,22.308901])
        .center([15.827659, -0.228021])  
        .scale(180)
        .rotate([-160,0]) // rotate to have center at asia
        .translate([ width/2, (height - margin.top - margin.bottom)/2 ])	

    var zScale = d3.scaleQuantize()
        .range(['#ffcccc','#ff0000'])

   var svg_base = d3.select(id)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

    svg_base.append('text')
		.attr('x', (width + margin.left + margin.right)/2)
		.attr('y', margin.top)
		.attr("text-anchor", "middle")
		.style('fill','#000000')
		.html('Commercial Flights Flying into Hong Kong')   

    var svg = svg_base.append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);       

    svg.append("g")
		.selectAll("path")
		.data(worldmap.features)
		.enter()
		.append("path")
		.attr("fill", "#b8b8b8")
		.attr("d", d3.geoPath()
			.projection(projection)
		)
		.style("stroke", "#fff")
		.style("opacity", 0.3)     

	var listOfDays = d3.map(airport_arrival, d => d.arrivalDate).keys()
	var data = d3.nest()
		.key(d=>d.from)
		.rollup(function (d) {
          return {
          	total: d.length / listOfDays.length,
          	lat: d3.max(d, v => v.latitude),
          	lng: d3.max(d, v => v.longitude),
          	city: d3.max(d, v => v.city)
          }
        })
        .entries(airport_arrival)  

		// http://bl.ocks.org/mhkeller/f41cceac3e7ed969eaeb
		var lngLatToArc = function (fromLngLat, toLngLat, bend){
			bend = bend || 1;

			var sourceLngLat = fromLngLat,
					targetLngLat = toLngLat;

			if (targetLngLat && sourceLngLat) {
				//console.log(projection(sourceLngLat))
				var sourceXY = projection(sourceLngLat),
						targetXY = projection(targetLngLat);

				//if (!targetXY) console.log(d, targetLngLat, targetXY)
				var sourceX = sourceXY[0],
						sourceY = sourceXY[1];

				var targetX = targetXY[0],
						targetY = targetXY[1];

				var dx = targetX - sourceX,
						dy = targetY - sourceY,
						dr = Math.sqrt(dx * dx + dy * dy)*bend;

				var west_of_source = (targetX - sourceX) < 0;
				if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
				return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
				
			} else {
				return "M0,0,l0,0z";
			}
		}

		svg.selectAll(".arc")
			.data(data)
			.enter()
			.append("path")
			.attr('class','arc')
			.attr('d', function(d) { 
				//console.log(d)
				return lngLatToArc([d.value.lng,d.value.lat],[113.915001,22.308901], 2);
			});		

		svg.selectAll(".point")
			.data(data)
			.enter()
			.append("circle")
			.attr('class','point')
			.attr('cx', d => projection([d.value.lng,d.value.lat])[0])
			.attr('cy', d => projection([d.value.lng,d.value.lat])[1])
			.attr('r',4)
            .on('mouseenter', function (actual, i) {
            	console.log(actual)
            	var xy = projection([actual.value.lng,actual.value.lat]);
                console.log(xy)

                svg.append('text')
                	.attr('class','guide')
                	.attr('x',xy[0])
                	.attr('y',xy[1])
                	.style('fill','#000000')
                	.text(actual.value.city)
                        
                event.preventDefault();
            })
            .on('mouseleave', function (actual,i) {  
                svg.selectAll('.guide').remove()
            });      			

//}());
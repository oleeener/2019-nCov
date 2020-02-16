//(function() {

	var chart6 = function() {
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
	    	.attr('id','title')
			.attr('x', (width + margin.left + margin.right)/2)
			.attr('y', margin.top)
			.attr("text-anchor", "middle")
			.style('fill','#000000')
			//.html('Commercial Flights Flying into Hong Kong in Jan')   

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

		var updateChart = function(filtered_data) {
			//var filtered_data = airport_arrival.filter(d => d.arrivalMth == '2020-01')
			var listOfDays = d3.map(filtered_data, d => d.arrivalDate).keys()
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
		        .entries(filtered_data)  

		    var arrivalMth = d3.max(filtered_data, d => d.arrivalMth)
		    svg_base.select('#title')
		    	.html('Commercial Flights Flying into Hong Kong in '+arrivalMth)

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

			svg.selectAll(".arc").remove()

			svg.selectAll(".arc")
				.data(data)
				.enter()
				.append("path")
				.attr('class','arc')
				.attr('d', function(d) { 
					//console.log(d)
					return lngLatToArc([d.value.lng,d.value.lat],[113.915001,22.308901], 2);
				});	

			svg.selectAll(".point").remove()	

			svg.selectAll(".point")
				.data(data)
				.enter()
				.append("circle")
				.attr('class','point')
				.attr('cx', d => projection([d.value.lng,d.value.lat])[0])
				.attr('cy', d => projection([d.value.lng,d.value.lat])[1])
				.attr('r',4)
	            .on('mouseenter', function (actual, i) {
	            	//console.log(actual)
	            	var xy = projection([actual.value.lng,actual.value.lat]);
	                //console.log(xy)

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
	    }		

	    $.each(d3.map(airport_arrival, d => d.arrivalMth).keys(), function(i,v) {
	        if (v == '2020-01') $('#sel-arrival_mth').append(`<option value="${v}" selected> ${v}</option>`); 
	        else $('#sel-arrival_mth').append(`<option value="${v}"> ${v}</option>`); 
	    })

	    $('#sel-arrival_mth').on('change',function() {
	        var sel = $("#sel-arrival_mth option:selected").val();
	        //console.log(sel)
	        if (sel == 'none') updateChart(airport_arrival);
	        else updateChart(airport_arrival.filter(d => d.arrivalMth == sel));
	    })        
	    updateChart(airport_arrival.filter(d => d.arrivalMth == '2020-01'))	
	}

	chart6()

    //var chart2 = function() {
        var arrival = d3.nest()
            .key(d => d.arrivalDateMMMDD)               
            .rollup(function (d) {
                return {
                    num_flights: d.length
                }
            })
            .entries(airport_arrival)        

        // get line color
        var palette = Color.getPantonePalette(2020);
        var c = palette[2];
        //var c1 = palette[4];

        // line chart
        var id = '#chart7';

        var margin = ({top: 50, right: 20, bottom: 50, left: 20}),
            width = $(id).width() - margin.left - margin.right,
            height = 300;

        var xScale = d3.scaleBand()      
          .range([margin.left,width])
          .padding(0.2) 

        var yScale = d3.scaleLinear()
          .range([height, 0])

        var xAxis = g => g
          .attr("transform", `translate(0,${height})`)
          .attr('class','x axis')

        var yAxis = g => g
          .attr("transform", `translate(${margin.left},0)`)
          .attr('class','y axis')

        var svg_base = d3.select(id)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        var svg = svg_base.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("g")
            .attr('class','x axis')
            .call(xAxis);

        svg.append("g")
          .attr('class','y axis')
          .call(yAxis);

        // title
        svg_base.append('text')
          .attr('x', (width + margin.left + margin.right)/2)
          .attr('y', margin.top/2)
          .attr("text-anchor", "middle")
          .style('fill','#000000')
          .html('# of Commerical Flights Flying into Hong Kong')

        // update domain
        xScale.domain(d3.map(arrival,d => d.key).keys())
        yScale.domain([0, d3.max(arrival, d => d.value['num_flights'])]).nice()

        svg.select(".y")
            .transition()
            .call(d3.axisLeft(yScale).ticks(null, "s"))

        svg.select(".x")
            .transition()
            .call(d3.axisBottom(xScale).tickSizeOuter(0))

        var data_line = d3.line()
            .x(d => xScale(d.key) + xScale.bandwidth()/2)
            .y(d => yScale(d.value['num_flights']));          

        var line = svg.selectAll('.line')
            .data([arrival]);

        line.enter()
            .append("path")
            .attr("class", 'line')
            .attr("fill", "none")
            .attr("stroke", c)
            .attr("stroke-width", 2)
            .attr("d",data_line);                   

        var dot = svg.selectAll('.dot')
            .data(arrival);

        dot.enter()
            .append("circle")
            .attr("class", 'dot')
            .attr("cx", d => xScale(d.key)+xScale.bandwidth()/2)
            .attr("cy", d => yScale(d.value['num_flights']))
            .attr('fill',c)
            .attr("r",5)
            .on('mouseenter', function (actual, i) {
                var y = yScale(actual.value['num_flights'])
                var x = xScale(actual.key) + xScale.bandwidth() / 2;
                var value = actual.value['num_flights'].toLocaleString();

                d3Common.addGuide(svg,x,y,width,height,'',value)          
                event.preventDefault();
            })
            .on('mouseleave', function (actual,i) {  
                d3Common.removeGuide(svg)
            });          

        // var getPoint = function(date) {
        //     var x = xScale(date)+xScale.bandwidth()/2+10;
        //     var y = yScale(arrival.filter(d => d.key == date)[0].value['total'])-10;
        //     return [x,y]           
        // }

        // // annotate
        // d3Common.addAnnotation(svg, getPoint('Feb 08'),[20,40],c,'Launch of 14-day compulsory quarantine')
        // d3Common.addAnnotation(svg, getPoint('Feb 04'),[20,70],c,'Closure of 6 Control Points, inc. Lo Wu')
        // d3Common.addAnnotation(svg, getPoint('Jan 30'),[20,40],c,'Closure of 6 Control Points, inc. High Speed Rail Station')

        // legend
        // svg.append('circle')
        //     .attr('class','legend')
        //     .attr('cx',width-160)
        //     .attr('cy',0)
        //     .attr('fill',c)
        //     .attr('r',5)

        // svg.append('text')
        //     .attr('class','legend')
        //     .attr('x',width-150)
        //     .attr('y',5)
        //     .attr('fill',c)
        //     .style('font-size','0.8rem')
        //     .html('Total')            

        // svg.append('circle')
        //     .attr('class','legend')
        //     .attr('cx',width-160)
        //     .attr('cy',12)
        //     .attr('fill',c1)
        //     .attr('r',5)  

        // svg.append('text')
        //     .attr('class','legend')
        //     .attr('x',width-150)
        //     .attr('y',17)
        //     .attr('fill',c)
        //     .style('font-size','0.8rem')
        //     .html('Total ex. Airport')            


    //}



//}());
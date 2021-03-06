(function() {
    var unnest = function(data, oriKey) {
      var unnestedData = []
      $.each(data, function(index, value) {
        var newData = value.value
        newData[oriKey] = value.key
        unnestedData.push(newData)
      })
      return unnestedData
    }

    var stack = function(data, keys) {
      return d3.stack()
        .keys(keys)(data)
    }    

    // bar chart
    var chart1 = function() {
        // exclude total
        var data = all_data.filter(d => (d.control_points != 'Total') && (d.direction == 'arrival') && (d.visitor_type!='total'));
        //console.log(data)
        var arrival = d3.nest()
            .key(d => d.date_str)               
            .rollup(function (d) {
                return {
                    total: d3.sum(d, v => v.num_cust)
                }
            })
            .entries(data)
        //console.log(arrival)

        // get bar color
        var palette = Color.getPantonePalette(2020);
        var c = palette[2];

        // bar chart
        var id = '#chart1';

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
          .html('HK Passenger Traffic (Arrival)')

        // update domain
        xScale.domain(d3.map(arrival,d => d.key).keys())
        yScale.domain([0, d3.max(arrival, d => d.value['total'])]).nice()

        svg.select(".y")
            .transition()
            .call(d3.axisLeft(yScale).ticks(null, "s"))

        svg.select(".x")
            .transition()
            .call(d3.axisBottom(xScale).tickSizeOuter(0))

        var bar = svg.selectAll('.rect')
            .data(arrival);

        bar.enter()
            .append("rect")
            .attr("class", 'rect')
            .attr("x", (d, i) => xScale(d.key)) 
            .attr("y", d => yScale(d.value['total']))
            .attr("height", d => height - yScale(d.value['total']))  
            .attr("width", xScale.bandwidth())
            .attr("fill", c)
            .on('mouseenter', function (actual, i) {
                var y = yScale(actual.value['total'])
                var x = xScale(actual.key) + xScale.bandwidth() / 2;
                var value = actual.value['total'].toLocaleString();

                d3Common.addGuide(svg,x,y,width,height,'',value)          
                event.preventDefault();
            })
            .on('mouseleave', function (actual,i) {  
                d3Common.removeGuide(svg)
            });    
    }    

    chart1()

    // line chart 
    var chart2 = function() {
       // exclude total
        var data = all_data.filter(d => ((d.control_points != 'Total') && (d.direction == 'arrival') && (d.visitor_type!='total')));

        var arrival = d3.nest()
            .key(d => d.date_str)               
            .rollup(function (d) {
                //console.log(d)
                return {
                    total: d3.sum(d, v => v.num_cust),
                    total_ex_airport: d3.sum(d.filter(w => w.control_points!='Airport'), v => v.num_cust)
                }
            })
            .entries(data)        

        // get line color
        var palette = Color.getPantonePalette(2020);
        var c = palette[2];
        var c1 = palette[4];

        // line chart
        var id = '#chart2';

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
          .html('HK Passenger Traffic (Arrival)')

        // update domain
        xScale.domain(d3.map(arrival,d => d.key).keys())
        yScale.domain([0, d3.max(arrival, d => d.value['total'])]).nice()

        svg.select(".y")
            .transition()
            .call(d3.axisLeft(yScale).ticks(null, "s"))

        svg.select(".x")
            .transition()
            .call(d3.axisBottom(xScale).tickSizeOuter(0))

        var data_line = d3.line()
            .x(d => xScale(d.key) + xScale.bandwidth()/2)
            .y(d => yScale(d.value['total']));

        var data_line_ex_airport = d3.line()
            .x(d => xScale(d.key) + xScale.bandwidth()/2)
            .y(d => yScale(d.value['total_ex_airport']));            

        var line = svg.selectAll('.line')
            .data([arrival]);

        line.enter()
            .append("path")
            .attr("class", 'line')
            .attr("fill", "none")
            .attr("stroke", c)
            .attr("stroke-width", 2)
            .attr("d",data_line);      

        // exclude airport 
        line.enter()
            .append("path")
            .attr("class", 'line')
            .attr("fill", "none")
            .attr("stroke", c1)
            .attr("stroke-width", 2)
            .attr("d",data_line_ex_airport);               

        var dot = svg.selectAll('.dot')
            .data(arrival);

        dot.enter()
            .append("circle")
            .attr("class", 'dot')
            .attr("cx", d => xScale(d.key)+xScale.bandwidth()/2)
            .attr("cy", d => yScale(d.value['total']))
            .attr('fill',c)
            .attr("r",5)
            .on('mouseenter', function (actual, i) {
                var y = yScale(actual.value['total'])
                var x = xScale(actual.key) + xScale.bandwidth() / 2;
                var value = actual.value['total'].toLocaleString();

                d3Common.addGuide(svg,x,y,width,height,'',value)          
                event.preventDefault();
            })
            .on('mouseleave', function (actual,i) {  
                d3Common.removeGuide(svg)
            });

        // exclude airport 
        dot.enter()
            .append("circle")
            .attr("class", 'dot')
            .attr("cx", d => xScale(d.key)+xScale.bandwidth()/2)
            .attr("cy", d => yScale(d.value['total_ex_airport']))
            .attr('fill',c1)
            .attr("r",5)
            .on('mouseenter', function (actual, i) {
                var y = yScale(actual.value['total_ex_airport'])
                var x = xScale(actual.key) + xScale.bandwidth() / 2;
                var value = actual.value['total_ex_airport'].toLocaleString();

                d3Common.addGuide(svg,x,y,width,height,'',value)          
                event.preventDefault();
            })
            .on('mouseleave', function (actual,i) {  
                d3Common.removeGuide(svg)
            });            

        var getPoint = function(date) {
            var x = xScale(date)+xScale.bandwidth()/2+10;
            var y = yScale(arrival.filter(d => d.key == date)[0].value['total'])-10;
            return [x,y]           
        }

        // annotate
        d3Common.addAnnotation(svg, getPoint('Feb 08'),[20,40],c,'Launch of 14-day compulsory quarantine')
        d3Common.addAnnotation(svg, getPoint('Feb 04'),[20,70],c,'Closure of 6 Control Points, inc. Lo Wu')
        d3Common.addAnnotation(svg, getPoint('Jan 30'),[20,40],c,'Closure of 6 Control Points, inc. High Speed Rail Station')

        // legend
        svg.append('circle')
            .attr('class','legend')
            .attr('cx',width-160)
            .attr('cy',0)
            .attr('fill',c)
            .attr('r',5)

        svg.append('text')
            .attr('class','legend')
            .attr('x',width-150)
            .attr('y',5)
            .attr('fill',c)
            .style('font-size','0.8rem')
            .html('Total')            

        svg.append('circle')
            .attr('class','legend')
            .attr('cx',width-160)
            .attr('cy',12)
            .attr('fill',c1)
            .attr('r',5)  

        svg.append('text')
            .attr('class','legend')
            .attr('x',width-150)
            .attr('y',17)
            .attr('fill',c)
            .style('font-size','0.8rem')
            .html('Total ex. Airport')            


    }

    chart2()

    var chart3 = function() {
        // stacked bar chart
        var id = '#chart3';

        var margin = ({top: 50, right: 20, bottom: 50, left: 20}),
            width = $(id).width() - margin.left - margin.right,
            height = 300;

        var xScale = d3.scaleBand()      
          .range([margin.left,width])
          .padding(0.2) 

        var yScale = d3.scaleLinear()
          .range([height, 0])

        var zScale = d3.scaleOrdinal()
            //.range(palette)

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
          .html('HK Passenger Traffic (Arrival) by Control Points')       

        var updateChart = function(filtered_data) {
            var data = filtered_data.filter(d => (d.control_points != 'Total') && (d.direction == 'arrival') && (d.visitor_type!='total'));

            var list_control_points = d3.map(data, d => d.control_points).keys().sort()

            var arrival = d3.nest()
                .key(d => d.date_str)               
                .rollup(function (d) {
                  out = {}
                  $.each(list_control_points, function(index,value) {
                    out[value] = d3.sum(d.filter(w => w.control_points == value), v => v.num_cust);
                  });
                  out['total'] = d3.sum(d, v => v.num_cust);
                  return out;
                })
                .entries(data)       

            var palette = Color.createSwatch('','',list_control_points.length,0.8)
            var c = Color.getPantonePalette(2020)[2];

            var arrival_stacked = unnest(arrival, 'date_str')
            var arrival_stacked = stack(arrival_stacked, list_control_points)          

            // update domain
            xScale.domain(d3.map(arrival,d => d.key).keys())
            yScale.domain([0, d3.max(arrival_stacked, d => d3.max(d, d => d[1]))]).nice()
            zScale.range(palette).domain(list_control_points)

            svg.select(".y")
                .transition()
                .call(d3.axisLeft(yScale).ticks(null, "s"))

            svg.select(".x")
                .transition()
                .call(d3.axisBottom(xScale).tickSizeOuter(0))

            list_control_points.forEach(function(val,ind) {
                //console.log(val,ind)
                var bar = svg.selectAll('.rect-'+val.replace(/ /g,''))
                    .data(arrival_stacked[ind]);

                bar
                  .transition()
                    .attr("x", (d, i) => xScale(d.data.date_str)) 
                    .attr("y", d => yScale(d[1]))    
                    .attr("height", d => yScale(d[0]) - yScale(d[1]))                    

                bar.enter()
                    .append("rect")
                    .attr("class", 'rect-'+val.replace(/ /g,''))
                    .attr("x", (d, i) => xScale(d.data.date_str)) 
                    .attr("y", d => yScale(d[1]))
                    .attr("height", d => yScale(d[0]) - yScale(d[1]))  
                    .attr("width", xScale.bandwidth())
                    .attr("fill", zScale(val))
                    .on('mouseenter', function (actual, i) {
                        var y = yScale(actual[1])
                        var x = xScale(actual.data.date_str) + xScale.bandwidth() / 2;
                        var value = val + ':' + (actual[1]-actual[0]).toLocaleString();
                        var custom_class = (x >= (width + margin.left + margin.right)*0.75)?'anchor_end chart3_guide':'chart3_guide';
                        //console.log(custom_class)
                        d3Common.addGuide(svg,x,y,width,height,custom_class,value)          
                        event.preventDefault();
                    })
                    .on('mouseleave', function (actual,i) {  
                        d3Common.removeGuide(svg)
                    });      
            });

            var getPoint = function(date) {
                var x = xScale(date)+xScale.bandwidth()/2+10;
                var y = yScale(arrival.filter(d => d.key == date)[0].value['total'])-10;
                return [x,y]           
            }

            d3Common.removeAnnotation(svg);

            // annotate
            d3Common.addAnnotation(svg, getPoint('Feb 08'),[20,40],c,'Launch of 14-day compulsory quarantine')
            d3Common.addAnnotation(svg, getPoint('Feb 04'),[20,70],c,'Closure of 6 Control Points, inc. Lo Wu')
            d3Common.addAnnotation(svg, getPoint('Jan 30'),[20,40],c,'Closure of 6 Control Points, inc. High Speed Rail Station')        
        }

        // populate selection
        $.each(d3.map(all_data, d => d.visitor_type).keys().sort(), function(i,v) {
            if (v != 'total') $('#sel-visitor_type').append(`<option value="${v}"> ${v}</option>`); 
        })    

        $('#sel-visitor_type').on('change',function() {
            var sel = $("#sel-visitor_type option:selected").val();
            console.log(sel)
            if (sel == 'none') updateChart(all_data);
            else updateChart(all_data.filter(d => d.visitor_type == sel));
        })      

        updateChart(all_data);     
    }  
     
    chart3();

    var chart4 = function() {
        // stacked bar chart
        var id = '#chart4';

        var margin = ({top: 50, right: 20, bottom: 50, left: 20}),
            width = $(id).width() - margin.left - margin.right,
            height = 300;

        var xScale = d3.scaleBand()      
          .range([margin.left,width])
          .padding(0.2) 

        var yScale = d3.scaleLinear()
          .range([height, 0])

        var zScale = d3.scaleOrdinal()
            //.range(palette)          

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
          .html('HK Passenger Traffic (Arrival) by Visitor Type')

        var updateChart = function(filtered_data) {
            var data = filtered_data.filter(d => (d.control_points != 'Total') && (d.direction == 'arrival') && (d.visitor_type!='total'));
            //&& (d.control_points != 'Airport')

            var list_vistor_type = d3.map(data, d => d.visitor_type).keys().sort()

            var arrival = d3.nest()
                .key(d => d.date_str)               
                .rollup(function (d) {
                  out = {}
                  $.each(list_vistor_type, function(index,value) {
                    out[value] = d3.sum(d.filter(w => w.visitor_type == value), v => v.num_cust);
                  });
                  out['total'] = d3.sum(d, v => v.num_cust);
                  return out;
                })
                .entries(data)       

            var palette = Color.createSwatch('','',list_vistor_type.length,0.8)
            var c = Color.getPantonePalette(2020)[2];

            var arrival_stacked = unnest(arrival, 'date_str')
            var arrival_stacked = stack(arrival_stacked, list_vistor_type)

            // update domain
            xScale.domain(d3.map(arrival,d => d.key).keys())
            yScale.domain([0, d3.max(arrival_stacked, d => d3.max(d, d => d[1]))]).nice()
            zScale.range(palette).domain(list_vistor_type)

            svg.select(".y")
                .transition()
                .call(d3.axisLeft(yScale).ticks(null, "s"))

            svg.select(".x")
                .transition()
                .call(d3.axisBottom(xScale).tickSizeOuter(0))

            list_vistor_type.forEach(function(val,ind) {
                //console.log(val,ind)
                var bar = svg.selectAll('.rect-'+val.replace(/ /g,''))
                    .data(arrival_stacked[ind]);

                bar
                  .transition()
                    .attr("x", (d, i) => xScale(d.data.date_str)) 
                    .attr("y", d => yScale(d[1]))    
                    .attr("height", d => yScale(d[0]) - yScale(d[1]))    
                    
                bar.enter()
                    .append("rect")
                    .attr("class", 'rect-'+val.replace(/ /g,''))
                    .attr("x", (d, i) => xScale(d.data.date_str)) 
                    .attr("y", d => yScale(d[1]))
                    .attr("height", d => yScale(d[0]) - yScale(d[1]))  
                    .attr("width", xScale.bandwidth())
                    .attr("fill", zScale(val))
                    .on('mouseenter', function (actual, i) {
                        var y = yScale(actual[1])
                        var x = xScale(actual.data.date_str) + xScale.bandwidth() / 2;
                        var value = val + ':' + (actual[1]-actual[0]).toLocaleString();
                        var custom_class = (x >= (width + margin.left + margin.right)*0.75)?'anchor_end chart3_guide':'chart3_guide';
                        //console.log(custom_class)
                        d3Common.addGuide(svg,x,y,width,height,custom_class,value)          
                        event.preventDefault();
                    })
                    .on('mouseleave', function (actual,i) {  
                        d3Common.removeGuide(svg)
                    });      
            });

            var getPoint = function(date) {
                var x = xScale(date)+xScale.bandwidth()/2+10;
                var y = yScale(arrival.filter(d => d.key == date)[0].value['total'])-10;
                return [x,y]           
            }

            d3Common.removeAnnotation(svg);

            // annotate
            d3Common.addAnnotation(svg, getPoint('Feb 08'),[20,40],c,'Launch of 14-day compulsory quarantine')
            d3Common.addAnnotation(svg, getPoint('Feb 04'),[20,70],c,'Closure of 6 Control Points, inc. Lo Wu')
            d3Common.addAnnotation(svg, getPoint('Jan 30'),[20,40],c,'Closure of 6 Control Points, inc. High Speed Rail Station')       
        }
        // populate selection
        $.each(d3.map(all_data, d => d.control_points).keys().sort(), function(i,v) {
            if (v != 'Total') $('#sel-control_points').append(`<option value="${v}"> ${v}</option>`); 
        })

        $('#sel-control_points').on('change',function() {
            var sel = $("#sel-control_points option:selected").val();
            console.log(sel)
            if (sel == 'none') updateChart(all_data);
            else updateChart(all_data.filter(d => d.control_points == sel));
        })      

        updateChart(all_data);     

    }

    chart4()

    var chart5 = function() {
        
        // pie chart
        var id = '#chart5';

        var margin = ({top: 50, right: 0, bottom: 0, left: 0}),
            width = $(id).width() - margin.left - margin.right,
            height = 300,
            radius = Math.min(width, height) / 2;

        var zScale = d3.scaleOrdinal()
            //.range(palette)

        var svg_base = d3.select(id)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        var svg = svg_base.append("g")
            .attr("transform", `translate(${(width)/2+margin.left},${(height)/2+margin.top})`);

        // title
        svg_base.append('text')
            .attr('id','title-chart5')
            .attr('x', (width + margin.left + margin.right)/2)
            .attr('y', margin.top/2)
            .attr("text-anchor", "middle")
            .style('fill','#000000')
            //.html('Distribution of HK Passenger Traffic (Arrival) by Visitor Type on')  

        var updateChart = function(filtered_data) {
            var data = filtered_data.filter(d => (d.control_points != 'Total') && (d.direction == 'arrival') && (d.visitor_type!='total'));
            //console.log(data)
            var dailyTotal = d3.sum(data, v => v.num_cust);

            var arrival = d3.nest()
                .key(d => d.visitor_type)               
                .rollup(function (d) {
                  return {
                    total: d3.sum(d, v => v.num_cust),
                    perc: (dailyTotal > 0)? d3.sum(d, v => v.num_cust) / dailyTotal:0
                  }
                })
                .entries(data)                  

            var pie = d3.pie()
                .value(function(d) {return d.value['total']; })
                .sort(function(a, b) {return d3.ascending(a.key, b.key);})  

            var pie_data = pie(arrival)
            //console.log(pie_data)

            var arc = d3.arc()
                .innerRadius(radius)
                .outerRadius(0);   

            var textArc = d3.arc()
                .innerRadius(radius * 1.2)
                .outerRadius(0);


            var list_vistor_type = d3.map(data, d => d.visitor_type).keys().sort()
            var palette = Color.createSwatch('','',list_vistor_type.length,0.8)

            zScale.range(palette).domain(list_vistor_type)

            svg_base.select('#title-chart5')
                .html('Distribution of HK Passenger Traffic (Arrival) by Visitor Type on '+d3.max(data, d=>d.date_str))  

            var slice = svg.selectAll(".slice")
                .data(pie_data)     

            slice   
                .transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                })

            slice
                .enter()
                .append('path')
                .attr('class','slice')  
                .transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                })
                .attr('fill', d => zScale(d.data.key))
                .attr("stroke", "white")
                .style("stroke-width", "2px")

            slice
                .exit()
                .remove()

            // label
           var sliceText = svg.selectAll(".slice_text")
                .data(pie_data)   

            var midAngle = function(d){
                console.log(d.startAngle + (d.endAngle - d.startAngle)/2);
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }            

            sliceText
                .transition().duration(1000)
                .attrTween("transform", function(d) {
                    this._current = this._current || d;
                    var i = d3.interpolate(this._current, d);
                    this._current = i(0);
                    return function(t) {
                        var d2 = i(t);
                        var pos = textArc.centroid(d2);
                        return "translate("+ pos +")";
                    };
                })
                .text(d => d.data.key+' '+(d.data.value.perc * 100).toFixed(0)+'%')                

            sliceText
                .enter()
                .append('text')
                .attr('class','slice_text')  
                .transition().duration(1000)
                .attrTween("transform", function(d) {
                    this._current = this._current || d;
                    var i = d3.interpolate(this._current, d);
                    this._current = i(0);
                    return function(t) {
                        var d2 = i(t);
                        var pos = textArc.centroid(d2);
                        return "translate("+ pos +")";
                    };
                })      
                .text(d => d.data.key+' '+(d.data.value.perc * 100).toFixed(0)+'%')                

            sliceText
                .exit()
                .remove()            
        }

        $.each(d3.map(all_data, d => d.date_str).keys(), function(i,v) {
            if (v == 'Jan 24') $('#sel-date_str').append(`<option value="${v}" selected> ${v}</option>`); 
            else $('#sel-date_str').append(`<option value="${v}"> ${v}</option>`); 
        })

        $('#sel-date_str').on('change',function() {
            var sel = $("#sel-date_str option:selected").val();
            //console.log(sel)
            if (sel == 'none') updateChart(all_data);
            else updateChart(all_data.filter(d => d.date_str == sel));
        })              

        //updateChart(all_data.filter(d => d.date_str == 'Jan 24'))

        var listOfDates = d3.map(all_data, d => d.date_str).keys();
        var index = 0;
        var interval = d3.interval(function(){
            //$('#title-chart5').html(''+totalCasesDict[listOfDates[c]].toLocaleString()+' cases Worldwide on '+convertYYYYHMMHDD(listOfDates[c],''))
            updateChart(all_data.filter(d => d.date_str == listOfDates[index]))
            index++;
            if (index > listOfDates.length-1) {
                interval.stop()
            }
        }, 2000);           

    }

    //chart5()
}());
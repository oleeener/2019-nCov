(function() {

    // Building stacked bar    
    var filterData = function(data,key,value) {
      if ((key == '') || (value == '')) {
        // no filter
        return data
      } else {
        // with filter
        return data.filter(function(d) {return d[key] == value})  
      }
    }

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

    var updateChart = function(data, filter_key, filter_value) {
      var filteredData = filterData(data, filter_key, filter_value);
      var data = d3.nest()
        .key(function(d) { return d.date; })
        .rollup(function(v) { 
          out = {}
          $.each(controlPoints, function(index,value) {
            out[value] = d3.sum(v, d => d[value]);
          });
          return out;
        })
        .entries(filteredData);      
      data = unnest(data, 'date')
      data = stack(data, controlPoints)

      // update domain
      xScale.domain(d3.map(filteredData,d => d.date).keys())
      yScale.domain([0, d3.max(data, d => d3.max(d, d => d[1]))])

      svg.select(".y")
        .transition()
        .call(d3.axisLeft(yScale).ticks(null, "s"))

      svg.select(".x")
        .transition()
        .call(d3.axisBottom(xScale).tickSizeOuter(0))  

      zScale.domain(data.map(d => d.key))

      // update chart
      controlPoints.forEach(function(k,i) {
        var bar = svg.selectAll('.rect-'+k.replace(/ /g,''))
            .data(data[i]);

        bar
          .transition()
            .attr("x", (d, i) => xScale(d.data.date)) 
            .attr("y", d => yScale(d[1]))    
            .attr("height", d => yScale(d[0]) - yScale(d[1]))

        bar.enter().append("rect")
            .attr("class", 'rect-'+k.replace(/ /g,''))
            .attr("x", (d, i) => xScale(d.data.date)) 
            .attr("y", d => yScale(d[1]))  
            .attr("height", d => yScale(d[0]) - yScale(d[1]))  
            .attr("width", xScale.bandwidth())
            .attr("fill", d => zScale(k))
            .on('mouseenter', function (actual, i) {
              $('#tipbox1').text(k+': '+(actual[1]-actual[0]).toLocaleString()+' ('+actual.data.date+')')
              event.preventDefault()  
            })
            .on('mouseleave', function (actual,i) {       
            });            
      })  
    } 

    var width = 600,
      height = 300,
      margin = ({top: 30, right: 180, bottom: 20, left: 20});

    var controlPoints = ['Airport',
       'High Speed Rail', 'Hung Hom', 'Lo Wu',
       'Lok Ma Chau Spur Line', 'HK-ZH-MO Bridge', 'Lok Ma Chau',
       'Man Kam To', 'Sha Tau Kok', 'Shenzhen Bay', 'China Ferry Terminal',
       'Harbour Control', 'Kai Tak Cruise Terminal', 'Macau Ferry Terminal',
       'Tuen Mun Ferry Terminal']    

    var xScale = d3.scaleBand()      
      .range([margin.left,width])
      .padding(0.1) 

    var yScale = d3.scaleLinear()
      .range([height, 0])

    var zScale = d3.scaleOrdinal()
        .range(Color.createSwatch('', '',controlPoints.length))

    var xAxis = g => g
      .attr("transform", `translate(0,${height})`)
      .attr('class','x axis')

    var yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .attr('class','y axis')

    var svg_base = d3.select("#chart1")
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

    // legend
    var legend = svg_base.selectAll('.legend')
      .data(controlPoints)
      .enter()

    legend.append('circle')
      .attr('class', 'legend_c')
      .attr('cx',width+margin.left*1.3)
      .attr('cy',(d,i) => margin.top + (i * 12))
      .attr('r',6)
      .style('fill',d => zScale(d))
    
    legend.append('text')
      .attr('class', 'legend_t')
      .attr("x", width+margin.left*1.3+6)
      .attr("y", (d,i) => margin.top + 5 + (i * 12))
      .text(d => d)
      .style("font-size", "0.8rem")
      .attr("alignment-baseline","left")

    updateChart(g1,'visitor_type','') 

    // init select    
    $.each(d3.map(g1, d => d.visitor_type).keys().sort(), function(i,v) {
      $('#sel-visitor_type').append(`<option value="${v}"> ${v}</option>`); 
    })
    $('#sel-visitor_type').on('change',function() {
      var sel = $("#sel-visitor_type option:selected").val();
      updateChart(g1,'visitor_type',sel) 
      $('#tipbox1').html('')
    })	

}());
(function(){
    var width = 600,
      height = 300,
      margin = ({top: 30, right: 180, bottom: 20, left: 20}); 

    var visitorType = d3.map(g1, d => d.visitor_type).keys().sort()

    var xScale = d3.scaleBand()      
      .range([margin.left,width])
      .padding(0.1) 

    var yScale = d3.scaleLinear()
      .range([height, 0])

    var zScale = d3.scaleOrdinal()
        .range(Color.createSwatch('', '',visitorType.length))

    var xAxis = g => g
      .attr("transform", `translate(0,${height})`)
      .attr('class','x axis')

    var yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .attr('class','y axis')

    var svg_base = d3.select("#chart2")
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
      .html('HK Passenger Traffic (Arrival) by Passenger Type')

    // legend
    var legend = svg_base.selectAll('.legend')
      .data(visitorType)
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

    var unnest = function(data, oriKey) {
      var unnestedData = []
      $.each(data, function(index, value) {
        var newData = {}
        $.each(value.values, function(index1,value1){
          newData[value1.key] = value1.value
        })
        newData[oriKey] = value.key
        unnestedData.push(newData)
      })
      return unnestedData
    }

    var stack = function(data, keys) {
      return d3.stack()
        .keys(keys)(data)
    }             
    
    var updateChart = function(data,result_type, filter_value) {
      if (filter_value=='') filter_value = 'total'

      var filteredData = data;
      // max by date
      var daily_max = d3.nest()
        .key(function(d) { return d.date; })               
        .rollup(function(v) {return d3.sum(v,s => s[filter_value])})
        .entries(filteredData)
      var daily_max_dict = {}
      $.each(daily_max, function(index,value){
        daily_max_dict[value.key] = value.value
      })
             
      var data;         
      if (result_type === 'num') {
        data = d3.nest()
          .key(function(d) { return d.date; })        
          .key(function(d) { return d.visitor_type; })   
          .rollup(function(v) {return (v[0][filter_value])})
          .entries(filteredData);      
      } else {
        data = d3.nest()
          .key(function(d) { return d.date; })        
          .key(function(d) { return d.visitor_type; })   
          .rollup(function(v) {return (daily_max_dict[v[0].date]==0)?0:(v[0][filter_value]/daily_max_dict[v[0].date])})
          .entries(filteredData);      
      }
        
      data = unnest(data, 'date')
      data = stack(data, visitorType)

      // update domain
      xScale.domain(d3.map(filteredData,d => d.date).keys())
      yScale.domain([0, d3.max(data, d => d3.max(d, d => d[1]))])

      svg.select(".y")
        .transition()
        .call(d3.axisLeft(yScale).ticks(null, "s").tickFormat(d3.format((result_type=='num')?'~s':'.0%')))

      svg.select(".x")
        .transition()
        .call(d3.axisBottom(xScale).tickSizeOuter(0))  

      zScale.domain(data.map(d => d.key))

      // update chart
      visitorType.forEach(function(k,i) {
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
              $('#tipbox2').text(k+': '+((actual[1]>1)?(actual[1]-actual[0]).toLocaleString():Math.round((actual[1]-actual[0])*100)+'%')+' ('+actual.data.date+')')
              event.preventDefault()  
            })
            .on('mouseleave', function (actual,i) {       
            });            
      })  
    }

    var controlPoints = ['Airport',
       'High Speed Rail', 'Hung Hom', 'Lo Wu',
       'Lok Ma Chau Spur Line', 'HK-ZH-MO Bridge', 'Lok Ma Chau',
       'Man Kam To', 'Sha Tau Kok', 'Shenzhen Bay', 'China Ferry Terminal',
       'Harbour Control', 'Kai Tak Cruise Terminal', 'Macau Ferry Terminal',
       'Tuen Mun Ferry Terminal']  

    $.each(controlPoints, function(i,v) {
      $('#sel-control_points').append(`<option value="${v}"> ${v}</option>`); 
    })

    $('#sel-control_points').on('change',function() {
      var type = $("input[name='radio-chart2_type']:checked").val()
      var sel = $("#sel-control_points option:selected").val();
      updateChart(g1,type,sel) 
      $('#tipbox2').html('')
    })      

    $("input[name='radio-chart2_type']").on('click', function(){
      var sel = $("input[name='radio-chart2_type']:checked").val()
      updateChart(g1,sel,'')    
    })
    updateChart(g1,'num','')  	
}())
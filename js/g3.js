(function(){
    var width = 1200,
      height = 600,
      margin = ({top: 50, right: 10, bottom: 20, left: 20}); 

    var projection = d3.geoMercator()
        //.center([114.143753,22.372124])
        .center([15.827659, -0.228021])  
        .scale(150)
        .translate([ width/2, height/2 ])

    var convertYYYYHMMHDD = function(date,toFormat) {
      var listOfMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];     
      var newDate = new Date(date)
      var d = newDate.getDate();
      var m = listOfMonths[newDate.getMonth()];
      var y = newDate.getFullYear();    
      if (toFormat==='MMMDD') {
        return (m+d.toString().padStart(2,'0')).toUpperCase();     
      } else {
        return m+' '+d.toString().padStart(2,'0')+' '+y;
      }      
    }        

    var filterData = function(data,key,value) {
      if ((key == '') || (value == '')) {
        // no filter
        return data
      } else {
        // with filter
        return data.filter(function(d) {return d[key] == value})  
      }
    }

    var updateChart = function(data,filter_key,filter_value) {
      var data = filterData(data,filter_key,filter_value)
      zScale.domain([0, d3.max(data, d => d.num_cases)])

      svg
        .selectAll(".circle").remove()
      svg
        .selectAll(".g3_tip").remove()        

      var circles = svg
        .selectAll(".circle")
        .data(data)

        circles
          .transition()
            .style("fill", d => zScale(d.num_cases))
               
        circles.enter()
        .append("circle")
          .attr('class','circle')
          .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
          .attr("cy", d => projection([+d.longitude, +d.latitude])[1])
          .attr("r", 5)
          .style("fill", d => zScale(d.num_cases))
          .attr("stroke", '#000')
          .attr("stroke-width", 1)
          .attr("fill-opacity", .6)
          .on('mouseenter', function (actual, i) {
            var x = projection([+actual.longitude, +actual.latitude])[0];
            var y = projection([+actual.longitude, +actual.latitude])[1];

            d3.select(this)
              .transition()
              .attr("r", 5*1.5)

            svg.append('text')
              .attr('class', 'tip g3_tip')
              .attr('x', x+5*1.5)
              .attr('y', y-5*1.5)   
              .text(actual.country+' '+actual.num_cases)  
              .style('font-size','0.8em')          
            event.preventDefault()   
          })
          .on('mouseleave', function (actual,i) {
            d3.select(this)
              .transition()
              .attr("r", 5)        
            d3.selectAll('text.tip').remove()          
          });        

    }

    var zScale = d3.scaleQuantize()
        //.domain([0, d3.max(data, d => d.num_cases)])
        .range(['#ffcccc','#ff0000'])

    var svg_base = d3.select("#chart3")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)

    svg_base
    .append("text")
      .attr("text-anchor", "middle")
      .attr('id','worldmap_title')
      .style("fill", "black")
      .attr("x", width/2)
      .attr("y", margin.top)
      .attr("width", 90)
      .html("")
      .style("font-size", '1.5rem')          

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


    var listOfDates = d3.map(g3, d => d.date).keys().sort()
    var totalCases = d3.nest()
      .key(d => d.date)
      .rollup(d => d3.sum(d, v => v.num_cases))
      .entries(g3)
    var totalCasesDict = {}
    $.each(totalCases, function(i,v){
      totalCasesDict[v.key] = v.value
    })    
    var c = 0;
    var interval = d3.interval(function(){
      //console.log(c,listOfDates[c])
      $('#worldmap_title').html(''+totalCasesDict[listOfDates[c]].toLocaleString()+' cases Worldwide on '+convertYYYYHMMHDD(listOfDates[c],''))
      updateChart(g3,'date',listOfDates[c])
      c++;
      if (c > listOfDates.length-1) {
        interval.stop()
      }
    }, 2000);    	

}())
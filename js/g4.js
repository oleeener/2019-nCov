(function(){
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

    var width = 600,
      height = 300,
      margin = ({top: 30, right: 180, bottom: 20, left: 20});

    var xScale = d3.scaleBand()      
      .range([margin.left,width])
      .padding(0.1) 

    var yScale = d3.scaleLinear()
      .range([height, 0])

    // var zScale = d3.scaleOrdinal()
    //     .range(Color.createSwatch('', '',controlPoints.length))    

    var xAxis = g => g
      .attr("transform", `translate(0,${height})`)
      .attr('class','x axis')

    var yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .attr('class','y axis')

    var svg_base = d3.select("#chart4")
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
      .attr('x', width/2)
      .attr('y', margin.top/2)
      .attr("text-anchor", "middle")
      .style('fill','#000000')
      .html('# 2019-nCov Confirmed Cases Worldwide')

    var data = d3.nest()
      .key(d => d.date)
      .rollup(d => d3.sum(d, v => v.num_cases))
      .entries(g3); 

    // update domain
    xScale.domain(d3.map(data,d => d.key).keys().sort())
    yScale.domain([0, d3.max(data, d => d.value)])        

    svg.select(".y")
      .transition()
      .call(d3.axisLeft(yScale).ticks(null, "s"))

    svg.select(".x")
      .transition()
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickFormat(d => convertYYYYHMMHDD(d,'MMMDD')))  

     var bar = svg.selectAll('.g4_rect')
        .data(data);
    
    bar
      .transition()
        .attr("x", (d, i) => xScale(d.key)) 
        .attr("y", d => yScale(d.value))    
        .attr("height", d => yScale(d.value))

    bar.enter().append("rect")
        .attr("class", 'g4_rect')
        .attr("x", (d, i) => xScale(d.key)) 
        .attr("y", d => yScale(d.value))  
        .attr("height", d => height - yScale(d.value))  
        .attr("width", xScale.bandwidth())
        .attr("fill", '#7fcdbb')
        .style('opacity',0.5)
        .style("stroke", '#000')

    bar.enter().append('text')
        .attr("x", (d, i) => xScale(d.key)+xScale.bandwidth()/2) 
        .attr("y", d => yScale(d.value)-5) 
        .attr("text-anchor", "middle")
        .text(d => d.value.toLocaleString())
        .style('font-size','0.8rem')       

}())
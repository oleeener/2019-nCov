// require d3.js
var Color = (function () {
    var createColorSwatch = function(color1, color2, numColors) {
      if (color1 == '' && color2 != '') {
        color1 = color2;
      } else if (color1 != '' && color2 == '') {
        color2 = color1;
      }

      if (color1 == '' && color2 == '' && numColors > 1) {
      	return d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), numColors).reverse()
      } else if (color1 == '' && color2 == '' && numColors == 1) {
        return getPantonePalette(2020)[1];
      } else if (color1 === color2) {
        return [color1];
      } else {
        return d3.quantize(d3.interpolateHcl(color1, color2), numColors)  
      }      
    }	

    var displayColorSwatch = function(color1, color2, numColors, divName, radius) {
	    var c = createColorSwatch(color1, color2, numColors)
	    var t = d3.select('#'+divName)
	      .append("svg").attr("width", numColors * radius * 2).attr("height",radius * 2)
	    t.selectAll('circle')
	      .data(c)
	      .enter()
	        .append("circle")
	        .attr("cx",function (d,i) {return radius * 2 * i + radius;})
	        .attr("cy",radius)
	        .attr("r",radius)
	        .style("fill", d => d)
    }

    var getPantonePalette = function(year) {
      // 2 - pantone color 2020
      var palette = ['#658DC6','#84898C','#0F4C81','#F5B895','#A58D7F'];
      return palette;
    }

    return {
    	createSwatch: createColorSwatch, 
    	displaySwatch: displayColorSwatch,
      getPantonePalette: getPantonePalette
    }
}());
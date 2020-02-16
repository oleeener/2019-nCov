// require d3.js
var Color = (function () {
    var createColorSwatch = function(color1, color2, numColors, opacity) {
      if (opacity == undefined) {
        opacity = 1;
      }

      if (color1 == '' && color2 != '') {
        color1 = color2;
      } else if (color1 != '' && color2 == '') {
        color2 = color1;
      }

      if (color1 == '' && color2 == '' && numColors > 1) {
      	//return d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), numColors).reverse()
        return d3.quantize(function(t) {c = d3.color(d3.interpolateRainbow(t * 0.8 + 0.1)); c.opacity=opacity; c+""; return c;}, numColors).reverse()
      } else if (color1 == '' && color2 == '' && numColors == 1) {
        return getPantonePalette(2020)[1];
      } else if (color1 === color2) {
        return [color1];
      } else {
        return d3.quantize(d3.interpolateHcl(color1, color2), numColors)  
      }      
    }	

    var displayColorSwatch = function(palette, divName, radius) {
	    var t = d3.select('#'+divName)
	      .append("svg").attr("width", palette.length * radius * 2).attr("height",radius * 2)
	    t.selectAll('circle')
	      .data(palette)
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
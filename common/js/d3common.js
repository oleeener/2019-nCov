var d3Common = (function() {	
   var addArrow = function(svg,id,color) {
        svg.append("svg:defs")
            .append("svg:marker")
            .attr("id", id)
            .attr("refX", 6)
            .attr("refY", 6)
            .attr("markerWidth", 30)
            .attr("markerHeight", 30)
            .attr("markerUnits","userSpaceOnUse")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 12 6 0 12 3 6")
            .style("fill", color); 
    }

    var addAnnotation = function(svg, point, arrow_length, arrow_color,text) {
        addArrow(svg,'arrow',arrow_color);

        svg.append("line")
            .attr('class','annotate')
            .attr("x1", point[0]+arrow_length[0])
            .attr("y1", point[1]-arrow_length[1])
            .attr("x2", point[0])
            .attr("y2", point[1])
            .attr("stroke-width", 1)
            .attr("stroke", arrow_color)
            .attr("marker-end", "url(#arrow)");

        svg.append("text")
            .attr('class','annotate')
            .attr("x", point[0]+arrow_length[0])
            .attr("y", point[1]-arrow_length[1])
            .html(text); 
    }    

    var removeAnnotation = function(svg) {
        svg.selectAll('.annotate').remove();
    }

    var addGuide = function(svg,x,y,width,height,custom_class,value) {
        svg.append('text')
            .attr('class', 'guide '+custom_class)
            .attr('x', x)
            .attr('y', 0)
            .html(value)             

        svg.append('line')
            .attr('class', 'guide '+custom_class)
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)

        svg.append('line')
            .attr('class', 'guide '+custom_class)
            .attr('x1', x)
            .attr('y1', 0)
            .attr('x2', x)
            .attr('y2', height)             
    }

    var removeGuide = function(svg) {
        svg.selectAll('line.guide').remove()
        svg.selectAll('text.guide').remove()
    }

    return {
        addArrow: addArrow, 
        addGuide: addGuide,
        removeGuide: removeGuide,
        addAnnotation: addAnnotation,
        removeAnnotation: removeAnnotation
    }    
}());
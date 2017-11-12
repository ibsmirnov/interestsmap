$(function() {    
    var canvas = getCanvas();
    var axes = getAxes(canvas);
    var tooltip = getTooltip();    
    addGrid(canvas, axes);
    data.sort(function(a, b){return b['n']-a['n'];});    
    var groups = canvas.selectAll('circle').data(data).enter().append('circle');
    addAttributes(groups, axes);
    addTooltip(groups, tooltip);    
    addLegend(canvas);    
    var labels = canvas.selectAll('text.lbl').data(data).enter().append('text').attr('class', 'lbl');
    $('.lbl').hide();$('.info').hide();
    addLabels(labels, axes);
    addFilters(groups, labels);
});


function getCanvas() {
    var margin = {top: 10, right: 100, bottom: 30, left: 40};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var svg = d3.select("svg")
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.width = width;
    svg.height = height;
    return svg;
}

function getAxes(canvas) {    
    return {x: d3.scaleLinear().domain([5.6, 10.4]).range([0, canvas.width]), y: d3.scaleLinear().domain([3.6, 4.8]).range([canvas.height, 0])};    
}

function getTooltip() {
    return d3.select("body").append("div").attr('class', 'tooltip').style("position", "absolute").style("z-index", "10").style("visibility", "hidden");
}

function addAttributes(groups, axes) {
    var axes = axes;
    var radius = [2, 20];
    var n_bound = [10, 78];
    $('#size_filter').attr('min', n_bound[0]);
    $('#size_filter').attr('max', n_bound[1]);
    $('#size_filter').attr('value', n_bound[0]);
    var duration = 2000;
    var interpolator = d3.interpolateRgb.gamma(1)("orange", "purple");            
    mid_x = (axes.x.range()[1] - axes.x.range()[0]) / 2;
    mid_y = (axes.y.range()[0] - axes.y.range()[1]) / 2;
    groups
        .attr('cx', 0).attr('cy', 0).attr('r', 0).attr('r', '10')
        .style('fill', interpolator(0.5))        
        .transition().duration(duration).ease(d3.easeBounce)
        .attr('cy', function(d) {
            return axes.y(d.gpa);            
        })
        .attr('cx', function(d) {
            return axes.x(d.grade);            
        })
        .transition().duration(duration)
        .attr('r', function(d) {
            var bound = [Math.sqrt(n_bound[0]), Math.sqrt(n_bound[1])];
            var r = (Math.sqrt(d.n) - bound[0]) / (bound[1] - bound[0]) * (radius[1] - radius[0]) + radius[0];
            return r;
        }).transition().duration(duration).ease(d3.easeLinear)        
        .style('fill', function(d) {            
            return interpolator(d.gnd);
        });
}

function addLabels(labels, axes) {
    var axes = axes;
    var size = [8, 20];
    var n_bound = [10, 78];   
  
    var interpolator = d3.interpolateRgb.gamma(1)("orange", "purple");                
    labels     
        .attr('y', function(d) {
            return axes.y(d.gpa);            
        })
        .attr('x', function(d) {
            return axes.x(d.grade);            
        })
        .style('font-size', function(d) {            
            return (d.n - n_bound[0]) / (n_bound[1] - n_bound[0]) * (size[1] - size[0]) + size[0];            
        })  
        .style('fill', function(d) {            
            return interpolator(d.gnd);
        })
        .text(function(d) {
            return d.name;
        });        
}


function addTooltip(groups, tooltip) {
    var tooltip = tooltip;
    groups.on("mouseover", function(d){tooltip.text(d.name).style("visibility", "visible");})
        .on("mousemove", function(){tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){tooltip.style("visibility", "hidden");})
        .on("click", function(d){            
            $('.info').show();
            $('#gr_name').html(d.name);
            $('#gr_gender').html(Math.round((1 - d.gnd) * 100) + '%');
            $('#gr_gpa').html(Math.round(d.gpa * 100) / 100);
            $('#gr_age').html(Math.round(d.grade * 10) / 10);
            $('#gr_n').html(Math.round(d.n * 10) / 10);
            $('#gr_link').attr('href', d.url)
        });
}

function addGrid(canvas, axes) {
    canvas.append("g")           
      .attr("class", "grid")
      .attr("transform", "translate(0," + canvas.height + ")")
      .call(d3.axisBottom(axes.x).ticks(5).tickSize(-canvas.height).tickSizeOuter([0, 0]));
  
    canvas.append("g")           
      .attr("class", "grid")
      .call(d3.axisLeft(axes.y).ticks(5).tickSize(-canvas.width).tickSizeOuter([0, 0]));

    canvas.append("text")             
      .attr("transform",
            "translate(" + (canvas.width / 2) + " ," + 
                           (canvas.height + 26) + ")")
      .style("text-anchor", "middle")
      .style("font-size", 12)
      .text("Класс");

       canvas.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - 40)
      .attr("x",0 - (canvas.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", 12)
      .text("Успеваемость");    
}

function addLegend(canvas) {
    var right = -20;
    var top = 0;
    var legend = canvas.selectAll('.legend').data([0, 25, 50, 75, 100]).enter().append('g').attr('class', 'legend');
  
    legend.append('rect')
        .attr('x', canvas.width - right)
        .attr('y', function(d) {return top + 10 + d})
        .attr('width', 10).attr('height', 10)
        .attr('style', function(d) {
            var interpolator = d3.interpolateRgb.gamma(1)("orange", "purple");            
            return 'fill: ' + interpolator(d / 100);
        });
    legend.append('text')
        .attr('x', canvas.width - right + 15)
        .attr('y', function(d) {return top + 20 + d})      
        .text(function(d) { return (100 - d) + '%'; });
    
    canvas.append('text')
      .attr('x', canvas.width - right)
      .attr('y', top)      
      .text('Доля девочек');
}

function addFilters(groups, labels) {
    
    var on_change = function() {
        var val_gender = $('#gender_filter').val() * 1;
        var val_size =  $('#size_filter').val() * 1;

        var filter_function = function(d) {
            if (((d.gnd <= 1 - val_gender) || (d.gnd >= val_gender)) && (d.n >= val_size)) {
                return 'visible';
            }
            else {
                return 'hidden';
            }
        }

        groups.style('visibility', filter_function);
        labels.style('visibility', filter_function)
    }
            
    $('#gender_filter').on('input change', on_change)   
    $('#size_filter').on('input change', on_change)
    $('#show_names').on('click', function() {
        $('.lbl').toggle();
        $('circle').toggle();
    })
};

// Map data
d3.json('europe.geojson', function(data) {
    // Set width and height
    var width = 1700,
        height = 900,
        centered;

    // Create the svg
    var canvas = d3.select("#map").append('svg')
        .attr("width", width)
        .attr('height', height)
    
    var allCountries = canvas.append('g')
        .attr('class', 'allCountries')
        .attr("transform", "translate(240,0)");

    var group = allCountries.selectAll('.allCountries')
        .data(data.features)
        .enter()
        .append('g')
        .attr('id', function(d) {return d.properties.name_long})
        .attr('class', 'country')
        .on("click", zoom);

    // Projection of the map
    var projection = d3.geo.mercator()
        .scale(700)
        .translate([400, 1250]);

    var path = d3.geo.path().projection(projection);

    var areas = group.append('path')
        .attr('d', path)
        .attr('class', 'area')
        .attr('fill', 'grey')

    
    // Create infoboxes for each countrie
    var infoText = group.append('g')
        .attr('class', 'infoText')
        .attr('id', function(d) {return 't'+d.properties.name_long})

    infoText.append('rect')
        .attr('id', function(d) {return 'r'+d.properties.name_long})
        .attr('class', 'infoBox')
        .attr('width', '570px')
        .attr('height', '700px')
        .attr('fill', 'white')
        
    infoText.append('text')                
        .attr('class', 'text1')
        .attr('x', 250)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '40px')
        .text(function(d){return d.properties.name_long})  
    
    // Cross 
    infoText.append('image')
        .attr('xlink:href', 'img/cross.png')
        .attr('class', 'cross')
        .attr('y', 0)
        .attr('x', 520)
        .attr('width', 50)
        .attr('height', 50)

    $('.cross').on('click', function() {
        var currentCountry = $(this).parent().attr("id").substring(1);
        $('#'+currentCountry).attr('class', 'country');
        zoom();
    })

    // Attacks image
    infoText.append('image')
        .attr('xlink:href', 'img/attacks.png')
        .attr('class', 'cross')
        .attr('y', 120)
        .attr('x', 35)
        .attr('width', 50)
        .attr('height', 50)

    // Deads image
    infoText.append('image')
        .attr('xlink:href', 'img/deads.png')
        .attr('class', 'cross')
        .attr('y', 180)
        .attr('x', 35)
        .attr('width', 40)
        .attr('height', 40)

    $('.country .infoText').appendTo(canvas);
    $('#Vatican').remove()

    // Append text in the center of every country
    d3.selectAll('.country').append('text')
        .attr('x', function(d) {
            if(d.properties.name_long === 'Norway') {
                return 515;
            } else if (d.properties.name_long === 'Greece') {
                return 665;
            } else if (d.properties.name_long === 'United Kingdom') {
                return 370;
            } else { 
                return path.centroid(d)[0]; 
            }
        })
        .attr('y', function(d) {
            if(d.properties.name_long != 'Norway') {
                return path.centroid(d)[1]; 
            } else {
                return 300;
            }
        })
        .attr('text-anchor', 'middle')

    // When clicking a country zoom in
    function zoom(d) {
        if ($(this).find('path').css("cursor") === 'default') {
            return false;
        }

        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        var thisId = $(this).attr('id')

        if(centered && function(d) { return d === centered; }) {
            $('.allCountries g').attr('class', 'country');
            $(this).attr('class', 'active');

            $('.country').css({opacity: 0.2})
            $('.active').css({opacity: 1})

            $(".infoBox").removeAttr("style")
            $(".infoText").removeAttr("style")

              setTimeout( function(){
            $("[id='r"+thisId+"']").css("transform", "translate(0,0)")
            $("[id='t"+thisId+"']").css("transform", "translate(0,0)")
            }, 200);

        } else {
            $(this).attr('class', 'country')
            $('.country').css({opacity: 1})

            $(".infoBox").removeAttr("style")
            $(".infoText").removeAttr("style")
        }

        // Zoom transition
        group.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");            
    }
    // Source:
    // http://bl.ocks.org/mbostock/2206590
    // Used to get zooming working on click

                       
}) // End of GeoJSON
// Source:
// https://www.youtube.com/watch?v=lJgEx_yb4u0
// Used to visualize the map

// Terror JSON
d3.json('terror-years.json', function(data) {
    // Total data
    var dataTotal = d3.nest()
        .key(function(d) { return d.DATE; })
        .rollup(function(v) { return { 
            attacks: v.length,
            fatalities: d3.sum(v, function(d) { return d.FATALITIES; })
        }})
        .map(data);

    // Data sorted by country
    var dataByCountry = d3.nest()
        .key(function(d) { return d.COUNTRY; })
        .key(function(d) { return d.DATE; })
        .rollup(function(v) { return { 
            attacks: v.length,
            fatalities: d3.sum(v, function(d) { return d.FATALITIES; })
        }})
        .map(data);

    // Data sorted by weapon
    var dataByWeapon = d3.nest()
        .key(function(d) { return d.COUNTRY; })
        .key(function(d) { return d.DATE; })
        .key(function(d) { return d['TARGET TYPE']; })
        .rollup(function(v) { return { 
            attacks: v.length,
            fatalities: d3.sum(v, function(d) { return d.FATALITIES; })
        }})
        .map(data);

    // Start year
    var year = 1970;

    // Total attacks
    var totalAttacks = d3.select('#map').append('div')
        .attr('class', 'totalAttacks')
        .attr('color', 'white')

    var attackYear = totalAttacks.append('span')
        .text('Attacks in '+year)
        .style('font-weight', 'bold')

    var attackAmount = totalAttacks.append('span')
        .text(dataTotal['y'+year].attacks)

    // Color scale of the countries
    var color = d3.scale.quantize()
        .domain([0, 400])
        .range(["#e2bb8a", '#da9867', "#c67e65", "#b1685b"]);

    // Map Legend
    var mapLegend = d3.select('#map').append('div')
        .attr('class', 'mapLegend')
    
    var legendItem = mapLegend.selectAll('.legendItem')
            .data(color.range())
            .enter()
            .append('div')
            .attr('class', 'legendItem')

    legendItem.append('div')
        .attr('class', 'legendRectangle')
        .style('background', function(d) {return d})

    legendItem.append('span')
        .attr('class', 'legendText')
        .text(function(d, i) {return i*100 +100})

    // Text in countries
    d3.selectAll('.country text')
        .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id"); })
        .text(function(d) {
            if (typeof d.value['y'+year] != "undefined") {
                return d.value['y'+year].attacks 
            } else {
                return 0;
            }
        });

    // Determines the color of the countries
    d3.selectAll('.area')
        .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id"); })
        .attr('fill',function(d) { 
                if (typeof d.value['y'+year] != "undefined") {
                    return color(d.value['y'+year].attacks) 
                } else {
                    return color(0)
                }
            })

    // Infobox - Attacks
    d3.selectAll('.infoText').append('text')
        .attr('class', 'text2')        
        .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id").substring(1); })
        .attr('x', 90)
        .attr('y', 160)
        .attr('text-anchor', 'start')
        .style('font-size', '20px')
        .text(function(d){
            if (typeof d.value['y'+year] != "undefined") {
                return 'Attacks: '+d.value['y'+year].attacks 
            } else {
                return 'Attacks: '+0
            }})

    // Infobox - Fatalities
    d3.selectAll('.infoText').append('text')
        .attr('class', 'text3')        
        .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id").substring(1); })
        .attr('x', 90)
        .attr('y', 210)
        .attr('text-anchor', 'start')
        .style('font-size', '20px')
        .text(function(d){
            if (typeof d.value['y'+year] != "undefined") {
                return 'Deaths: '+d.value['y'+year].fatalities 
            } else {
                return 'Deaths: '+0
            }
        })

    // Infobox - YEAR
    d3.selectAll('.infoText').append('text')
        .attr('class', 'text4')        
        .attr('x', 246)
        .attr('y', 80)
        .attr('text-anchor', 'middle')
        .style("font-size", "25px")
        .text('1970')

    // Pie chart Attacks
    var arc = d3.svg.arc()
        .innerRadius(50)
        .outerRadius(100)

    var pie = d3.layout.pie()
        .value(function(d){ return d.value.attacks})

    // Parent of the paths that create de piechart
    var arcContainerAttacks = d3.selectAll('.infoText')
        .append('g')
        .data(d3.entries(dataByWeapon), function(d) { return (d && d.key) || $(this).parent().attr("id").substring(1); })
        .attr('class', 'arcContainerAttacks')
        .attr("transform", "translate(140,450)");

    arcContainerAttacks
        .append('g')
        .attr('class', 'attackTooltip')
            .append('text')
            .attr('x', -26)
            .attr('y', 130) 

    // Arcs with the data of weapon types
    var arcs = arcContainerAttacks.selectAll('.arc')
        .data(function(d) {return pie(d3.entries(dataByWeapon[d.key]['y'+year]))})
        .enter()
        .append('g')
        .attr('class', 'arc')
            
    // Pie color scale
    var pieColor = d3.scale.ordinal()
        .range(['#5D5266', '#874F4B', '#A46756', '#AF7A5D', '#BB9974', '#7C6F87', 'grey', '#B1685B', '#C67E65', '#DA9867', '#E2BB8A', '#988DA4', '#B1685B', '#C59082', '#D3A789', '#DCC1A4', '#B5A9C4', '#D0908A', '#DAA89E', '#E4BEA5', '#EDD4BC', '#EFC6BF', '#E7DDD5'])

    // Create the paths
    arcs.append('path')
        .attr('d', arc)
        .attr('id', function(d) {return d.data.key})
        .attr('fill', function(d) {return pieColor(d.data.key)})
        .on('mouseover', function(d) {
            d3.selectAll('.attackTooltip text')
                .text(d.data.key)
        })
        .on('mouseout', function(d) {
            d3.selectAll('.attackTooltip text')
                .text('')
        });

    // Legend
    var legendRectSize = 18;
    var legendSpacing = 4;
    
    // Add a value to the arcs, translated to the arc centroid and rotated.
    var outerRadius = 100

    arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            d.outerRadius = outerRadius; // Set Outer Coordinate
            d.innerRadius = outerRadius/2; // Set Inner Coordinate
            return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
        })
        .style("fill", "White")
        .style("font-size", "12px")
        .text(function(d) { return d.value });

    // Computes the angle of an arc, converting from radians to degrees.
    function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }
    // Source:
    // http://bl.ocks.org/Guerino1/2295263
    // Used to put the values in the arcs with the right angle

    // Add titel to pie chart - Attacks
    var titelAttacks = arcContainerAttacks.append('text')
        .attr('class', 'titel')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * pieColor.domain().length / 2;
            var horz = -1.5 * legendRectSize;
            var vert = 0
            return 'translate(' + horz + ',' + vert + ')';
        })
        .text('Attacks')

    // Pie chart Fatalities
    var pieFatalities = d3.layout.pie()
        .value(function(d){ return d.value.fatalities })

    // Parent of the paths that create de piechart
    var arcContainerFatalities = d3.selectAll('.infoText')
        .append('g')
        .data(d3.entries(dataByWeapon), function(d) { return (d && d.key) || $(this).parent().attr("id").substring(1); })
        .attr('class', 'arcContainerFatalities')
        .attr("transform", "translate(390,450)");

        arcContainerAttacks
        .append('g')
        .attr('class', 'fatalitiesTooltip')
            .append('text')
            .attr('x', 200)
            .attr('y', 130) 

    // Arcs with the data of weapon types
    var arcsFatalities = arcContainerFatalities.selectAll('.arc')
        .data(function(d) {return pieFatalities(d3.entries(dataByWeapon[d.key]['y'+year]))})
        .enter()
        .append('g')
        .attr('class', function(d) {
            if (d.value === 0) {
                return 'arcFake'
            } else {
                return 'arc'
            }
        })

    // Create the paths
    arcsFatalities.append('path')
        .attr('d', arc)
        .attr('fill', function(d) {return pieColor(d.data.key)})
        .on('mouseover', function(d) {
            d3.selectAll('.fatalitiesTooltip text')
                .text(d.data.key)
        })
        .on('mouseout', function(d) {
            d3.selectAll('.fatalitiesTooltip text')
                .text('')
        });
        
    // Add a value to the arcs, translated to the arc centroid and rotated.
    var outerRadius = 100

    arcsFatalities.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            d.outerRadius = outerRadius; // Set Outer Coordinate
            d.innerRadius = outerRadius/2; // Set Inner Coordinate
            return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
        })
        .style("fill", "White")
        .style("font-size", "12px")
        .text(function(d) { return d.value });

    // Computes the angle of an arc, converting from radians to degrees.
    function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }

    // Add titel to pie chart - Fatalities
    var titelFatalities = arcContainerFatalities.append('text')
    .attr('class', 'titel')
    .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * pieColor.domain().length / 2;
        var horz = -1.5 * legendRectSize;
        var vert = 0
        return 'translate(' + horz + ',' + vert + ')';
    })
    .text('Deaths')

    // Intro text pie chart - Attacks
    var introAttacks = arcContainerAttacks.append('text')
        .attr('class', 'intro')
        .attr("transform", "translate(0,-150)")
        .attr('text-anchor', 'middle')
        .style('text-transform', 'none')
        .style('font-size', '20px')

    introAttacks.append('tspan')
        .text('Who where the attacks on?')

    introAttacks.append('tspan')
        .text('(Mouse over the image)')
        .attr('dy', 20)
        .attr('x', 0)
        .style('font-size', '15px')

    // Intro text pie chart - Fatalities
    var introFatalities = arcContainerFatalities.append('text')
        .attr('class', 'intro')
        .attr("transform", "translate(0,-150)")
        .attr('text-anchor', 'middle')
        .style('text-transform', 'none')
        .style('font-size', '20px')

    introFatalities.append('tspan')
        .text('Who where the attacks on?')

    introFatalities.append('tspan')
        .text('(Mouse over the image)')
        .attr('dy', 20)
        .attr('x', 0)
        .style('font-size', '15px')


    // Remove the legends where no data is
    $(".arcContainerAttacks").each(function() {
        if(!$(this).find('.arc').length != 0) {
            $(this).hide()
        } else {
            $(this).show()

        }
    });

    $(".arcContainerFatalities").each(function() {
        if(!$(this).find('.arc').length != 0) {
            $(this).hide()
        } else {
            $(this).show()
        }
    });

    // SLIDER
    $('#arrowup').on('click', function() {
        slider();
    })

    $('#arrowdown').on('click', function() {
        slider();
    })

    $(window).bind('mousewheel', function(event) { 
        slider();
    }) 

    $(document).keydown(function(e) {
        slider();
    });

    var slider = function() {
        var value = $('.activeYear').text()
    
        // Text in country
        d3.selectAll('.country text')
        .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id"); })
        .text(function(d) { 
            if (typeof d.value['y'+value] != "undefined") {
                return d.value['y'+value].attacks
            } else {
                return 0
            }
        });

        // Text in country of active country
        d3.selectAll('.active text')
        .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id"); })
        .text(function(d) { 
            if (typeof d.value['y'+value] != "undefined") {
                return d.value['y'+value].attacks
            } else {
                return 0
            }             
        });

        // Color of country
        d3.selectAll('.area')
        .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id"); })
        .attr('fill',function(d) { 
            if (typeof d.value['y'+value] != "undefined") {
                return color(d.value['y'+value].attacks) 
            } else {
                return color(0)
            }
        });

        // Number of attacks in infobox
        d3.selectAll('.infoText .text2')     
            .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id").substring(1); })
            .text(function(d){
                if (typeof d.value['y'+value] != "undefined") {
                    return 'Attacks: '+d.value['y'+value].attacks 
                } else {
                    return 'Attacks: '+0
                }
            });

        // Number of Fatalities in infobox
        d3.selectAll('.infoText .text3')      
            .data(d3.entries(dataByCountry), function(d) { return (d && d.key) || $(this).parent().attr("id").substring(1); })
            .text(function(d){
                if (typeof d.value['y'+value] != "undefined") {
                    return 'Deaths: '+d.value['y'+value].fatalities 
                } else {
                    return 'Deaths: '+0
                }
            });

        // Infobox - YEAR
        d3.selectAll('.infoText .text4')      
            .text(value)

        // Arcs with the data of weapon types
        $('.arcContainerAttacks g').remove()
        $('.arcContainerFatalities').remove()

        var arcs = arcContainerAttacks.selectAll('.arc')
            .data(function(d) {return pie(d3.entries(dataByWeapon[d.key]['y'+value]))})
            .enter()
            .append('g')
            .attr('class', 'arc')
            .attr('id', function(d) {return d.data.key})

        arcContainerAttacks
            .append('g')
            .attr('class', 'attackTooltip')
                .append('text')
                .attr('x', -26)
                .attr('y', 130) 

        // Create the paths
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', function(d) {return pieColor(d.data.key)})
            .on('mouseover', function(d) {
                d3.selectAll('.attackTooltip text')
                    .text(d.data.key)
            })
            .on('mouseout', function(d) {
                d3.selectAll('.attackTooltip text')
                    .text('')
            });


        // Add a value to the arcs, translated to the arc centroid and rotated.
        arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                d.outerRadius = outerRadius; // Set Outer Coordinate
                d.innerRadius = outerRadius/2; // Set Inner Coordinate
                return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
            })
            .style("fill", "White")
            .style("font-size", "12px")
            .text(function(d) { return d.value });

        

        // Pie chart Fatalities
        var pieFatalities = d3.layout.pie()
            .value(function(d){ return d.value.fatalities })

        // Parent of the paths that create de piechart
        var arcContainerFatalities = d3.selectAll('.infoText')
            .append('g')
            .data(d3.entries(dataByWeapon), function(d) { return (d && d.key) || $(this).parent().attr("id").substring(1); })
            .attr('class', 'arcContainerFatalities')
            .attr("transform", "translate(390,450)");

        // Arcs with the data of weapon types
        var arcsFatalities = arcContainerFatalities.selectAll('.arc')
            .data(function(d) {return pieFatalities(d3.entries(dataByWeapon[d.key]['y'+value]))})
            .enter()
            .append('g')
            .attr('class', function(d) {
            if (d.value === 0) {
                return 'arcFake'
            } else {
                return 'arc'
            }
        })

        arcContainerAttacks
            .append('g')
            .attr('class', 'fatalitiesTooltip')
                .append('text')
                .attr('x', 200)
                .attr('y', 130) 

        // Create the paths
        arcsFatalities.append('path')
            .attr('d', arc)
            .attr('fill', function(d) {return pieColor(d.data.key)})
            .on('mouseover', function(d) {
                d3.selectAll('.fatalitiesTooltip text')
                    .text(d.data.key)
            })
            .on('mouseout', function(d) {
                d3.selectAll('.fatalitiesTooltip text')
                    .text('')
            });
            

        // Add a value to the arcs, translated to the arc centroid and rotated.
        arcsFatalities.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                d.outerRadius = outerRadius; // Set Outer Coordinate
                d.innerRadius = outerRadius/2; // Set Inner Coordinate
                return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
            })
            .style("fill", "White")
            .style("font-size", "12px")
            .text(function(d) { return d.value });

        var titelFatalities = arcContainerFatalities.append('text')
            .attr('class', 'titel')
            .attr('transform', function(d, i) {
                var height = legendRectSize + legendSpacing;
                var offset =  height * pieColor.domain().length / 2;
                var horz = -1.5 * legendRectSize;
                var vert = 0
                return 'translate(' + horz + ',' + vert + ')';
            })
            .text('Deaths')

        // Remove the legends where no data is
        $(".arcContainerAttacks").each(function() {
            if(!$(this).find('.arc').length != 0) {
                $(this).hide()
            } else {
                $(this).show()
            }
        });

        $(".arcContainerFatalities").each(function() {
            if(!$(this).find('.arc').length != 0) {
                $(this).hide()
            } else {
                $(this).show()
            }
        });

        attackYear
            .text('Attacks in '+value)

        attackAmount
            .text(dataTotal['y'+value].attacks)


        // Intro text pie chart - Fatalities
        var introFatalities = arcContainerFatalities.append('text')
            .attr('class', 'intro')
            .attr("transform", "translate(0,-150)")
            .attr('text-anchor', 'middle')
            .style('text-transform', 'none')
            .style('font-size', '20px')

        introFatalities.append('tspan')
            .text('Who where the attacks on?')

        introFatalities.append('tspan')
            .text('(Mouse over the image)')
            .attr('dy', 20)
            .attr('x', 0)
            .style('font-size', '15px')

    } // End slider
}) // End Terror data
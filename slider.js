// Create empty slider spans
for (var i = 0; i <= 3; i++) {
    $('#slider').append('<span></span>')
};

// Create slider spans with all years
for (var i = 1970; i <= 2014; i++) {
    $('#slider').append('<span id="y'+i+'" class="year">'+i+'</span>')
};

// Make 1970 the active year
$('#y1970').removeClass('year').addClass('activeYear')

// Scroll event
$(window).bind('mousewheel', function(event) {
    if (event.originalEvent.wheelDelta >= 0) {
        up();
    }
    else {
        down();
    };
});

// Up arrow
$('#arrowup').on('click', function() {
    up();
})

// Down arrow
$('#arrowdown').on('click', function() {
    down();
})

// Arrows up and down
$(document).keydown(function(e) {
    if (e.keyCode == 38) { 
        up();
    } else if(e.keyCode == 40) {
        down();
    }
});

// Scroll up
var up = function() {
    var currentYear = $('.activeYear').html();
    if (currentYear != 1970) {
       
        if ($("#slider span:hidden").length === 0) {
            $('#slider').prepend('<span></span>')
        }
        
        $('#slider span').each(function() {
            if($(this).next().is(":visible")) {
                $(this).show();  
            }
        });

        $('.activeYear').prev().show()
        var newYearUp = parseInt(currentYear) - 1;
        $('#slider span').addClass('year').removeClass('activeYear');
        $('#y'+newYearUp).addClass('activeYear').removeClass('year');
    };
};

// Scroll down
var down = function() {
    var currentYear = $('.activeYear').html();
    if (currentYear != 2014) {
        $($('#slider span').get().reverse()).each(function() {
            if($(this).is(":hidden")) {
                $(this).next().hide();  
            } else {
                if ($(this).prev().length === 0) {
                    $('#slider span:first-child').hide();
                }
            }
        });

        var newYearDown = parseInt(currentYear) + 1;
        $('#slider span').addClass('year').removeClass('activeYear');
        $('#y'+newYearDown).addClass('activeYear').removeClass('year');
    };
};

// Info icon click event
$('#info').on('click', function() {
    $('#popup').show(300);
});

// Close popup screen click event 
$('#popupcross').on('click', function() {
    $('#popup').hide(300);
});
$(document).ready(function() {
    var degree = 0;
    var clicks = 0;
    var content = [
        "Content 1", "Content 2", "Content 3", "Content 4",
        "Content 5", "Content 6", "Content 7", "Content 8",
        "Content 9", "Content 10", "Content 11", "Content 12"
    ];
    var colors = [
        '#16a085', '#2980b9', '#34495e', '#f39c12', '#d35400', '#c0392b',
        '#16a085', '#2980b9', '#34495e', '#f39c12', '#d35400', '#c0392b'
    ];

    $('#wheel .sec').each(function(i) {
        var t = $(this);
        var transform = 'rotate(' + (i * 30) + 'deg)';
        t.css({
            'transform': transform,
            'border-color': colors[i] + ' transparent'
        });
        t.append('<span class="fa">' + content[i] + '</span>');
    });

    $('#spin').click(function() {
        clicks++;
        degree = Math.floor(Math.random() * 360) + 720;
        var totalDegree = (degree * clicks);

        $('#inner-wheel').css({
            'transform': 'rotate(' + totalDegree + 'deg)'
        });

        $('#inner-wheel').on('transitionend webkitTransitionEnd oTransitionEnd', function() {
            var currentRotation = Math.round(totalDegree % 360);
            var selected = Math.floor((360 - currentRotation) / 30);
            if (selected < 0) {
                selected += 12;
            }
            $('#txt').html(content[selected]);
        });
    });

    $('.grid-item').hover(function() {
        gsap.to($(this), {
            scale: 1.1,
            backgroundColor: '#ffcc00',
            duration: 0.3
        });
    }, function() {
        gsap.to($(this), {
            scale: 1,
            backgroundColor: '#ccc',
            duration: 0.3
        });
    });
});

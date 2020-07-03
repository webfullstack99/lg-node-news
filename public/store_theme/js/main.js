$(document).ready(function(){
    setup();
    makeup();
});

function setup(){
    owlCarousel();
}

function makeup(){
    searchBar();
    hoverProduct();
}

// SUPPORTED FUNCTIONS ===============
// make up
function searchBar(){
    let cvertToClearBtn = function (){
        $('#search-btn').attr('btn-type', 'clear')
        $('#search-btn').children('svg').removeClass('fa-search').addClass('fa-times');
    }

    let cvertToSearchBtn = function (){
        $('#search-btn').attr('btn-type', 'search');
        $('#search-btn').children('svg').addClass('fa-search').remove('fa-times');
    }
    $('#search-input').focus(function(){
        cvertToClearBtn();
    })
    
    $('#search-input').blur(function(){
        if ($(this).val().trim() == '') cvertToSearchBtn();
    })

    $('#search-form').on('click', 'a[btn-type="clear"]', function(){
        $('#search-input').val('');
        cvertToSearchBtn();
    });
}

function hoverProduct(){
    $('.product-card').hover(function(){
        $(this).children('.card-body').children('a').addClass('pink-hover');
    })

    $('.product-card').mouseleave(function(){
        $(this).children('.card-body').children('a').removeClass('pink-hover');
    })
}

// setup
function owlCarousel(){
    $('.owl-carousel').owlCarousel({
        items:3,
        nav:true,
        margin:10,
    })
}
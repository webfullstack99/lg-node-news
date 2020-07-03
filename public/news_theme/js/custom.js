$(document).ready(function(){
    ajax();
    makeup();
    form();
    sendFormByAjax();
    let scrollSaved = localStorage.getItem('scrollTop');
    if (scrollSaved){
        console.log(scrollSaved);
        //$(document).scrollTop(scrollSaved)
    }
    $(window).on('beforeunload', function(){
        let scrollHeight = $(document).scrollTop();
        localStorage.setItem('scrollTop', scrollHeight);
    });
})

//AJAX
var disabledTime = 500;
function ajax(){
    loadMorePostAjax();
}

function loadMorePostAjax(){
    // selector
    let postWrapperObj = '#post-in-cat-wrapper';
    let loadBtn = '#load-more-btn'; 

    let loadPost = function(){
        $(postWrapperObj).attr('load-posts', 'inactive');
        $(loadBtn).attr('disabled', 'disabled');
        let catId = $(postWrapperObj).attr('catId');
        let skip = $(postWrapperObj + ' > .single-post').length;
        let link = getPureUrl()+'/'+$(postWrapperObj).attr('link');
        $.ajax({
            url: link, type: 'get',
            data: { catId: catId, skip: skip },
            success: function (data, status){
                if (data != 'false'){
                    if ($(window).width() <= 767.98){
                        let bottomWrapper = $(postWrapperObj).position().top+$(postWrapperObj).height() + 120;
                        $('html, body').animate({scrollTop: bottomWrapper}, disabledTime);
                    } 
                    $(data).appendTo(postWrapperObj).hide().fadeIn();
                    let isOutOfPost = $($(data)[$(data).length -1]).val();
                    if (isOutOfPost == 'true'){
                        $(loadBtn).fadeOut();
                        setTimeout(() => {
                            $(loadBtn).detach();
                        }, disabledTime);
                    }else{
                        setTimeout(function(){
                            $(postWrapperObj).attr('load-posts', 'active');
                            $(loadBtn).removeAttr('disabled'); 
                        }, disabledTime);
                    }
                }
            }
        })
    }

    // load when click button (small screen)
    $(loadBtn).click(function(){
        loadPost();
    })

    // load when read bottom (large screen)
    $(window).scroll(function(){
        if ($('.load-more-container').css('display') != 'block'){
            let readBottom = $(document).height() - $(window).height() - 500;
            if ($(postWrapperObj).attr('load-posts') == 'active' && $(window).scrollTop() >= readBottom) loadPost();
        }
    })

}

// SEND FORM BY AJAX
function sendFormByAjax(){
    sendUpdatePassEmail();
}

function sendUpdatePassEmail(){
    $('#forgot-pass-form').submit(function(e){
        let modal = '#forgot-pass-modal';
        let email = '#forgot-pass-form input[name="email"]';
        let link = getPureUrl()+window.location.pathname.replace(/(?<=\/)[a-z]+$/, 'send-update-pass-email');
    
        // remove prev errors
        $(modal+' .validate-errors-container').detach();
        $.ajax({
            url: link,
            data: {email: $(email).val()},
            type: 'post',
            success: function(data, status){
                // validate error
                if (data.trim() !== 'success'){
                    $(modal+' .modal-body').prepend('<div class="validate-errors-container">'+data+'</div>');
                    
                // send mail success
                }else{ 
                    setTimeout(() => { alert('Please check your email'); }, 1000);
                    $(modal).modal('hide'); 
                    $(email).val('')
                }
                

            },
        })
        e.preventDefault();
    })
}

// MAKEUP
function makeup(){
    activeSideBar();
}

// active sidebar
function activeSideBar(){
    let path = window.location.pathname;
    let activeItem = $('.news-menu').children('li[name="'+path+'"]');
    activeItem.addClass('menu-active');
}

// FORM
function form(){
    changeLoginBy();
}

function changeLoginBy(){
    $('#anotherLoginBy').click(function(e){
        // code here
        let loginByInput =  'input[name="loginBy"]';
        let currentLoginBy = $(loginByInput).val();
        let anotherLoginBy = (currentLoginBy == 'username') ? 'email' : 'username';
        let loginInput = $('input[name="'+currentLoginBy+'"]');

        if (anotherLoginBy == 'email'){
            $(loginInput).attr('type', 'email').attr('name', anotherLoginBy).attr('id', anotherLoginBy);
        }else $(loginInput).attr('type', 'text').attr('name', anotherLoginBy).attr('id', anotherLoginBy);

        $('label[for="'+currentLoginBy+'"]').text(anotherLoginBy[0].toUpperCase()+anotherLoginBy.slice(1).toLowerCase()).attr('for', anotherLoginBy);
        $('#anotherLoginBy').children('span').text(currentLoginBy);
        $(loginByInput).val(anotherLoginBy);
        e.preventDefault();
    });
}
// SUPPORTED FUNCTIONS ==========
function getPureUrl(){
	return (window.location.protocol+'//'+window.location.hostname+':'+window.location.port);
}
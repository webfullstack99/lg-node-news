// selector
let $prefix; 
let friends; 
let emoji;

$(document).ready(function(){
    $prefix = JSON.parse($('input[name="prefix"]').val());
    try{ friends = JSON.parse($('input[name="friends"]').val()); }catch (e){ friends = {}; }
    general();
    $(document).on('keydown', sltor.msgDiv, function(e){
        if (e.which == 13){
            console.log('press enter');
            $(sltor.msgForm).submit();
        }
    });
})

function general(){
    scrollDirectChatToBottom(true);
    logoutConfirm();
    setUpEmojionearea();
    showDirectChatHistory();
    preventDropdownCloseWhenClickInside();
    activeNavbarLink();
}

function activeNavbarLink(){
    let pathname = window.location.pathname;
    let $$link = $('#navbar-menu > li > a');
    $$link.filter(function(){
        let href = $(this).attr('href');
        if (href == pathname) $(this).parent().addClass('active');
    })
}

function preventDropdownCloseWhenClickInside(){
    $('.dropdown').on({
        "click": function(event) {
            if ($(event.target).closest('.dropdown-toggle').length) {
                $(this).data('closable', true);
            } else {
                $(this).data('closable', false);
            }
        },
        "hide.bs.dropdown": function(event) {
            hide = $(this).data('closable');
            $(this).data('closable', true);
            return hide;
        }
    });
}

function showDirectChatHistory(){
    $(document).on('click', sltor.chatText, function(){
        if ($(this).parents(sltor.msg).children('small').length < 1){
            let msgPostion = ($(this).parents(sltor.msg).hasClass('right')) ? 'right' : 'left';

            // get postion of msg container
            let posObj = $(this).parents(sltor.msg).position();

            // create history xhtml
            let xhtml = '<small style="width:'+$(this).parents(sltor.msg).width()+'px; left: '+posObj.left+'" class="message-history-'+msgPostion+' text-date">'+$(this).attr('title')+'</small>';

            // append and show with slide down effect
            $(this).parents(sltor.msg).append(xhtml); $(this).parents(sltor.msg).children('.message-history-'+msgPostion).slideDown(400);

            // margin bottom effect
            $(this).parents(sltor.msg).animate({ 'padding-bottom': '15px' }, 500);
        }
    })
}

function setUpEmojionearea(){
    emoji = $(sltor.msgInput).emojioneArea({
        search: false,
        filtersPosition: 'bottom',
    });
}

function logoutConfirm(){
    $('#logout-btn').click(function(e){
        let link = $(this).attr('href');
        let ok = confirm("Do you want to logout?");
        if (ok) window.location.href = link;
        e.preventDefault(e);
    })
}

function scrollDirectChatToBottom(isAnimation = false){
    try{
        if (isAnimation){
            $(sltor.msgContainer).animate({
                scrollTop: $(sltor.msgContainer)[0].scrollHeight+'px',
            }, 500);
        }else $(sltor.msgContainer).scrollTop($(sltor.msgContainer)[0].scrollHeight); 
    }catch (e){ console.log(e.message); }
}

function standardizeLink(link){
    link = link.trim();
    if (link == '#'){ link = 'javascript:void(0)';
    }else{ link = link.replace(/(\/{2,})/g, '/'); }
    return link;
}
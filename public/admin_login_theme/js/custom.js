$(document).ready(function(){
    changeLoginBy();
    sendUpdatePassEmail();
})

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

function changeLoginBy(){
    $('#anotherLoginBy').click(function(e){
        // code here
        let loginByInput =  'input[name="loginBy"]';
        let currentLoginBy = $(loginByInput).val();
        let anotherLoginBy = (currentLoginBy == 'username') ? 'email' : 'username';
        let loginInput = 'input[name="'+currentLoginBy+'"]';
        
        if ($(loginInput).attr('placeholder')) $(loginInput).attr('placeholder', ucfirst(anotherLoginBy));
        if (anotherLoginBy == 'email'){
            $(loginInput).attr('type', 'email').attr('name', anotherLoginBy).attr('id', anotherLoginBy);
        }else $(loginInput).attr('type', 'text').attr('name', anotherLoginBy).attr('id', anotherLoginBy);

        $('label[for="'+currentLoginBy+'"]').text(anotherLoginBy[0].toUpperCase()+anotherLoginBy.slice(1).toLowerCase()).attr('for', anotherLoginBy);
        $('#anotherLoginBy').children('span').text(currentLoginBy);
        $(loginByInput).val(anotherLoginBy);
        e.preventDefault();
    });
}

function ucfirst(string){
    if (string){ return string.substr(0,1).toUpperCase()+string.slice(1); }
}

function getPureUrl(){
	return (window.location.protocol+'//'+window.location.hostname+':'+window.location.port);
}
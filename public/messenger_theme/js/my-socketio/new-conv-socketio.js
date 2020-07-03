$(document).ready(function(){
    let isSentMsg = false;
    var socket = io();
    partialsSocket.run(socket);
    receiverReceiverFromServer();
    sendClientTypingReceiver();
    addSelectedReceiver();
    removeSelectedReceiver();
    sendMsgToServer();
    receiveConvIdFromServer();
    receiveConvDataFromServer();

    function receiverReceiverFromServer(){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_RECEIVER`, (data) => {
            $(sltor.receiverDropdownMenu).html(data.receiversXhtml);
            openReceiverDropdownIfClose();
        });
    }

    function receiveConvDataFromServer(){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_CONV_DATA`, (data) => {
            $(sltor.msgContainer).html(data.msgsXhtml);
            $(sltor.firstSideBarSmConv).detach();
            $(sltor.recentConversationsBox).prepend(data.smConvXhtml);
        });
    }

    let typingReceiverTimeout;
    let receiverEmptyFlag = 1;

    // send client want get con msgs
    function sendClientWantGetConvData(){
        socket.emit(`${sltor.prfSocketio}CLIENT_WANT_GET_CONV_DATA`, myLib.getClientWantGetConvDataParams());
    }

    // send msg
    function receiveConvIdFromServer(){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_CONV_ID`, (data) => {
            window.location.replace(data.redirectLink);
        });
    }

    function sendMsgToServer(){
        $(sltor.msgForm).submit(function(){
            // cancel if submit empty value
            if (myLib.isMsgEmpty()) return false;
            if (myLib.isSelectedReceiverEmpty()) return false;
            if (!isSentMsg) socket.emit(`${sltor.prfSocketio}CLIENT_SEND_NEW_CONV_MSG`, myLib.getNewConvSendMsgParams());
            isSentMsg = true;
                // set empty
            return false;
        })
    }

    // send client typing receiver
    function sendClientTypingReceiver(){
        // prevent enter press
        $(sltor.receiverValue).keydown(function(e){ if ([13, 32].includes(e.which)){ e.preventDefault(); } })

        $(sltor.receiverValue).keyup(function(e){
            notifySearching();
            clearTimeout(typingReceiverTimeout);
            updateReceiverEmptyFlag($(this).text());
            typingReceiverTimeout = setTimeout(()=>{
                if ($(this).text().trim() != ''){
                    socket.emit(`${sltor.prfSocketio}CLIENT_TYPING_RECEIVER_NAME`, myLib.getClientTypingReceiverParams());
                }else{ 
                    closeReceiverDropdown(); 
                }
            }, params.typingReceiverTime);
        })
    }

    function closeReceiverDropdown(){
        $(sltor.receiverDropdown).removeClass('open')
    }

    function openReceiverDropdownIfClose(){
        if (!$(sltor.receiverDropdown).hasClass('open')) $(sltor.receiverDropdown).addClass('open');
    }

    function addSelectedReceiver(){
        $(document).on('click', sltor.singleReceiverInDropdown, function(){
            // add new id
            let id = $(this).data('userid');
            let oldUserIds = $(sltor.receiverIdsInput).val();
            let newUserIds = JSON.parse(oldUserIds);
            newUserIds.push(id);
            $(sltor.receiverIdsInput).val(JSON.stringify(newUserIds));

            username = $(this).find('.s-u-content').text();
            $(sltor.selectedReceivers).append(`<button class="btn btn-primary btn-sm" data-userid="${id}">${username}</button`);
            $(this).parent().detach();
            let totalReceiverInDropdown = $(sltor.singleReceiverInDropdown).length;
            if (totalReceiverInDropdown < 1) closeReceiverDropdown();
            $(sltor.receiverValue).text('');
            sendClientWantGetConvData();
        });
    }

    function removeSelectedReceiver(){
        $(sltor.receiverValue).keyup(function(e){
            if (receiverEmptyFlag <= -1){
                if (e.which == 8){
                    // remove id from input
                    let item = $(sltor.lastSelectedReceiver);
                    let oldUserIds = $(sltor.receiverIdsInput).val();
                    let newUserIds = JSON.parse(oldUserIds);
                    newUserIds.pop();
                    $(sltor.receiverIdsInput).val(JSON.stringify(newUserIds));
                    $(item).detach();
                    sendClientWantGetConvData();
                }
            }
        });
    }

    function updateReceiverEmptyFlag(value){
        if (value.trim() == '') receiverEmptyFlag--;
        else receiverEmptyFlag = 1;
    }

    function notifySearching(){
        let $item = sltor.receiverDropdownMenu + ' > li[data-type="searching"]';
        if ($($item).length < 1){
            $(sltor.receiverDropdownMenu).html('<li data-type="searching"><i class="fa fa-spinner fa-pulse"></i> Searching ...</li>');
            openReceiverDropdownIfClose();
        }
    }
})

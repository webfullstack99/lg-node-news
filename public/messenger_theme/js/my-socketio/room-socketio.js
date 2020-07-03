$(document).ready(function(){
    var socket = io();
    partialsSocket.run(socket);
    sendUserConnect(socket);
    receiveUsersOnline(socket);
    sendMsgToServer(socket);
    receiveMsgFromServer(socket);
    receiveUpdateSmConv(socket);
    sendClientTyping(socket);
    receiveClientTyping(socket);
    receiveClientStopTyping(socket);

    // user connect
    function receiveUsersOnline(socket){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_USERS_ONLINE`, (data) => {
            myLib.showUsersOnlineList({data})
            $(sltor.totalRoomMember).text(data.xhtml.length);
        })
    }

    function sendUserConnect(socket){
        socket.emit(`${sltor.prfSocketio}USER_CONNECT`, myLib.getRoomUserConnectionParams());
    }

    // stop typing
    function receiveClientStopTyping(socket){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_CLIENT_STOP_TYPING`, function (data){
            myLib.removeUserTyping({data});
        })
    }

    let typingTimeout;
    function sendClientStopTyping(socket){
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => { 
            socket.emit(`${sltor.prfSocketio}CLIENT_STOP_TYPING`, {room: $(sltor.roomInput).val(), username: $(sltor.usernameInput).val()}); 
        }, params.typingTime);
    }

    // typing
    function receiveClientTyping(socket){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_CLIENT_TYPING`, function (data){
            myLib.showUserTyping({data});
        })
    }

    function sendClientTyping(socket){
        $(document).on('keyup', '.emojionearea-editor', function(){
            let text = $(sltor.msgInput).data("emojioneArea").getText();
            if (text.length > 3){
                socket.emit(`${sltor.prfSocketio}CLIENT_TYPING`, myLib.getRoomUserTypingParams());
                sendClientStopTyping(socket);
            }
        });
    }

    // message
    function receiveMsgFromServer(socket){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_BROADCAST_MSG`, (data) => {
            myLib.showReturnMsg(data)
        })

        socket.on(`${sltor.prfSocketio}SERVER_RETURN_SENDER_MSG`, (data) => {
            myLib.showReturnMsg(data)
        })
    }

    function sendMsgToServer(socket){
        $(sltor.msgForm).submit(function(){
            // cancel if submit empty value
            if (myLib.isMsgEmpty()) return false;
            socket.emit(`${sltor.prfSocketio}CLIENT_SEND_MSG`, myLib.getRoomMsgSendingParams());
            sendUpdateSmConv(socket);
            // set empty
            myLib.setEmptyMsgInput();
            return false;
        })
    }


    function receiveUpdateSmConv(socket){
        socket.on(`${sltor.prfSocketio}SERVER_RETURN_BROADCAST_SM_CONV`, (data) => {
            myLib.updateConversations(data);
        });

        socket.on(`${sltor.prfSocketio}SERVER_RETURN_SENDER_SM_CONV`, (data) => {
            myLib.updateConversations(data);
        });
    }

    function sendUpdateSmConv(socket){
        if (params.controller == 'messages'){
            setTimeout(() => {
                socket.emit(`${sltor.prfSocketio}CLIENT_WANT_UPDATE_SM_CONV`, myLib.getUpdateSmConvParams());
            }, params.delayTime);
        } 
    }
})

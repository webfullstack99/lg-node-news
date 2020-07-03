$(document).ready(function(){
    var socket = io();

    let typingTimeout;
    partialsSocket.run(socket);

    // chat
    sendMsgToServer(socket);
    sendClientTyping(socket);
    receiveClientTyping(socket);
    receiveClientStopTyping(socket);
    receiveMsgFromServer(socket);


    // stop typing
    function receiveClientStopTyping(socket){
        socket.on(`${params.prefix.socketio.server}SERVER_RETURN_CLIENT_STOP_TYPING`, function (data){
            myLib.removeUserTyping({data});
        })
    }

    function sendClientStopTyping(socket){
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => { 
            socket.emit(`${params.prefix.socketio.server}CLIENT_STOP_TYPING`, {username: $(sltor.usernameInput).val()}); 
        }, params.typingTime);
    }

    // typing
    function receiveClientTyping(socket){
        socket.on(`${params.prefix.socketio.server}SERVER_RETURN_CLIENT_TYPING`, function (data){
            myLib.showUserTyping({data});
        })
    }

    function sendClientTyping(socket){
        $(document).on('keyup', '.emojionearea-editor', function(){
            let text = $(sltor.msgInput).data("emojioneArea").getText();
            if (text.length > 3){
                socket.emit(`${params.prefix.socketio.server}CLIENT_TYPING`, myLib.getServerUserTypingParams());
                sendClientStopTyping(socket);
            }
        });
    }

    // message
    function receiveMsgFromServer(socket){
        socket.on(`${params.prefix.socketio.server}SERVER_RETURN_BROADCAST_MSG`, (data) => {
            myLib.showReturnMsg(data);
        })

        socket.on(`${params.prefix.socketio.server}SERVER_RETURN_SENDER_MSG`, (data) => {
            myLib.showReturnMsg(data);
        })
    }

    function sendMsgToServer(socket){
        $(sltor.msgForm).submit(function(){
            console.log('form submit');
            // cancel if submit empty value
            if (myLib.isMsgEmpty()) return false;
            socket.emit(`${params.prefix.socketio.server}CLIENT_SEND_MSG`, myLib.getRoomMsgSendingParams());

            // set empty
            myLib.setEmptyMsgInput();
            return false;
        })
    }
})

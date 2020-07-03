// global selector
let $msgContainer = 'div.direct-chat-messages';
let $msg = 'div.direct-chat-msg';
let $chatText = '.direct-chat-text';
let $msgInput = 'input#msg-input';

$(document).ready(function(){
    // selectors
        // message
        let $usersTypingContainer = 'div.users-typing';
        let $msgForm = 'form#send-msg-form';
        let $userIdInput = 'input[name="userId"]';
        let $usernameInput = 'input[name="username"]';
        let $thumbInput = 'input[name="thumb"]';

        // users online
        let $totalFriendsOnlineElm = 'span#total-users-online';
        let $usersOnlineBoxElm = 'div.users-online-box';

        // single user
        let $singleUserElm = '.single-user';
        let $userBtnContainerElm = '.btns-container';
        let $userBtn = '.user-btn';

        // notifications
        let $friendInvitationBox = 'li#friend-invitation-box';
        let $totalFriendRequest = '.total-friend-request';

        // prefix
        let prfSocketio = $('input[name="prfSocketio"]').val();

    // timeout
    let typingTimeout;

    // time
    let typingTime = 3000;

    var socket = io();
    sendUserConnect(socket);
    sendMsgToServer(socket);
    sendClientTyping(socket);
    clickUserBtn(socket);
    receiveFromServer();

    // receive from server
    function receiveFromServer(){
        // users online
        receiveUsersOnline(socket);

        // message
        receiveClientTyping(socket);
        receiveClientStopTyping(socket);
        receiveMsgFromServer(socket);
        
        // friend
        receiveFriendsFromServer(socket);
        receiveFriendRequestNotifyFromServer(socket);
        receiveFriendAcceptNotifyFromServer(socket);
        receiveFriendDenyNotifyFromServer(socket);
        receiveFriendUnfriendNotifyFromServer(socket);
        receiveFriendCancelRequestNotifyFromServer(socket);
    }

    // user connect
    function receiveUsersOnline(socket){
        socket.on(`${prfSocketio}SERVER_RETURN_USERS_ONLINE`, (data) => {
            myLib.showUsersOnlineList({friends: friends, $singleUserElm, $userBtnContainerElm, $userBtn, $usernameInput, $totalFriendsOnlineElm, $usersOnlineBoxElm, data})
        })
    }

    function sendUserConnect(socket){
        socket.emit(`${prfSocketio}USER_CONNECT`, myLib.getServerUserConnectionParams({friends, $userIdInput, $usernameInput, $thumbInput}));
    }

    // stop typing
    function receiveClientStopTyping(socket){
        socket.on(`${prfSocketio}SERVER_RETURN_CLIENT_STOP_TYPING`, function (data){
            myLib.removeUserTyping({$usersTypingContainer, data});
        })
    }

    function sendClientStopTyping(socket){
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => { 
            socket.emit(`${prfSocketio}CLIENT_STOP_TYPING`, {username: $($usernameInput).val()}); 
        }, typingTime);
    }

    // typing
    function receiveClientTyping(socket){
        socket.on(`${prfSocketio}SERVER_RETURN_CLIENT_TYPING`, function (data){
            myLib.showUserTyping({$usersTypingContainer, data});
        })
    }

    function sendClientTyping(socket){
        $(document).on('keyup', '.emojionearea-editor', function(){
            let text = $($msgInput).data("emojioneArea").getText();
            if (text.length > 3){
                socket.emit(`${prfSocketio}CLIENT_TYPING`, myLib.getServerUserTypingParams({$usernameInput, $thumbInput}));
                sendClientStopTyping(socket);
            }
        });
    }

    // message
    function receiveMsgFromServer(socket){
        socket.on(`${prfSocketio}SERVER_RETURN_BROADCAST_MSG`, (data) => {
            myLib.showReturnMsg({$msgContainer, data})
        })

        socket.on(`${prfSocketio}SERVER_RETURN_SENDER_MSG`, (data) => {
            myLib.showReturnMsg({$msgContainer, data})
        })
    }

    function sendMsgToServer(socket){
        $($msgForm).submit(function(){
            // cancel if submit empty value
            if ($($msgInput).val().trim() === '') return false;
            socket.emit(`${prfSocketio}CLIENT_SEND_MSG`, myLib.getRoomMsgSendingParams({$msgInput, $userIdInput, $usernameInput, $thumbInput}));

            // set empty
            myLib.setEmptyMsgInput({$msgInput});
            return false;
        })
    }

    // friend
        function receiveFriendsFromServer(socket){
            socket.on(`${prfSocketio}SERVER_RETURN_FRIENDS`, (data) => { friends = data.friends.friends; });
        }

        //notify
        function receiveFriendRequestNotifyFromServer(socket){
            socket.on(`${prfSocketio}SERVER_RETURN_FRIEND_REQUEST_NOTIFY`, (data) => {
                $($friendInvitationBox).prepend(data.xhtml);
                myLib.updateTotalElm({value: 1, $elm: $totalFriendRequest});
                myLib.showNotifyWithTemplate({$templateId: 'notify-user', relationship: 'receive-invite', params: data.data});
                myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: data.data.friendUserId, newRelationship: 'receive-invite'});
                updateFriendsInput();
            })
        }

        function receiveFriendAcceptNotifyFromServer(socket){
            socket.on(`${prfSocketio}SERVER_RETURN_FRIEND_ACCEPT_NOTIFY`, (data) => {
                myLib.showNotifyWithTemplate({$templateId: 'notify-user', relationship: 'friend', params: data.data});
                myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: data.data.friendUserId, newRelationship: 'friend'});
                updateFriendsInput();
            })
        }

        function receiveFriendDenyNotifyFromServer(socket){
            socket.on(`${prfSocketio}SERVER_RETURN_FRIEND_DENY_NOTIFY`, (data) => {
                myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: data.data.friendUserId, newRelationship: 'stranger'});
                updateFriendsInput();
            })
        }

        function receiveFriendCancelRequestNotifyFromServer(socket){
            socket.on(`${prfSocketio}SERVER_RETURN_FRIEND_CANCEL_REQUEST_NOTIFY`, (data) => {
                myLib.removeFriendRequest({$totalFriendRequest, $singleUserElm, $userBtnContainerElm, $friendInvitationBox, userId: data.data.friendUserId})
                myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: data.data.friendUserId, newRelationship: 'stranger'});
                updateFriendsInput();
            })
        }

        function receiveFriendUnfriendNotifyFromServer(socket){
            socket.on(`${prfSocketio}SERVER_RETURN_FRIEND_UNFRIEND_NOTIFY`, (data) => {
                myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: data.data.friendUserId, newRelationship: 'stranger'});
                updateFriendsInput();
            })
        }

    // click user online btn
    function clickUserBtn(socket){
        $(document).on('click', $userBtn, function(){
            let btnType = $(this).data('type');
            switch (btnType){
                case 'add':
                    addFriend(socket, this);
                    break;
                case 'deny':
                    friendDeny(socket, this);
                    break;
                case 'accept':
                    friendAccept(socket, this);
                    break;
                case 'unfriend':
                    friendUnfriend(socket, this);
                    break;
                case 'cancel-request':
                    friendCancelRequest(socket, this);
                    break;
            }
        })
    }

    function addFriend(socket, $elmObj){
        let url = standardizeLink(`${params.prefix.mess}/api/friend-add`);
        let userId = $($userIdInput).val();
        let friendUserId = $($elmObj).parent().data('userid');
        $.ajax({
            type: 'get',
            url: url,
            data: {userId, friendUserId},
            success: function (data, status){
                if (data.status == 'success'){
                    socket.emit(`${prfSocketio}CLIENT_NOTIFY_FRIEND_REQUEST`, myLib.getFriendParams({$userBtn: $elmObj, $userIdInput, $usernameInput, $thumbInput}));
                    myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: friendUserId, newRelationship: 'sent-invite'});
                    updateFriendsInput();
                }else alert('something went wrong');
            }
        })
    }

    function friendAccept(socket, $elmObj){
        let url = standardizeLink(`${params.prefix.mess}/api/friend-accept`);
        let userId = $($userIdInput).val();
        let friendUserId = $($elmObj).parent().data('userid');
        $.ajax({
            type: 'get',
            url: url,
            data: {userId, friendUserId},
            success: function (data, status){
                if (data.status == 'success'){
                    socket.emit(`${prfSocketio}CLIENT_NOTIFY_FRIEND_ACCEPT`, myLib.getFriendParams({$userBtn: $elmObj, $userIdInput, $usernameInput, $thumbInput}));
                    myLib.removeFriendRequest({$totalFriendRequest, $singleUserElm, $userBtnContainerElm, $friendInvitationBox, userId: friendUserId})
                    myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: friendUserId, newRelationship: 'friend'});
                    updateFriendsInput();
                }else alert('something went wrong');
            }
        })
    }

    function friendDeny(socket, $elmObj){
        let url = standardizeLink(`${params.prefix.mess}/api/friend-deny`);
        let userId = $($userIdInput).val();
        let friendUserId = $($elmObj).parent().data('userid');
        $.ajax({
            type: 'get',
            url: url,
            data: {userId, friendUserId},
            success: function (data, status){
                if (data.status == 'success'){
                    socket.emit(`${prfSocketio}CLIENT_NOTIFY_FRIEND_DENY`, myLib.getFriendParams({$userBtn: $elmObj, $userIdInput, $usernameInput, $thumbInput}));
                    myLib.removeFriendRequest({$totalFriendRequest, $singleUserElm, $userBtnContainerElm, $friendInvitationBox, userId: friendUserId})
                    myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: friendUserId, newRelationship: 'stranger'});
                    updateFriendsInput();
                }else alert('something went wrong');
            }
        })
    }

    function friendUnfriend(socket, $elmObj){
        let url = standardizeLink(`${params.prefix.mess}/api/friend-unfriend`);
        let userId = $($userIdInput).val();
        let friendUserId = $($elmObj).parent().data('userid');
        $.ajax({
            type: 'get',
            url: url,
            data: {userId, friendUserId},
            success: function (data, status){
                if (data.status == 'success'){
                    socket.emit(`${prfSocketio}CLIENT_NOTIFY_FRIEND_UNFRIEND`, myLib.getFriendParams({$userBtn: $elmObj, $userIdInput, $usernameInput, $thumbInput}));
                    myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: friendUserId, newRelationship: 'stranger'});
                    updateFriendsInput();
                }else alert('something went wrong');
            }
        })
    }

    function friendCancelRequest(socket, $elmObj){
        let url = standardizeLink(`${params.prefix.mess}/api/friend-cancel-request`);
        let userId = $($userIdInput).val();
        let friendUserId = $($elmObj).parent().data('userid');
        $.ajax({
            type: 'get',
            url: url,
            data: {userId, friendUserId},
            success: function (data, status){
                if (data.status == 'success'){
                    socket.emit(`${prfSocketio}CLIENT_NOTIFY_FRIEND_CANCEL_REQUEST`, myLib.getFriendParams({$userBtn: $elmObj, $userIdInput, $usernameInput, $thumbInput}));
                    myLib.changeUserBtn({$userBtnContainerElm, $userBtn, userId: friendUserId, newRelationship: 'stranger'});
                    updateFriendsInput();
                }else alert('something went wrong');
            }
        })
    }

    function updateFriendsInput(){
        socket.emit(`${prfSocketio}CLIENT_WANT_UPDATE_FRIENDS`, {userId: $($userIdInput).val()});
    }
})

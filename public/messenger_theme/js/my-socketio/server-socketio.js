let partialsSocket;
$(document).ready(function(){
    partialsSocket = {
        // main run
        run: function(socket){
            // connect
            this.sendUserConnect(socket);

            // friend
            this.clickUserBtn(socket);
            this.receiveUsersOnline(socket);
            this.receiveFriendsFromServer(socket);
            this.receiveFriendRequestNotifyFromServer(socket);
            this.receiveFriendAcceptNotifyFromServer(socket);
            this.receiveFriendDenyNotifyFromServer(socket);
            this.receiveFriendUnfriendNotifyFromServer(socket);
            this.receiveFriendCancelRequestNotifyFromServer(socket);
            this.receiveMsgNotifyFromServer(socket);
            this.receiveMsgInBoxFromServer(socket);
        },

        // user connect
        receiveUsersOnline(socket){
            socket.on(`${params.prefix.socketio.server}SERVER_RETURN_USERS_ONLINE`, (data) => {
                if (sltor.prfSocketio != 'ROOM_') myLib.showUsersOnlineList({data})
            })
        },

        sendUserConnect: function(socket){
            socket.emit(`${params.prefix.socketio.server}USER_CONNECT`, myLib.getServerUserConnectionParams());
        },

        // friend
            receiveFriendsFromServer: function(socket){
                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIENDS`, (data) => {
                    params.friends = data.friends.friends; 
                });
            },

            //notify
            receiveFriendRequestNotifyFromServer: function(socket){
                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_REQUEST_NOTIFY`, (data) => {
                    myLib.addChild({$parent: sltor.userInvitationsBox, xhtml: data.friendInvitationXhtml, type: 'prepend'})
                    $(sltor.friendInvitationBox).prepend(data.xhtml);
                    myLib.updateTotalElm({value: 1, $elm: sltor.totalFriendRequest});
                    myLib.showUserRelationshipChangeNotify({templateId: 'notify-user', relationship: 'receive-invite', params: data.data});
                    myLib.changeUserBtn({ userId: data.data.userId, relationship: 'receive-invite'});
                    myLib.removeFriendAdd(data.data.userId);
                    this.updateFriendsInput(socket);
                })

                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_REQUEST`, (data) => {
                    myLib.addChild({$parent: sltor.userSentInvitationsBox, xhtml: data.xhtml, type: 'prepend'})
                });
            },

            receiveFriendAcceptNotifyFromServer: function(socket){
                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_ACCEPT_NOTIFY`, (data) => {
                    myLib.showUserRelationshipChangeNotify({templateId: 'notify-user', relationship: 'receive-invite', params: data.data});
                    myLib.changeUserBtn({userId: data.data.userId, relationship: 'friendx'});
                    myLib.addChild({$parent: sltor.userFriendsBox, xhtml: data.xhtml, type: 'prepend'})
                    myLib.removeSentInvitation(data.data.userId);
                    this.updateFriendsInput(socket);
                })

                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_ACCEPT`, (data) => {
                    myLib.addChild({$parent: sltor.userFriendsBox, xhtml: data.xhtml, type: 'prepend'})
                });
            },

            receiveFriendDenyNotifyFromServer: function(socket){
                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_DENY_NOTIFY`, (data) => {
                    myLib.changeUserBtn({userId: data.data.userId, relationship: 'stranger'});
                    this.updateFriendsInput(socket);
                    myLib.removeSentInvitation(data.data.userId);
                    myLib.addChild({$parent: sltor.friendSuggestionsBox, xhtml: data.xhtml, type: 'prepend'})
                })

                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_DENY`, (data) => {
                    myLib.addChild({$parent: sltor.friendSuggestionsBox, xhtml: data.xhtml, type: 'prepend'})
                });
            },

            receiveFriendCancelRequestNotifyFromServer: function(socket){
                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_CANCEL_REQUEST_NOTIFY`, (data) => {
                    myLib.removeFriendRequest({userId: data.data.userId})
                    myLib.changeUserBtn({userId: data.data.userId, relationship: 'stranger'});
                    this.updateFriendsInput(socket);
                    myLib.removeFriendInvitation(data.data.userId);
                    myLib.addChild({$parent: sltor.friendSuggestionsBox, xhtml: data.xhtml, type: 'prepend'})
                })

                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_CANCEL_REQUEST`, (data) => {
                    myLib.addChild({$parent: sltor.friendSuggestionsBox, xhtml: data.xhtml, type: 'prepend'})
                });
            },

            receiveFriendUnfriendNotifyFromServer: function(socket){
                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_UNFRIEND_NOTIFY`, (data) => {
                    myLib.changeUserBtn({userId: data.data.userId, relationship: 'stranger'});
                    this.updateFriendsInput(socket);
                    myLib.removeFriend(data.data.userId);
                    myLib.addChild({$parent: sltor.friendSuggestionsBox, xhtml: data.xhtml, type: 'prepend'})
                })

                socket.on(`${params.prefix.socketio.server}SERVER_RETURN_FRIEND_UNFRIEND`, (data) => {
                    myLib.addChild({$parent: sltor.friendSuggestionsBox, xhtml: data.xhtml, type: 'prepend'})
                });
            },

        // click user online btn
        clickUserBtn: function(socket){
            let $this = this;
            $(document).on('click', sltor.userBtn, function(){
                let btnType = $(this).data('type');
                switch (btnType){
                    case 'add':
                        $this.addFriend(socket, this);
                        break;
                    case 'deny':
                        $this.friendDeny(socket, this);
                        break;
                    case 'accept':
                        $this.friendAccept(socket, this);
                        break;
                    case 'unfriend':
                        $this.friendUnfriend(socket, this);
                        break;
                    case 'cancel-request':
                        $this.friendCancelRequest(socket, this);
                        break;
                }
            })
        },

        addFriend: function(socket, $elm){
            let $this = this;
            let url = standardizeLink(`${params.prefix.mess}/api/friend-add`);
            let userId = $(sltor.userIdInput).val();
            let friendUserId = $($elm).parent().data('userid');
            $.ajax({
                type: 'get',
                url: url,
                data: {userId, friendUserId},
                success: function(data, status){
                    if (data.status == 'success'){
                        socket.emit(`${params.prefix.socketio.server}CLIENT_NOTIFY_FRIEND_REQUEST`, myLib.getFriendParams({$elm}));
                        myLib.changeUserBtn({userId: friendUserId, relationship: 'sent-invite'});
                        $this.updateFriendsInput(socket);
                        myLib.removeFriendAdd(friendUserId);
                    }else alert('something went wrong');
                }
            })
        },

        friendAccept: function(socket, $elm){
            let $this = this;
            let url = standardizeLink(`${params.prefix.mess}/api/friend-accept`);
            let userId = $(sltor.userIdInput).val();
            let friendUserId = $($elm).parent().data('userid');
            $.ajax({
                type: 'get',
                url: url,
                data: {userId, friendUserId},
                success: function(data, status){
                    if (data.status == 'success'){
                        socket.emit(`${params.prefix.socketio.server}CLIENT_NOTIFY_FRIEND_ACCEPT`, myLib.getFriendParams({$elm}));
                        myLib.removeFriendRequest({userId: friendUserId})
                        myLib.removeFriendInvitation(friendUserId);
                        myLib.changeUserBtn({userId: friendUserId, relationship: 'friendx'});
                        $this.updateFriendsInput(socket);
                    }else alert('something went wrong');
                }
            })
        },

        friendDeny: function(socket, $elm){
            let $this = this;
            let url = standardizeLink(`${params.prefix.mess}/api/friend-deny`);
            let userId = $(sltor.userIdInput).val();
            let friendUserId = $($elm).parent().data('userid');
            $.ajax({
                type: 'get',
                url: url,
                data: {userId, friendUserId},
                success: function(data, status){
                    if (data.status == 'success'){
                        socket.emit(`${params.prefix.socketio.server}CLIENT_NOTIFY_FRIEND_DENY`, myLib.getFriendParams({$elm}));
                        myLib.removeFriendRequest({userId: friendUserId})
                        myLib.removeFriendInvitation(friendUserId);
                        myLib.changeUserBtn({userId: friendUserId, relationship: 'friendx'});
                        myLib.changeUserBtn({userId: friendUserId, relationship: 'stranger'});
                        $this.updateFriendsInput(socket);
                    }else alert('something went wrong');
                }
            })
        },

        friendUnfriend: function(socket, $elm){
            let $this = this;
            let url = standardizeLink(`${params.prefix.mess}/api/friend-unfriend`);
            let userId = $(sltor.userIdInput).val();
            let friendUserId = $($elm).parent().data('userid');
            $.ajax({
                type: 'get',
                url: url,
                data: {userId, friendUserId},
                success: function(data, status){
                    if (data.status == 'success'){
                        socket.emit(`${params.prefix.socketio.server}CLIENT_NOTIFY_FRIEND_UNFRIEND`, myLib.getFriendParams({$elm}));
                        myLib.changeUserBtn({userId: friendUserId, relationship: 'stranger'});
                        $this.updateFriendsInput(socket);
                        myLib.removeFriend(friendUserId);
                    }else alert('something went wrong');
                }
            })
        },

        friendCancelRequest: function(socket, $elm){
            let $this = this;
            let url = standardizeLink(`${params.prefix.mess}/api/friend-cancel-request`);
            let userId = $(sltor.userIdInput).val();
            let friendUserId = $($elm).parent().data('userid');
            $.ajax({
                type: 'get',
                url: url,
                data: {userId, friendUserId},
                success: function(data, status){
                    if (data.status == 'success'){
                        socket.emit(`${params.prefix.socketio.server}CLIENT_NOTIFY_FRIEND_CANCEL_REQUEST`, myLib.getFriendParams({$elm}));
                        myLib.changeUserBtn({userId: friendUserId, relationship: 'stranger'});
                        $this.updateFriendsInput(socket);
                        myLib.removeSentInvitation(friendUserId);
                    }else alert('something went wrong');
                }
            })
        },

        updateFriendsInput: function(socket){
            socket.emit(`${params.prefix.socketio.server}CLIENT_WANT_UPDATE_FRIENDS`, {userId: $(sltor.userIdInput).val()});
        },

        // messages
        receiveMsgNotifyFromServer: function(socket){
            socket.on(`${params.prefix.socketio.server}SERVER_RETURN_MSG_NOTIFY`, (data) => {
                myLib.showNotify({message: data.customMsg, type: 'light'});
                console.log('notify');
                console.log(data);
                
            });
        },

        receiveMsgInBoxFromServer: function(socket){
            socket.on(`${params.prefix.socketio.server}SERVER_RETURN_IN_BOX_SM_CONV`, (data) => {
                myLib.updateInBoxConversations(data);
            });
        }
    }
})
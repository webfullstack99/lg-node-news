let myLib = {

    // USERS ONLINE
    getServerUserConnectionParams: function (){
        return {
            friends: params.friends, 
            userId: $(sltor.userIdInput).val(), 
            username: $(sltor.usernameInput).val(), 
            thumb: $(sltor.thumbInput).val()
        };
    },

    getRoomUserConnectionParams: function (){
        return {
            room: $(sltor.roomInput).val(), 
            userId: $(sltor.userIdInput).val(), 
            username: $(sltor.usernameInput).val(), 
            thumb: $(sltor.thumbInput).val()
        };
    },

    showUsersOnlineList: function (data){
        let username = $(sltor.usernameInput).val();
        let xhtml = '';
        for (let item of data.data.xhtml){
            if ($(item).data('username') != username) xhtml += item;
        }
        let totalFriendsOnline = (data.data.xhtml.length > 0) ? data.data.xhtml.length - 1 : 0;
        $(sltor.totalFriendsOnlineElm).text(totalFriendsOnline);
        $(sltor.usersOnlineBoxElm).html(xhtml);
        for (let item of $(`${sltor.usersOnlineBoxElm} ${sltor.singleUserElm}`)){
            let $$btnContainer = $(item).find(sltor.userBtnContainerElm);
            let userId = $$btnContainer.data('userid');
            let relationship = this.getRelationship({userId, friends: params.friends});
            $$btnContainer.html(this.getUserBtns({relationship, userId}));
        }
        
        if (xhtml.trim() != '') $(sltor.usersOnlineBoxElm).slideDown();
    },

    // USER TYPING
    getServerUserTypingParams: function (){
        return {username: $(sltor.usernameInput).val(), thumb: $(sltor.thumbInput).val()};
    },

    getRoomUserTypingParams: function (){
        return {room: $(sltor.roomInput).val(), username: $(sltor.usernameInput).val(), thumb: $(sltor.thumbInput).val()};
    },

    showUserTyping: function (data){
        if ($(sltor.usersTypingContainer + ' > div[username="'+data.data.username+'"]').length < 1){
            $(sltor.usersTypingContainer).prepend(data.data.xhtml);
        }
    },

    removeUserTyping: function (data){
        // {$userTypingContainer, data}
        $(sltor.usersTypingContainer + '> div[username="'+data.data.username+'"]').detach();
    },

    // SEND MESSAGE
    getServerMsgSendingParams: function (){
        return { 
            msg: $(sltor.msgInput).val(), 
            username: $(sltor.usernameInput).val(),  
            thumb: $(sltor.thumbInput).val(), 
            userId: $(sltor.userIdInput).val(), 
        };
    },

    getUpdateSmConvParams: function (){
        return { 
            userId: $(sltor.userIdInput).val(), 
            friendUserId: $(sltor.chattingFriend).data('userid'),
            room: $(sltor.roomInput).val(), 
            username: $(sltor.usernameInput).val(),  
            thumb: $(sltor.thumbInput).val(), 
        };
    },

    getClientWantGetConvDataParams: function (){
        return { 
            selectedUserIds: $(sltor.receiverIdsInput).val(), 
            userId: $(sltor.userIdInput).val(), 
            username: $(sltor.usernameInput).val(),  
        };
    },

    getNewConvSendMsgParams: function (){
        return { 
            msg: emoji.data("emojioneArea").getText(),
            selectedUserIds: $(sltor.receiverIdsInput).val(), 
            username: $(sltor.usernameInput).val(),  
            thumb: $(sltor.thumbInput).val(), 
            userId: $(sltor.userIdInput).val(), 
            convid: $(sltor.firstSideBarSmConv).children().data('convid'), 
        };
    },

    getRoomMsgSendingParams: function (){
        return { 
            room: $(sltor.roomInput).val(), 
            msg: emoji.data("emojioneArea").getText(),
            username: $(sltor.usernameInput).val(),  
            thumb: $(sltor.thumbInput).val(), 
            userId: $(sltor.userIdInput).val(), 
        };
    },

    setEmptyMsgInput: function (){
        $(sltor.msgInput).val('');
        $(sltor.msgInput).data("emojioneArea").setText('');
    },

    showReturnMsg: function(data){
        $(sltor.msgContainer).append(data.xhtml);
        scrollDirectChatToBottom();
    },

    // FRIEND
    getFriendParams: function(data){
        return {
            friendUserId: $(data.$elm).parent().data('userid'),
            userId: $(sltor.userIdInput).val(),
            username: $(sltor.usernameInput).val(), 
            thumb: $(sltor.thumbInput).val()
        }
    },

    showUserRelationshipChangeNotify: function(data){
        let msg = this.getNotifyMessage(data.relationship);
        data.params.msg = msg;
        this.showNotifyWithTemplate(data);
    },

    showNotifyWithTemplate: function(data){
        let template = $(`#${data.templateId}`).html();
        let rendered = Mustache.render(template, data.params);
        this.showNotify({message: rendered, type: 'light'});
    },

    // NEW CONVERSATION
    getClientTypingReceiverParams(){
        return {
            value: $(sltor.receiverValue).text(),
            userId: $(sltor.userIdInput).val(), 
            selectedUserIds: $(sltor.receiverIdsInput).val(), 
        }
    },



    getNotifyMessage: function(relationship){
        let message = '';
        switch(relationship){
            case 'receive-invite':
                message = 'has sent you a friend request';
                break;
            case 'friendx':
                message = ' now is your friend';
                break;
        }
        return message;
    },

    showNotify: function(data){
        console.log(data);
        data.type = data.type || 'light';
        $.notify({ message: data.message , },{
            type: data.type,
            placement: { from: "bottom", align: "right" },
            template:   '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} b-notify-'+data.type+'" role="alert">' +
                            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
                            '<span data-notify="icon"></span> ' +
                            '<span data-notify="title">{1}</span> ' +
                            '<span data-notify="message">{2}</span>' +
                            '<div class="progress" data-notify="progressbar">' +
                                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                            '</div>' +
                            '<a href="{3}" target="{4}" data-notify="url"></a>' +
                        '</div>',
        });
    },

    getUserBtns: function(data){
        let btnData = this.getBtnData(data.relationship);
        let xhtml = '';
        for (let item of btnData){
            if (item.type == 'chat') xhtml += `<a href="${standardizeLink(params.prefix.mess)}/messages/p/${data.userId}" class="user-btn ${item.btn}" data-type="${item.type}">${item.content}</a>`;
            else xhtml += `<button type="button" class="user-btn ${item.btn}" data-type="${item.type}">${item.content}</button>`;
        }
        return xhtml;
    },

    changeUserBtn: function(data){
        let relationshipsChange = this.getTemplateData().user_btn.relationships_change;
        let $btnContainer = `${sltor.userBtnContainerElm}[data-userid="${data.userId}"]`;
        for (let item of $($btnContainer)){
            let relationship = $(item).data('relationship');
            if (relationshipsChange.includes(relationship)){
                $(item).empty();
                $(item).html(this.getUserBtns(data));
                let $btns = $(item).find('button');
                this.disableElementWithTimout($btns, params.disableUserBtnTime);
            }
        }
    },

    getBtnData: function(relationship){
        let data = this.getTemplateData();
        if (data.user_btn[relationship]) return data.user_btn[relationship];
        return '<span class="online-sign"></span>';
    },

    getTemplateData: function(){
        let data = JSON.parse($(sltor.templateData).val());
        return data;
    },

    removeFriendRequest: function(data){
        this.updateTotalElm({value: -1, $elm: sltor.totalFriendRequest});
        let $$userElm = $(`${sltor.friendInvitationBox} ${sltor.singleUserElm}`).has(`${sltor.userBtnContainerElm}[data-userid="${data.userId}"]`);
        $$userElm.detach();
    },

    getRelationship: function(data){
        let relationship;
        let relationshipData = {
            friend_list: 'friendx',
            request_to: 'sent-invite',
            request_from: 'receive-invite',
        }
        for (let key in data.friends){
            if (data.friends[key].includes(data.userId)){
                relationship = key;
                break;
            }
        }
        return relationshipData[relationship] || 'stranger';
    },

    // general
    updateTotalElm: function(data){
        $(data.$elm).filter(function (){
            let newVal = Number.parseInt($(this).text()) + Number.parseInt(data.value);
            $(this).text(newVal);
        })
    },

    removeFriend: function(userId){
        let $elm = `${sltor.userFriendsBox} ${sltor.userBtnContainerElm}[data-userid="${userId}"]`;
        $($elm).parents(sltor.singleUserElm).detach();
        this.updateTotalUserInBox(sltor.userFriendsBox);
    },

    removeFriendAdd: function(userId){
        let $elm = `${sltor.friendSuggestionsBox} ${sltor.userBtnContainerElm}[data-userid="${userId}"]`;
        $($elm).parents(sltor.singleUserElm).detach();
        this.updateTotalUserInBox(sltor.friendSuggestionsBox);
    },

    removeSentInvitation: function(userId){
        let $elm = `${sltor.userSentInvitationsBox} ${sltor.userBtnContainerElm}[data-userid="${userId}"]`;
        $($elm).parents(sltor.singleUserElm).detach();
        this.updateTotalUserInBox(sltor.userSentInvitationsBox);
    },

    removeFriendInvitation: function(userId){
        let $elm = `${sltor.userInvitationsBox} ${sltor.userBtnContainerElm}[data-userid="${userId}"]`;
        $($elm).parents(sltor.singleUserElm).detach();
        this.updateTotalUserInBox(sltor.userInvitationsBox);
    },

    disableElementWithTimout: function($elm, time){
        $($elm).attr('disabled', 'disabled');
        setTimeout(function (){
            $($elm).removeAttr('disabled');
        }, time)
    },

    addChild: function (data){
        let type = data.type || 'prepend';
        if (type == 'prepend') $(data.$parent).prepend(data.xhtml);
        else if (type == 'append') $(data.$parent).append(data.xhtml);
        this.updateTotalUserInBox(data.$parent);
    },

    updateTotalUserInBox($box){
        let $title = `${$box}-title`;
        //if ($box == sltor.userSentInvitationsBox) $title = sltor.userInvitationsBox+'-title';
        //else $title = $box+'-title';
        let $badge = `${$title} > .badge`;
        let total = $(`${$box} > ${sltor.singleUserElm}`).length;
        $($badge).text(total);
    },

    updateConversations: function (data){
        let $smConv = `${sltor.smConv}[data-convid=${data.data.room}]`;
        let $$smConvTemp = $($smConv).parent();
        if ($$smConvTemp.length > 0) $($smConv).parent().detach();
        $(sltor.recentConversationsBox).prepend(data.xhtml);
    },

    updateInBoxConversations: function (data){
        let $smConv = `${sltor.friendMessagesBox} ${sltor.inboxSmConv}[data-convid="${data.data.room}"]`;
        let $$smConvTemp = $($smConv).parent();
        if ($$smConvTemp.length > 0){
            $$smConvTemp.parent().detach();
        } 
        $(sltor.friendMessagesBox).prepend(data.xhtml);
        this.updateTotalUnSeenMsg();
    },

    updateTotalUnSeenMsg: function (){
        let unseenCount = 0;
        $(sltor.inboxSmConv).filter(function (){
            if ($(this).data('isseen') == 'no') unseenCount++;
        })
        $(sltor.totalUnseenMsg).text(unseenCount);
    },

    isMsgEmpty: function(){
        if ($(sltor.msgDiv).html().trim() === '') return true;
        return false;
    },

    isSelectedReceiverEmpty: function(){
        if ($(sltor.selectedReceivers+ ' > button').length < 1) return true;
        return false;
    }

};
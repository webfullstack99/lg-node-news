let sltor;
let params;
$(document).ready(function(){
    let friends;
    try{ friends = JSON.parse($('input[name="friends"]').val()); }catch (e){ friends = {}; }
    sltor = {
        msgContainer: 'div.direct-chat-messages',
        msg: 'div.direct-chat-msg',
        chatText: '.direct-chat-text',
        msgInput: 'input#msg-input',
        msgDiv: '.emojionearea-editor',
        controller: 'input[name="controller"]',

        // message
        usersTypingContainer: 'div.users-typing',
        msgForm: 'form#send-msg-form',
        roomInput: 'input[name="room"]',
        userIdInput: 'input[name="userId"]',
        usernameInput: 'input[name="username"]',
        thumbInput: 'input[name="thumb"]',
        templateData: 'input[name="template"]',

        // users online
        totalFriendsOnlineElm: 'span#total-users-online',
        usersOnlineBoxElm: 'div.users-online-box',

        // friends box
        userFriendsBox: '#user-friends-box',
        friendSuggestionsBox: '#friend-suggestions-box',

        // friend invitations box (main content)
        userInvitationsBox: '#user-invitations-box',
        userSentInvitationsBox: '#user-sent-invitations-box',

        // box title
        userFriendsBoxTitle: '#user-friends-box-title',
        userInvitationsBoxTitle: '#user-invitations-box-title',
        userSentInvitationsBoxTitle: '#user-sent-invitations-box-title',
        friendSuggestionsBoxTitle: '#friend-suggestions-box-title',

        // single user
        singleUserElm: '.single-user',
        userBtnContainerElm: '.btns-container',
        userBtn: '.user-btn',

        // messages
        friendMessagesBox: '#friend-messages-box',
        recentConversationsBox: '.recent-conversations-box',
        get firstSideBarSmConv(){ return this.recentConversationsBox+' > a:first-child'; },
        chattingFriend: '#chatting-friend',
        smConv: '.sm-conv',
        inboxSmConv: '.inbox-sm-conv',
        totalUnseenMsg: '.total-unseen-msg',

        // room info
        totalRoomMember: '#total-room-member',

        // notifications
        friendInvitationBox: 'li#friend-invitation-box',
        totalFriendRequest: '.total-friend-request',

        // new conversation
        selectedReceivers: '.selected-receivers',
        get lastSelectedReceiver(){ return `${this.selectedReceivers} > button:last-child`; },
        receiverValue: '.receiver-value',
        singleReceiverInDropdown: '.single-receiver-in-dropdown',
        receiverIdsInput: 'input[name="selected-receiver-ids"]',
        receiverDropdown: '.receiver-dropdown',
        get receiverDropdownMenu(){ return this.receiverDropdown+' > .dropdown-menu'; },
        
        // prefix
        prfSocketio: $('input[name="prfSocketio"]').val(),
    }

    params = {
        prefix: JSON.parse($('input[name="prefix"]').val()), 
        controller: $(sltor.controller).val(), 
        friends: friends,
        typingTime: 3000,
        typingReceiverTime: 500,
        disableUserBtnTime: 500,
        delayTime: 100,
    }
})
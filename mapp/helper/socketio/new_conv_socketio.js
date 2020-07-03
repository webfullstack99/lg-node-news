const ejs = require('ejs');
const _js = require(__path.helper+'/js');
const _conversationModel = require(__path.model+'/conversation');
const _userModel = require(__path.model+'/user');
const _helper = require(__path.helper+'/helper');


let socket = {
    runOtherMethods: function (socket){
        this.clientTypingReceiverName(socket);
        this.clientSendMsg(socket);
        this.clientWantGetConvData(socket);
    },

    // client want get conv data
    clientWantGetConvData: async function(socket){
        socket.on(`${this.prefix}CLIENT_WANT_GET_CONV_DATA`, async (data) => {
            //console.log('client get conv data');
            //console.log(data);
            //console.log('end');
            let conv;
            let selectedUserIds = _helper.parseJson(data.selectedUserIds);
            if (selectedUserIds.length == 1){
                conv = await _conversationModel.getItem({myId: data.userId, type: 'p', id: selectedUserIds[0]}, {task: 'get-item-by-type-and-id'});
            } 
            let isExists = (conv) ? true : false;

            // show msgs
            let msgsXhtml = '';
            let smConvXhtml = '';
            if (isExists){
                let user = {userId: data.userId, username: data.username};
                let receiver = _helper.getReceiver(conv, data.userId);
                msgsXhtml = await ejs.renderFile(__path.views_mess+'/template/show_msgs.ejs', {user, msgs: conv.messages, require} );
                smConvXhtml = await ejs.renderFile(__path.views_mess+'/partials/sm_conv.ejs', {item: _helper.getNewSmConvData(receiver, true), user, require});
            }else{
                smConvXhtml = await this.getSmConvOfNewMsg(data);
            }
            socket.emit(`${this.prefix}SERVER_RETURN_CONV_DATA`, {isExists, msgsXhtml, smConvXhtml});
        })

    },

    getSmConvOfNewMsg: async function(data){
        let selectedUserIds = _helper.parseJson(data.selectedUserIds);
        let receiver;
        let isNewConv = false;
        if (selectedUserIds.length > 0){
            let items = [];
            for (let id of selectedUserIds){
                items.push(await _userModel.getItem({id}, {task: 'get-mess-user-by-id'}));
            }
            let tempConv = {
                type: _helper.getConvTypeByMemberLength(items.length + 1),
                members: items,
            }
            receiver = _helper.getReceiver(tempConv, data.userId);
            isNewConv = true;
        }
        let user = {userId: data.userId, username: data.username};
        let smConvXhtml = await ejs.renderFile(__path.views_mess+'/partials/sm_conv.ejs', {item: _helper.getNewSmConvData(receiver, isNewConv), user, require});
        return smConvXhtml;
    },

    // send msg
    clientSendMsg: async function (socket){
        socket.on(`${this.prefix}CLIENT_SEND_NEW_CONV_MSG`, async (data) => {
            //console.log('new conv msg sending');
            //console.log(data);
            //console.log('end msg sending');
            let result = await this.saveMsgOrCreateNewConvIfNotExists(data);
            data.friendUserId = data.selectedUserIds;
            let redirectLink = this.getRedirectLink(result);
            socket.emit(`${this.prefix}SERVER_RETURN_CONV_ID`, {redirectLink});

            // return sidebar messages to friend
            //await this.returnSideBarSmConvToFriend(socket, {convData: result.conv, data});
            
            // return inbox messages
            //await this.returnInboxMsg(socket, {convData: result.conv, data});
        })
    },

    // clietn typing receiver
    clientTypingReceiverName: function (socket){
        socket.on(`${this.prefix}CLIENT_TYPING_RECEIVER_NAME`, async (data) => {
            //console.log('new conv data');
            //console.log(data);
            //console.log('end new conv data');
            let receivers = await _userModel.listItems({id: data.userId, username: data.value, ignoreIds: _helper.parseJson(data.selectedUserIds)}, {task: 'search-friends-with-username'})
            let receiversXhtml = '';
            if (receivers.length > 0){
                let friendUserIds = _helper.getIdsOfItems(receivers);
                let convs = await _conversationModel.listItems({myId: data.userId, friendUserIds}, {task: 'list-conv-with-at-least-one-friend'});
                let user = {userId: data.userId, username: data.username};
                receiversXhtml = await ejs.renderFile(__path.views_mess+'/template/receiver-list.ejs', {require, receivers, convs, user});
            }else receiversXhtml = this.getFriendNotFoundMsg();
            socket.emit(`${this.prefix}SERVER_RETURN_RECEIVER`, {receivers, receiversXhtml})
        });
    },

    getFriendNotFoundMsg: function(){
        return '<li><span>Sorry, we cant find your friends!</span></li>';
    },

    saveMsgOrCreateNewConvIfNotExists: async function(data){
        let result = {};
        let members = _helper.parseJson(data.selectedUserIds);
        members.push(data.userId);
        let type = _helper.getConvTypeByMemberLength(members.length, 'full');
        if (!data.convid){
            // create new
            let msg = { content: data.msg, user: data.userId, seen: [data.userId]};
            msg = _conversationModel.setCreated(msg, null, 'string');
            tempConv = { members, type: _helper.getConvTypeByMemberLength(members.length, 'full'), messages: [ msg ], }
            result.conv = await _conversationModel.saveItem({conv: tempConv}, {task: 'insert-conv'});

            // asign id
            if (members.length <= 2) result.id = members[0];
            else result.id = result.conv._id;
        }else{
            // save msg
            let item = { content: data.msg, user: data.userId, seen: [data.userId]};
            await _conversationModel.saveItem({item, id: data.convid}, {task: 'insert-msg-by-conversation-id'});
            result.conv = await _conversationModel.getItem({id: data.convid}, {task: 'get-item-by-id'});

            // asign id
            if (members.length <= 2) result.id = members[0];
            else result.id = data.convid;
        }
        result.type = type[0];
        return result;
    },

    getRedirectLink: function (data){
        let redirectLink = _helper.standardizeLink(`${displayConf.prefix.mess}/messages/${data.type}/${data.id}`);
        return redirectLink;
    },
}
let mySocket = _js.objMerge(socket, require(__path.helper_socketio+'/partial_socketio'));
module.exports = mySocket;

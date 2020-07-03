const ejs = require('ejs');

const _js = require(__path.helper+'/js');
const _helper = require(__path.helper+'/helper');
const _template = require(__path.helper+'/template');
const _userModel = require(__path.model+'/user');
const _conversationModel = require(__path.model+'/conversation');

let socket = {
    _usersOnline: require(__path.helper_socketio+'/all_user_online'),

    runOtherMethods: function (socket){
        this.usersOnline(socket);
        this.clientSendMsg(socket);
        this.clientTyping(socket);
        this.clientStopTyping(socket);
        this.runFriends(socket);
    },

    // user online
    usersOnline: function (socket){
        socket.on(`${this.prefix}USER_CONNECT`, async (data) => {
            let item = data; item.id = socket.id;
            socket.join(data.userId);
            this._usersOnline.addUser(item)
            let xhtml = await this.getReturnDataForUsersOnline();
            this.io.emit(`${this.prefix}SERVER_RETURN_USERS_ONLINE`, {xhtml, prefix: this.prefix});
        })

        socket.on('disconnect', async () => {
            this._usersOnline.removeUserById(socket.id);
            let xhtml = await this.getReturnDataForUsersOnline();
            this.io.emit(`${this.prefix}SERVER_RETURN_USERS_ONLINE`, {xhtml, prefix: this.prefix});
        })
    },

    // send message
    clientSendMsg: function (socket){
        socket.on(`${this.prefix}CLIENT_SEND_MSG`, async (data) => {
            //console.log('client send msg data');
            //console.log(data);
            //console.log('end');
            
            let item = {};
            item.content = data.msg;
            item.user = data.userId;
            let msg = await _conversationModel.saveItem({item: item, name: 'home'}, {task: 'insert-msg-by-conversation-name'});
            msg.user = {username: data.username, thumb: data.thumb};
            let ejsParams = { item: msg, require: require };
            let broadcastXhtml = await ejs.renderFile(__path.views_mess+'/partials/direct_chat_msg_left.ejs', ejsParams );
            let senderXhtml = await ejs.renderFile(__path.views_mess+'/partials/direct_chat_msg_right.ejs', ejsParams );
            socket.broadcast.emit(`${this.prefix}SERVER_RETURN_BROADCAST_MSG`, {xhtml: broadcastXhtml, data});
            socket.emit(`${this.prefix}SERVER_RETURN_SENDER_MSG`, {xhtml: senderXhtml, data});
            socket.broadcast.emit(`${this.prefix}SERVER_RETURN_CLIENT_STOP_TYPING`, {username: data.username});
        })
    },

    // typing
    clientTyping: function (socket){
        socket.on(`${this.prefix}CLIENT_TYPING`, async (data) => {
            let ejsParams = { username: data.username, thumb: data.thumb, require: require };
            let returnData = { xhtml: await ejs.renderFile(__path.views_mess+'/partials/user_typing.ejs', ejsParams ), username: data.username};
            socket.broadcast.emit(`${this.prefix}SERVER_RETURN_CLIENT_TYPING`, returnData);
        });
    },

    clientStopTyping: function (socket){
        socket.on(`${this.prefix}CLIENT_STOP_TYPING`, async (data) => {
            socket.broadcast.emit(`${this.prefix}SERVER_RETURN_CLIENT_STOP_TYPING`, {username: data.username});
        });
    },

    runFriends: function(socket){
        this.notifyFriendAdd(socket);
        this.notifyFriendAccept(socket);
        this.notifyFriendDeny(socket);
        this.notifyFriendUnfriend(socket);
        this.notifyFriendCancelRequest(socket);
        this.updateFriends(socket);
    },

    // notify friend
    notifyFriendCancelRequest: function (socket){
        socket.on(`${this.prefix}CLIENT_NOTIFY_FRIEND_CANCEL_REQUEST`, async (data) => {
            let friend = await this.getUserByUserId(data.friendUserId);
            let xhtmls = await this.getUsersXhtml([data, friend], ['stranger'], ['user-normal']);
            this.io.to(friend.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_CANCEL_REQUEST_NOTIFY`, {xhtml: xhtmls[0], data});
            this.io.to(socket.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_CANCEL_REQUEST`, {xhtml: xhtmls[1]});
        });
    },

    notifyFriendUnfriend: function (socket){
        socket.on(`${this.prefix}CLIENT_NOTIFY_FRIEND_UNFRIEND`, async (data) => {
            let friend = await this.getUserByUserId(data.friendUserId);
            let xhtmls = await this.getUsersXhtml([data, friend], ['stranger'], ['user-normal']);
            this.io.to(friend.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_UNFRIEND_NOTIFY`, {xhtml: xhtmls[0], data});
            this.io.to(socket.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_UNFRIEND`, {xhtml: xhtmls[1]});
        });
    },

    notifyFriendDeny: function (socket){
        socket.on(`${this.prefix}CLIENT_NOTIFY_FRIEND_DENY`, async (data) => {
            let friend = await this.getUserByUserId(data.friendUserId);
            let xhtmls = await this.getUsersXhtml([data, friend], ['stranger'], ['user-normal']);
            this.io.to(friend.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_DENY_NOTIFY`, {xhtml: xhtmls[0], data});
            this.io.to(socket.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_DENY`, {xhtml: xhtmls[1]});
        });
    },

    notifyFriendAccept: function (socket){
        socket.on(`${this.prefix}CLIENT_NOTIFY_FRIEND_ACCEPT`, async (data) => {
            let friend  = await this.getUserByUserId(data.friendUserId);
            let xhtmls = await this.getUsersXhtml([data, friend], ['friend'], ['user-friendx']);
            data.thumb = this.getThumb(data.thumb, data.username);
            this.io.to(friend.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_ACCEPT_NOTIFY`, {xhtml: xhtmls[0], data});
            this.io.to(socket.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_ACCEPT`, {xhtml: xhtmls[1]});
        });
    },

    notifyFriendAdd: function (socket){
        socket.on(`${this.prefix}CLIENT_NOTIFY_FRIEND_REQUEST`, async (data) => {
            let friend = await this.getUserByUserId(data.friendUserId);
            let xhtmls = await this.getUsersXhtml([data, data, friend], ['receive-invite', 'receive-invite', 'sent-invite'], ['user-online', 'user-normal', 'user-normal']);
            data.thumb = this.getThumb(data.thumb, data.username);
            this.io.to(friend.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_REQUEST_NOTIFY`, {xhtml: xhtmls[0], friendInvitationXhtml: xhtmls[1], data});
            this.io.to(socket.id).emit(`${this.prefix}SERVER_RETURN_FRIEND_REQUEST`, {xhtml: xhtmls[2]});
        });
    },

    updateFriends: function (socket){
        socket.on(`${this.prefix}CLIENT_WANT_UPDATE_FRIENDS`, async (data) => {
            let friends = await _userModel.getItem({id: data.userId}, {task: 'get-friends-by-id'});
            socket.emit(`${this.prefix}SERVER_RETURN_FRIENDS`, {friends});
        });
    },

    // SUPPORTED FUNCTION ==========
    getReturnDataForUsersOnline: async function (){
        let xhtmls = this.getUsersXhtml(this._usersOnline.users, ['unknow'], ['user-online']);
        return xhtmls;
    },
}
let mySocket = _js.objMerge(socket, require(__path.helper_socketio+'/partial_socketio'));
module.exports = mySocket;
const ejs = require('ejs');
const _js = require(__path.helper+'/js');
const _conversationModel = require(__path.model+'/conversation');
const _helper = require(__path.helper+'/helper');


let socket = {
    _usersOnline: require(__path.helper_socketio+'/room_user_online'),
    
    runOtherMethods: function (socket){
        this.usersOnline(socket);
        this.clientSendMsg(socket);
        this.clientTyping(socket);
        this.clientStopTyping(socket);
        this.clientWantUpdateSmConv(socket);
    },

    usersOnline: function (socket){
        socket.on(`${this.prefix}USER_CONNECT`, async (data) => {
            let item = data; item.id = socket.id;
            socket.join(data.room);
            this._usersOnline.addUser(item)
            let xhtml = await this.getReturnDataForUsersOnline(data.room);
            this.io.to(data.room).emit(`${this.prefix}SERVER_RETURN_USERS_ONLINE`, {xhtml, prefix: this.prefix});
        })

        socket.on('disconnect', async () => {
            if (this.prefix == displayConf.prefix.socketio.room){
                let user = this._usersOnline.removeUserById(socket.id);
                if (user){
                    let xhtml = await this.getReturnDataForUsersOnline(user.room);
                    this.io.to(user.room).emit(`${this.prefix}SERVER_RETURN_USERS_ONLINE`, {xhtml, prefix: this.prefix});
                }
            }
        })
    },

    // ============
    clientSendMsg: function (socket){
        socket.on(`${this.prefix}CLIENT_SEND_MSG`, async (data) => {
            //console.log('msg sending');
            //console.log(data);
            //console.log('end msg sending');
            let item = await this.saveMsg(data);
            let ejsParams = {item, require};
            let broadcastXhtml = await ejs.renderFile(__path.views_mess+'/partials/direct_chat_msg_left.ejs', ejsParams );
            let senderXhtml = await ejs.renderFile(__path.views_mess+'/partials/direct_chat_msg_right.ejs', ejsParams );
            
            // return to client
            socket.to(data.room).emit(`${this.prefix}SERVER_RETURN_BROADCAST_MSG`, {xhtml: broadcastXhtml, data});
            socket.emit(`${this.prefix}SERVER_RETURN_SENDER_MSG`, {xhtml: senderXhtml, data});

            // stop typing
            socket.to(data.room).emit(`${this.prefix}SERVER_RETURN_CLIENT_STOP_TYPING`, {username: data.username});
        })
    },

    clientTyping: function (socket){
        socket.on(`${this.prefix}CLIENT_TYPING`, async (data) => {
            let ejsParams = { username: data.username, thumb: data.thumb, require: require };
            let returnData = { xhtml: await ejs.renderFile(__path.views_mess+'/partials/user_typing.ejs', ejsParams ), username: data.username};
            socket.to(data.room).emit(`${this.prefix}SERVER_RETURN_CLIENT_TYPING`, returnData);
        });
    },

    clientStopTyping: function (socket){
        socket.on(`${this.prefix}CLIENT_STOP_TYPING`, async (data) => {
            socket.to(data.room).emit(`${this.prefix}SERVER_RETURN_CLIENT_STOP_TYPING`, {username: data.username});
        });
    },

    // update sm conv
    clientWantUpdateSmConv: function(socket){
        socket.on(`${this.prefix}CLIENT_WANT_UPDATE_SM_CONV`, async (data) => {
            console.log('update conv data');
            console.log(data);
            console.log('end update conv data');
            // get conv data
            let convData = await _conversationModel.getItem({id: data.room}, {task: 'get-recent-item-by-id'})
            let senderSmConv = await this.getSmConvsXhtml([convData], [data.userId], );
            
            // return sidebar messages to friend
            await this.returnSideBarSmConvToFriend(socket, {convData, data});
            
            // return inbox messages
            await this.returnInboxMsg(socket, {convData, data});

            // return sidebar message to senger
            socket.emit(`${this.prefix}SERVER_RETURN_SENDER_SM_CONV`, {xhtml: senderSmConv[0], data, type: 'custom'});
        })

    },

    // SUPPORTED FUNCTION ==========
    getReturnDataForUsersOnline: async function (room){
        let users = this._usersOnline.getUsersInRoom(room);
        let xhtmls = this.getUsersXhtml(users, ['unknow'], ['user-online']);
        return xhtmls;
    },

    saveMsg: async function (data){
        let item = { content: data.msg, user: data.userId, seen: [data.userId]};
        if (['p', 'g'].includes(this.type)) await _conversationModel.saveItem({item, id: data.room}, {task: 'insert-msg-by-conversation-id'});
        else if (this.type == 'r') await _conversationModel.saveItem({item: item, name: data.room}, {task: 'insert-msg-by-conversation-name'});
        await this.updateSeen(data);
        item.user = {username: data.username, thumb: data.thumb};
        return item;
    },
}
let mySocket = _js.objMerge(socket, require(__path.helper_socketio+'/partial_socketio'));
module.exports = mySocket;
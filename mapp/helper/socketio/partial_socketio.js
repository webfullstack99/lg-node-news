const ejs = require('ejs');

const _helper = require(__path.helper+'/helper');
const _js = require(__path.helper+'/js');
const _template = require(__path.helper+'/template');
const _userModel = require(__path.model+'/user');
const _conversationModel = require(__path.model+'/conversation');

module.exports  = {

    // main run
    run: function(socket){
        this.runOtherMethods(socket);
    },

    // SUPPORTED FUNCTION ==========
    getThumb: function(thumb, username){
        let result = _template.showThumb({
            classes: 'contacts-list-img',
            thumb: thumb,
            alt: username,
            controller: 'user',
        })
        return result;
    },

    getUsersXhtml: async function(usersData = [], relationships = [], userTypes = []){
        let xhtmls = [];
        let i = 0;
        for (let item of usersData){
            if (!item._id) item._id = item.userId;
            
            let userType = userTypes[i] || userTypes[0]; userType = (userType) ? userType : 'user-normal';
            let relationship = relationships[i] || relationships[0]; relationship = (relationship) ? relationship : 'unknow';

            let ejsParams = {relationship, userType, require: require, };
            let xhtml = await ejs.renderFile(__path.views_mess+'/partials/single_user.ejs',  _js.objMerge(ejsParams, {item}))
            xhtmls.push(xhtml);
            i++;
        }
        return xhtmls;
    },

    getUserByUserId: async function(userId){
        let user = this._usersOnline.getUserByUserId(userId);
        if (!user) user = await _userModel.getItem({id: userId}, {task: 'get-mess-user-by-id'});
        return user;
    },

    updateSeen: async function(data){
        let seenIds = this._usersOnline.getFriendUserIdsByRoomAndUserId({room: data.room, userId: data.userId});
        await _conversationModel.saveItem({seenIds, id: data.room}, {task: 'update-msg-seen-by-id'})
    },

    returnInboxMsg: async function(socket, data){
        let friendUserIds = _helper.parseJson(data.data.friendUserId);
        let smConvsInBox = await this.getSmConvsInBoxXhtml([data.convData], [data.userId]);
        for (let id of friendUserIds){
            let xhtml = await ejs.renderFile(__path.views_mess+'/partials/single_message.ejs', {item: data.convData, user: {id}, require} );
            socket.to(id).emit(`${displayConf.prefix.socketio.server}SERVER_RETURN_IN_BOX_SM_CONV`, {xhtml, data: data.data, });
        }
        socket.emit(`${displayConf.prefix.socketio.server}SERVER_RETURN_IN_BOX_SM_CONV`, {xhtml: smConvsInBox[0], data: data.data,});
    },

    returnSideBarSmConvToFriend: async function (socket, data){
        let friendUserIds = _helper.parseJson(data.data.friendUserId);
        for (let id of friendUserIds){
            let friend = (this._usersOnline) ? this._usersOnline.getUserByUserId(id) : data.data._usersOnline.getUserByUserId(id);
            if (friend){
                let receiverSmConv = await this.getSmConvsXhtml([data.convData], [id], );
                socket.to(id).emit(`${this.prefix}SERVER_RETURN_BROADCAST_SM_CONV`, {xhtml: receiverSmConv[0], data: data.data});
            }else{
                let receiverSmConv = await this.getSmConvsXhtml([data.convData], [id], [true]);
                socket.to(id).emit(`${displayConf.prefix.socketio.server}SERVER_RETURN_MSG_NOTIFY`, {customMsg: receiverSmConv[0]});
            }
        }
        
    },
    
    getSmConvsXhtml: async function(convsData = [], loggedUserIds = [], isForNotifys = [false]){
        let xhtmls = [];
        let i = 0;
        for (let item of convsData){
            let loggedUserId = loggedUserIds[i] || loggedUserIds[0];
            let isForNotify = isForNotifys[i] || isForNotifys[0];
            let xhtml = await ejs.renderFile(__path.views_mess+'/partials/sm_conv.ejs', {item, isForNotify, user: {id: loggedUserId}, require} );
            xhtmls.push(xhtml);
            i++;
        }
        return xhtmls;
    },

    getSmConvsInBoxXhtml: async function(convsData = [], loggedUserIds = []){
        let xhtmls = [];
        let i = 0;
        for (let item of convsData){
            let loggedUserId = loggedUserIds[i] || loggedUserIds[0];

            // temp solving for private conversation
            if (Array.isArray(loggedUserId)) loggedUserId = loggedUserId[0];
            let xhtml = await ejs.renderFile(__path.views_mess+'/partials/single_message.ejs', {item, user: {id: loggedUserId}, require} );
            xhtmls.push(xhtml);
            i++;
        }
        return xhtmls;
    },
}
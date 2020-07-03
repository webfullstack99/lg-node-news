const controller = 'conversation';
let extend = require('node.extend');
let _model = require(__path.schema+'/'+controller)

let _helper = require(__path.helper+'/helper');
let adminModel = require(__path.model+'/adminModel');
let currentModel = {
    listItems: function (params, options){
        let result  = [];
        switch(options.task){
            case 'list-conv-with-at-least-one-friend':
                result  = this.listConvWithAtLeastOneFriend(params, options);
                break;
            case 'list-recent-conversations':
                result  = this.listRecentConversations(params, options);
                break;
            case 'list-msgs-by-conversation-name':
                result  = this.listMsgsByConversationName(params, options);
                break;
        }
        return result;
    },

    getItem: function(params, options){
        let result;
        switch(options.task){
            case 'get-recent-item-by-id':
                result  = this.getRecentItemById(params, options);
                break;
            case 'get-item-by-type-and-id':
                result  = this.getItemByTypeAndId(params, options);
                break;
            case 'by-id':
                result  = this.getItemById(params, options);
                break;
            case 'by-query':
                result  = this.getItemByQuery(params, options);
                break;
        }
        return result;
    },

    saveItem: function(params, options){
        let result;
        switch (options.task){
            case 'insert-conv':
                result  = this.insertConv(params, options);
                break;
            case 'update-msg-seen-by-id':
                result  = this.updateMsgSeenById(params, options);
                break;
            case 'insert-msg-by-conversation-id':
                result  = this.insertMsgByConversationId(params, options);
                break;
            case 'insert-msg-by-conversation-name':
                result  = this.insertMsgByConversationName(params, options);
                break;
        }
        return result;
    },

    listConvWithAtLeastOneFriend: async function(params, options){
        let query = {
            $and: [
                {members: _helper.toObjectId(params.myId)},
                {members: {$in: params.friendUserIds}}, 
            ],
            type: 'group',
            messages: {$gt: []}
        };
        let result = await this.listRecentItemsByQuery({query});
        return result;
    },

    listRecentConversations: async function(params, options){
        let query = {members: _helper.toObjectId(params.userId), messages: {$gt: []}};
        let project = {messages: {$slice: -1}};
        let result = await this.listRecentItemsByQuery({query, project});
        return result;
    },

    listMsgsByConversationName: async function(params, options){
        let result  =  await _model.findOne({name: params.name}, {messages: {$slice: -20}}).populate('messages.user', 'username thumb').select('messages');
        let msgs =  (result) ? result.messages : [];
        return msgs;
    },

    getItemById: async function(params, options){
        let result = this.listJoinedItemsByQuery({_id: params.id, limit: 1});
        return result;
    },

    getItemByTypeAndId: async function(params, options){
        let query;
        switch (params.type) {
            case 'p':
                query = {type: 'private', members: {$all: [params.myId, params.id]}};
                break;
            case 'g':
                query = {_id: _helper.toObjectId(params.id), type: 'group'};
                break;
            case 'r':
                break;
        }
        let result = await this.listJoinedItemsByQuery({query, limit: 1}); 
        
        // get the first elem
        try { result = result[0]; } catch (e) { result = undefined; }
        if (!result){
            if (options.note == 'create-if-not-exists') result = await this.createNewConversationByParams(params);
        }else{
            if (result.messages){
                let lastMessage = result.messages[result.messages.length -1];
                if (lastMessage){
                    let seen = lastMessage.seen;
                    if (seen){
                        if (!seen.includes(params.myId)){
                            let updateResult = await _model.updateOne(
                                {_id: result._id, messages: {$elemMatch: {seen: {$gte: []}}}},
                                {$addToSet: {'messages.$[].seen': params.myId} },
                            )
                        }
                    }
                }
            }
        }
        return result;
    },

    createNewConversationByParams: async function (params){
        let conversation;
        switch (params.type) {
            case 'p':
                conversation = { type: _helper.getChatType(params.type), members: [params.myId, params.id]}
                break;
            case 'g':
                break;
            case 'r':
                break;
        }
        conversation = this.setCreated(conversation, null, 'string');
        let result = await new _model(conversation).save();
        return result.populate('members', 'username thumb').execPopulate();
    },

    getRecentItemById: async function(params, options){
        let query = {_id: _helper.toObjectId(params.id), messages: {$gt: []}};
        let project = {messages: {$slice: -1}};
        let result = await this.listRecentItemsByQuery({query, project, limit: 1}); result = result[0];
        return result;

    },

    listRecentItemsByQuery: async function(data){
        let query = data.query || {};
        let project = data.project || {};
        let limit = data.limit || 10;
        let result = await _model.find(query, project)
                                .populate('members', 'username thumb')
                                .sort({modified: -1, created: -1})
                                .select('type name members created')
                                .limit(limit);
        return result;

    },

    listJoinedItemsByQuery: async function(data){
        let query = data.query || {};
        let project = data.project || {};
        let limit = data.limit || 10;
        let result = await _model.find(query, project)
                                .populate('messages.user', 'username thumb')
                                .populate('members', 'username thumb')
                                .select('type name members messages created')
                                .limit(limit);
        return result;                                   
    },

    insertConv: async function(params, options){
        let conv = params.conv;
        conv = this.setCreated(conv, null, 'string');
        conv = this.setModified(conv, null, 'string');
        let result = await _model(conv).save();
        return result;
    },

    updateMsgSeenById: async function(params, options){
        let result = await _model.updateOne(
            {_id: _helper.toObjectId(params.id), messages: {$elemMatch: {seen: {$gte: []}}}},
            {$addToSet: {'messages.$[].seen': {$each: params.seenIds}}},
        )
        return result.nModified;
    },

    insertMsgByConversationId: async function(params, options){
        // message
        let item = params.item;
        item = this.setCreated(params.item, null, 'string');

        // conversation
        let doc = { $push: { 'messages': item, } }
        doc = this.setModified(doc, null, 'string');

        // update
        let result = await _model.updateOne( {_id: params.id}, doc);
        return item;
    },

    insertMsgByConversationName: async function(params, options){
        // message
        let item = params.item;
        item = this.setCreated(params.item, null, 'string');

        // conversation
        let doc = { $push: { 'messages': item, } }
        doc = this.setModified(doc, null, 'string');

        // update
        let result = await _model.updateOne( {name: params.name}, doc );
        if (result.nModified < 1){
            let conversation = {
                type: 'public',
                name: params.name,
                messages: [item],
            }
            conversation = this.setCreated(conversation, null, 'string');
            result = await _model(conversation).save();
        }
        return item;
    },

    updateItem: async function(params, options){
        let result = await _model.updateOne({_id: params.id}, {$set: params.item});
        return result;
    },

    get _model(){
        return _model;
    },

    get controller(){
        return controller;
    }
}
module.exports = extend(true, currentModel, adminModel);
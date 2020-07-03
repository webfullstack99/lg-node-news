const controller = 'user';
let extend = require('node.extend');
let _model = require(__path.schema+'/'+controller)
let _helper = require(__path.helper+'/helper');
let fieldAccepted   = ['id', 'username', 'email', 'fullname', 'group.name', 'status', 'ordering', 'created.time', 'modified.time'];

let adminModel = require(__path.model+'/adminModel');
let currentModel = {
    listItems: function (params, options){
        let result  = [];
        switch(options.task){
            case 'search-friends-with-username':
                result  = this.searchFriendsWithUsername(params, options);
                break;
            case 'list-strangers':
                result  = this.listStrangers(params, options);
                break;
            case 'list-friends':
                result  = this.listFriends(params, options);
                break;
            case 'list-all':
                result  = this.listAll(params, options);
                break;
            case 'list-width-fields':
                result  = this.listWithFields(params, options);
                break;
        }
        return result;
    },

    getItem: function(params, options){
        let result;
        switch(options.task){
            case 'get-mess-user-by-id':
                result  = this.getMessUserById(params, options);
                break;

            // this is field "friends"
            case 'get-friends-by-id':
                result  = this.getFriendsById(params, options);
                break;
            case 'get-profile':
                result  = this.getProfile(params, options);
                break;
            case 'get-profile-by-query':
                result  = this.getProfileByQuery(params, options);
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
            case 'friend-cancel-request':
                result  = this.friendCancelRequest(params, options);
                break;
            case 'friend-unfriend':
                result  = this.friendUnfriend(params, options);
                break;
            case 'friend-accept':
                result  = this.friendAccept(params, options);
                break;
            case 'friend-deny':
                result  = this.friendDeny(params, options);
                break;
            case 'friend-add':
                result  = this.friendAdd(params, options);
                break;
            case 'change-status':
                result  = this.changeStatus(params, options);
                break;
            case 'change-ordering':
                result  = this.changeOrdering(params, options);
                break;
            case 'change-group':
                result  = this.changeGroup(params, options);
                break;
            case 'delete-by-id':
                result  = this.deleteById(params.id);
                break;
            case 'delete-many':
                result  = this.deleteMany(this, params, options);
                break;
            case 'save-register':
                result  = this.saveRegister(params, options);
                break;
            case 'insert-item':
                result  = this.insertItem(params, options);
                break;
            case 'update-item':
                result  = this.updateItem(params, options);
                break;
            case 'update-many':
                result  = this.updateMany(params, options);
                break;
        }
        return result;
    },

    searchFriendsWithUsername: async function(params, options){
        let pattern;
        let result = [];
        if (!params.username.match(/\W/) || ['[all]'].includes(params.username)){
            switch (params.username) {
                case '[all]':
                    pattern = /.*/;
                    break;

                default:
                    pattern = new RegExp(`^${params.username}.*`, 'i');
                    break;
            }
            result = await _model.find({
                'friends.friend_list': _helper.toObjectId(params.id), 
                username: pattern,
                _id: {$nin: params.ignoreIds},
            }).select('username thumb');
        }
        return result;
    },

    listStrangers: async function(params, options){
        let result = [];
        if (params.ids){
            result = await _model.find({_id: {$nin: params.ids}}).select('username thumb');
        }
        return result;
    },

    listFriends: async function(params, options){
        let result = [];
        if (params.ids){
            result = await _model.find({_id: {$in: params.ids}}).select('username thumb');
        }
        return result;
    },

    listAll: async function(params, options){
        let query   = {};
        query       = this.filter(query, params.urlParams);
        query       = this.search(query, params.urlParams);
        let option  = {};
        option      = this.sort(option, extend(true, params.urlParams, {fieldAccepted: fieldAccepted}));
        option      = this.paginate(option, params);
        
        
        let result  =  await _model.find(query, null, option);
        return result;
    },

    getMessUserById: async function(params, options){
        let result =  _model.findOne({_id: _helper.toObjectId(params.id)}).select('username thumb');
        return result;
    },

    getFriendsById: async function(params, options){
        let result = _model.findOne({_id: params.id}).select('friends');
        return result;
    },

    // profile mean include group info
    getProfile: async function(params, options){
        let query = {password: params.password, status: 'active', group: {$gt: {}}};
        if (params.username) query.username = params.username;
        else if (params.email) query.email = params.email;

        let queryParams = { match : query }
        let result = await this.queryWithLookup(queryParams);
        return result[0];
    },

    // profile mean include group info
    getProfileByQuery: async function(params, options){
        let queryParams = { match : params.query, }
        let result = await this.queryWithLookup(queryParams);
        return result[0];
    },

    saveRegister: async function(params, options){
        let item = await this.createOptionalFieldForMember(params.item);
        item = this.setCreated(item, params.user);
        item = this.standardize(item);
        item = await this.setGroup(item);
        let tempResult = await new _model(item).save();
        if (tempResult) return true;
        return false;
    },

    insertItem: async function(params, options){
        let link    = _helper.appendIdIfExist(`${displayConf.prefix.admin}/`+controller+'/form', params.id);
        let status  = 'fail';
        params.item = this.setCreated(params.item, params.user);
        params.item = this.standardize(params.item);
        params.item = await this.setGroup(params.item);
        let tempResult = await new _model(params.item).save();
        if (tempResult) status = 'success';
        return _helper.flashResult(params.formType, status, link);
    },

    updateItem: async function(params, options){
        let link    = _helper.appendIdIfExist(`${displayConf.prefix.admin}/`+controller+'/form', params.id);
        let status  = 'fail';
        params.item = this.setModified(params.item, params.user);
        params.item = this.standardize(params.item);
        if (params.item.hasOwnProperty('group.id')) params.item = await this.setGroup(params.item);
        let tempResult = await _model.updateOne({_id: params.id}, {$set: params.item});
        if (tempResult.nModified > 0) status = 'success';
        return _helper.flashResult(params.formType, status, link);
    },

    updateMany: async function(params, options){
        var query   = (params.hasOwnProperty('query')) ? params.query : {};
        var option  = (params.hasOwnProperty('option')) ? params.option : {};
        let result = await _model.updateMany(query, option);
        return result.nModified;
    },

    friendAdd: async function(params, options){
        let result1 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.userId),
                'friends.request_to': {$ne: params.friendUserId},
                'friends.request_from': {$ne: params.friendUserId},
                'friends.friend_list': {$ne: params.friendUserId},
            }, {
                $push: { 'friends.request_to': params.friendUserId, }
            })

        let result2 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.friendUserId),
                'friends.request_to': {$ne: params.userId},
                'friends.request_from': {$ne: params.userId},
                'friends.friend_list': {$ne: params.userId},
            }, {
                $push: { 'friends.request_from': params.userId, }
            })

        let rowsAffected = result1.nModified + result2.nModified;
        return {status: (rowsAffected >= 2) ? 'success' : 'fail'};
    },

    friendCancelRequest: async function(params, options){
        let result1 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.userId),
            }, {
                $pull: { 'friends.request_to': params.friendUserId, },
            })

        let result2 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.friendUserId),
            }, {
                $pull: { 'friends.request_from': params.userId, },
            })
        let rowsAffected = result1.nModified + result2.nModified;
        return {status: (rowsAffected >= 2) ? 'success' : 'fail'};
    },

    friendUnfriend: async function(params, options){
        let result1 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.userId),
            }, {
                $pull: { 'friends.friend_list': params.friendUserId, },
            })

        let result2 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.friendUserId),
            }, {
                $pull: { 'friends.friend_list': params.userId, },
            })
        let rowsAffected = result1.nModified + result2.nModified;
        return {status: (rowsAffected >= 2) ? 'success' : 'fail'};
    },

    friendAccept: async function(params, options){
        let result1 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.userId),
            }, {
                $push: { 'friends.friend_list': params.friendUserId, },
                $pull: { 'friends.request_from': params.friendUserId, },
            })

        let result2 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.friendUserId),
            }, {
                $push: { 'friends.friend_list': params.userId, },
                $pull: { 'friends.request_to': params.userId, },
            })
        let rowsAffected = result1.nModified + result2.nModified;
        return {status: (rowsAffected >= 2) ? 'success' : 'fail'};
    },

    friendDeny: async function(params, options){
        let result1 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.userId),
            }, {
                $pull: { 'friends.request_from': params.friendUserId, },
            })

        let result2 = await _model.updateOne( 
            {
                _id: _helper.toObjectId(params.friendUserId),
            }, {
                $pull: { 'friends.request_to': params.userId, },
            })
        let rowsAffected = result1.nModified + result2.nModified;
        return {status: (rowsAffected >= 2) ? 'success' : 'fail'};
    },


    changeStatus: async function(params, options){
        let field           = 'status';
        let currentVal      = params.type;
        let newVal          = (currentVal == 'inactive') ? 'active' : 'inactive';
        let setObj          = this.setModified({}, params.user);
        setObj[field]       = newVal;
        let tempResult      = await _model.updateOne({_id: params.id}, {$set: setObj});
        let result          = this.getChangeResult({
            field: field,
            newVal: newVal,
            rowsAffected: tempResult.nModified,
            id: params.id,
        });
        return result;
    },

    changeOrdering: async function(params, options){
        let status          = 'fail';
        let field           = 'ordering';
        let newVal          = params.type;
        let flag            = this.checkOrdering(newVal);
        if (flag){
            let setObj          = this.setModified({}, params.user);
            setObj[field]       = newVal;
            let tempResult      = await _model.updateOne({_id: params.id}, {$set: setObj});
            status          = (tempResult.nModified > 0 ) ? 'success' : status;
        }
        let result  = {
            status: status,
            message: conf.template.message.change[status],
        };
        return result;
    },

    changeGroup: async function(params, options){
        let status          = 'fail';
        let field           = 'group';
        let setObj          = this.setModified({}, params.user);
        setObj[`${field}.id`]  = params.type;
        setObj              = await this.setGroup(setObj);
        let tempResult      = await _model.updateOne({_id: params.id}, {$set: setObj});
        status          = (tempResult.nModified > 0 ) ? 'success' : status;
        let result  = {
            status: status,
            message: conf.template.message.change[status],
        };
        return result;
    },

    setGroup: async function(item){
        let collection = 'group';
        let tempModel = require(__path.model+`/${collection}`);  
        let itemResult = await tempModel._model.findById(_helper.getProperty(item, `${collection}.id`)).select('name status');
        item[`${collection}.name`] = itemResult.name;
        item[`${collection}.status`] = itemResult.status;
        return item;
    },

    createOptionalFieldForMember: async function(item){
        let _groupModel = require(__path.model+'/group');
        let memberGroup = await _groupModel._model.findOne({name: /member/i}).select();
        item.group = {
            id: memberGroup._id,
        };
        item.status = 'inactive';
        item.ordering = 50;
        item.thumb = this.sampleThumb;
        return item;
    },

    queryWithLookup: async function(data){
        let match = data.match || { status: 'active', 'group': {$gt: {}} } 
        let lookupMatch = data.lookupMatch || { $and: [ {$eq: ['$$groupId', '$_id']}, {$eq: ['$status', 'active']}, ] }
        let project = data.project || { '_id' : 0, 'id' : '$_id', 'username' : 1, 'email' : 1, 'fullname' : 1, 'password' : 1, 'status' : 1, 'thumb' : 1, 'created' : 1, 'modified' : 1, 'group': {$arrayElemAt: ['$group', 0]}, 'friends' : 1}
        let lookupProject = {_id: 0, id: "$_id", name: 1, groupAcp: 1};
        let limit = data.limit || 1;

        let result = await _model.aggregate([
            { $lookup: {
                    from: 'groups',
                    let: {groupId: '$group.id'},
                    pipeline: [ 
                        { $match: { $expr: lookupMatch }, },
                        { $project:  lookupProject},
                    ],
                    as: 'group', }, },
            { $match: match, },
            { $project: project},
            { $limit: limit},
        ])
        return result;
    },

    get sampleThumb(){
        return 'sample.png';
    },

    get _model(){
        return _model;
    },

    checkOrdering: function(val){
        if (val % 5 != 0) return false;
        return true;
    },

    get controller(){
        return controller;
    },

    // more
    deleteAllFriends: async function(){
        await _model.updateMany({friends: {$exists: true}}, {$unset: {friends: ''}});
    }
}
module.exports = extend(true, currentModel, adminModel);
const controller = 'room';
let extend = require('node.extend');
let _model = require(__path.schema+'/'+controller)
let _helper = require(__path.helper+'/helper');
let fieldAccepted   = ['id', 'name', 'thumb', 'status', 'ordering', 'created.time', 'modified.time'];

let adminModel = require(__path.model+'/adminModel');
let currentModel = {
    listItems: function (params, options){
        let result  = [];
        switch(options.task){
            case 'list-all':
                result  = this.listAll(params, options);
                break;
            case 'list-width-fields':
                result  = this.listWithFields(params, options);
                break;
        }
        return result;
    },

    listFrontendItems: function (params, options){
        let result  = [];
        switch(options.task){
            case 'list-all-for-home':
                result  = this.listAllForHome(params, options);
                break;
        }
        return result;
    },

    getItem: function(params, options){
        let result;
        switch(options.task){
            case 'get-frontend-item-by-id':
                result  = this.getFrontendItemById(params, options);
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
            case 'change-status':
                result  = this.changeStatus(params, options);
                break;
            case 'change-ordering':
                result  = this.changeOrdering(params, options);
                break;
            case 'change-type':
                result  = this.changeType(params, options);
                break;
            case 'change-category':
                result  = this.changeCategory(params, options);
                break;
            case 'delete-by-id':
                result  = this.deleteById(params.id);
                break;
            case 'delete-many':
                result  = this.deleteMany(this, params, options);
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

    listAllForHome: async function(params, options){
        let query   = {};
        let result  =  await _model.find(query).select('name thumb').sort({created: -1, name: 1}).limit(displayConf.frontend.mess.homePage.maxRoom);
        return result;
    },

    getItemByQuery: async function(params, options){
        var query   = (params.hasOwnProperty('query')) ? params.query : {};
        var option  = (params.hasOwnProperty('option')) ? params.option : {};
        let result  = await _model.findOne(query, option);   
        return result;
    },

    getFrontendItemById: async function(params, options){
        let result  = await _model.findOne({_id: _helper.toObjectId(params.id)}).select('name thumb');   
        return result;
    },

    insertItem: async function(params, options){
        let link    = _helper.appendIdIfExist(`${displayConf.prefix.admin}/`+controller+'/form', params.id);
        let status  = 'fail';
        params.item = this.setCreated(params.item, params.user);
        params.item = this.standardize(params.item);
        let tempResult = await new _model(params.item).save();
        if (tempResult) status = 'success';
        if (options.note != 'raw'){ return _helper.flashResult(params.formType, status, link); } 
        return tempResult;
    },

    updateItem: async function(params, options){
        let link    = _helper.appendIdIfExist(`${displayConf.prefix.admin}/`+controller+'/form', params.id);
        let status  = 'fail';
        params.item = this.setModified(params.item, params.user);
        params.item = this.standardize(params.item);
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

    //queryWithLookup: async function(data){
        //let match = data.match || { status: 'active', 'cat': {$gt: {}} } 
        //let lookupMatch = data.lookupMatch || { $and: [ {$eq: ['$$categoryId', '$_id']}, {$eq: ['$status', 'active']}, ] }
        //let project = data.project || { 'title' : 1, 'slug' : 1, 'type' : 1, 'content' : 1, 'thumb' : 1, 'created' : 1, 'cat': {$arrayElemAt: ['$cat', 0]},}
        //let lookupProject = {_id: 0, id: "$_id", name: 1, slug: 1 };
        //let limit = data.limit || 10;

        //let result = await _model.aggregate([
            //{ $lookup: {
                    //from: 'categories',
                    //let: {categoryId: '$category.id'},
                    //pipeline: [ 
                        //{ $match: { $expr: lookupMatch }, },
                        //{ $project:  lookupProject},
                    //],
                    //as: 'cat', }, },
            //{ $match: match, },
            //{ $sort: {ordering: 1, title: 1}},
            //{ $project: project},
            //{ $limit:  limit},
        //])
        //return result;
    //},

    get _model(){
        return _model;
    },

    checkOrdering: function(val){
        if (val % 5 != 0) return false;
        return true;
    },

    get controller(){
        return controller;
    }
}
module.exports = extend(true, currentModel, adminModel);
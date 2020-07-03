const controller = 'group';
let extend = require('node.extend');
let _model = require(__path.schema+'/'+controller)
let _helper = require(__path.helper+'/helper');
let fieldAccepted   = ['id', 'name', 'status', 'ordering', 'groupAcp', 'created.time', 'modified.time'];

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

    getItem: function(params, options){
        let result;
        switch(options.task){
            case 'by-id':
                result  = this.getItemById(params, options);
                break;
            case 'by-query':
                result  = this.getItemByQuery(params, options);
                break;
        }
        return result;
    },

    saveItem: async function(params, options){
        let result;
        switch (options.task){
            case 'change-status':
                result  = this.changeStatus(params, options);
                break;
            case 'change-groupAcp':
                result  = this.changeGroupAcp(params, options);
                break;
            case 'change-ordering':
                result  = this.changeOrdering(params, options);
                break;
            case 'delete-by-id':
                result  = await this.deleteById(params.id);
                if (result.status == 'success'){
                    this.updateCollection({ collection: 'user', path: 'group', itemId: params.id, option: {$set: {group: {}}} })
                } 
                break;
            case 'delete-many':
                result  = this.deleteMany(this, params, options);
                let ids = params.query._id.$in;
                this.updateCollection({
                    collection: 'user',
                    path: 'group',
                    itemId: ids[0],
                    objectIds: ids,
                    option: {$set: {group: {}}},
                    type: 'many',
                })
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

    getItemByQuery: async function(params, options){
        var query   = (params.hasOwnProperty('query')) ? params.query : {};
        var option  = (params.hasOwnProperty('option')) ? params.option : {};
        let result  = await _model.findOne(query, option);   
        return result;
    },

    insertItem: async function(params, options){
        let link    = _helper.appendIdIfExist(`${displayConf.prefix.admin}/`+controller+'/form', params.id);
        let status  = 'fail';
        params.item = this.setCreated(params.item, params.user);
        params.item = this.standardize(params.item);
        let tempResult = await new _model(params.item).save();
        if (tempResult) status = 'success';
        return _helper.flashResult(params.formType, status, link);
    },

    updateItem: async function(params, options){
        let link    = _helper.appendIdIfExist(`${displayConf.prefix.admin}/`+controller+'/form', params.id);
        let status  = 'fail';
        params.item = this.setModified(params.item, params.user);
        params.item = this.standardize(params.item);
        let tempResult = await _model.updateOne({_id: params.id}, {$set: params.item});
        if (tempResult.nModified > 0){
            status = 'success';
            this.updateCollection({ collection: 'user', path: 'group', itemId: params.id, fieldsUpdate: ['name', 'status'], })
        }
        return _helper.flashResult(params.formType, status, link);
    },

    updateMany: async function(params, options){
        var query   = (params.hasOwnProperty('query')) ? params.query : {};
        var option  = (params.hasOwnProperty('option')) ? params.option : {};
        let result  = await _model.updateMany(query, option);
        if (result.nModified > 0){
            let setObj = params.option.$set;
            for (let field in setObj){
                let ids = params.query._id.$in;
                if (field == 'status'){
                    await this.updateCollection({
                        collection: 'user',
                        path: 'group',
                        itemId: ids[0],
                        objectIds: ids,
                        fieldsUpdate: ['status'],
                        type: 'many',
                    })
                }
            }
        } 
        return result.nModified;
    },

    changeStatus: async function(params, options){
        let field           = 'status';
        let currentVal      = params.type;
        let newVal          = (currentVal == 'inactive') ? 'active' : 'inactive';
        let setObj          = this.setModified({}, params.user);
        setObj[field]       = newVal;
        let tempResult      = await _model.updateOne({_id: params.id}, {$set: setObj});
        if (tempResult.nModified > 0){
            this.updateCollection({ collection: 'user', path: 'group', itemId: params.id, fieldsUpdate: ['status'], })
        } 
        let result          = this.getChangeResult({
            field: field,
            newVal: newVal,
            rowsAffected: tempResult.nModified,
            id: params.id,
        });
        return result;
    },

    changeGroupAcp: async function(params, options){
        let field           = 'groupAcp';
        let currentVal      = params.type;
        let newVal          = (currentVal == 'no') ? 'yes' : 'no';
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
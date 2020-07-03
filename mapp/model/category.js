const controller = 'category';
let extend = require('node.extend');
let _model = require(__path.schema+'/'+controller)
let _helper = require(__path.helper+'/helper');
let fieldAccepted   = ['id', 'name', 'slug', 'display', 'is_home', 'status', 'ordering', 'created.time', 'modified.time'];

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
            case 'by-query':
                result  = this.listItemsByQuery(params, options);
                break;
        }
        return result;
    },

    listFrontendItems: function (params, options){
        let result  = [];
        switch(options.task){
            case 'list-cats-in-home':
                result  = this.listCatsInHome(params, options);
                break;
            case 'list-cats-menu':
                result  = this.listCatsMenu(params, options);
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
            case 'change-is_home':
                result  = this.changeIsHome(params, options);
                break;
            case 'change-display':
                result  = this.changeDisplay(params, options);
                break;
            case 'change-ordering':
                result  = this.changeOrdering(params, options);
                break;
            case 'delete-by-id':
                result  = await this.deleteById(params.id);
                if (result.status == 'success'){
                    //this.updateCategory();
                    this.updateCollection({ collection: 'article', path: 'category', itemId: params.id, option: {$set: {category: {}}} })
                } 
                break;
            case 'delete-many':
                result  = this.deleteMany(this, params, options);
                let ids = params.query._id.$in;
                this.updateCollection({
                    collection: 'article',
                    path: 'category',
                    itemId: ids[0],
                    objectIds: ids,
                    option: {$set: {category: {}}},
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

    // SUPPORTED FUNCTIONS ===============
    listAll: async function(params, options){
        let query   = {};
        query       = this.filter(query, params.urlParams);
        query       = this.search(query, params.urlParams);
        let option  = {};
        option      = this.sort(option, extend(true, params.urlParams, {fieldAccepted: fieldAccepted}));
        option      = this.paginate(option, params);
        let result  =  _model.find(query, null, option);
        return result;
    },

    listItemsByQuery: async function(params, options){
        var query   = (params.hasOwnProperty('query')) ? params.query : {};
        var option  = (params.hasOwnProperty('option')) ? params.option : {};
        let result  = await _model.find(query, option);   
        return result;
    },

    listCatsInHome: async function(params, options){
        let queryParams = {
            lookupMatch : { $and: [ {$eq: ['$$categoryId', '$category.id']}, {$eq: ['$status', 'active']}, {$ne: ['$type', 'featured']}, ] },
            lookupProject : {title: 1, slug: 1, type: 1, content: 1, thumb: 1, created: 1, category: 1},
            lookupLimit : displayConf.frontend.homePage.maxPostInCat,
            match : { status: 'active', is_home: 'yes', 'articles.0': {$exists: true}}, 
            limit : displayConf.frontend.homePage.maxCat,
        }
        let result = this.queryWithLookup(queryParams);
        return result;
    },

    listCatsMenu: async function(params, options){
        let queryParams = {
            limit : displayConf.frontend.webPage.maxCatInMenu,
            project : { name: 1, slug: 1, display: 1, created: 1},
        }
        let result = this.queryWithLookup(queryParams);
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
            this.updateCollection({ collection: 'article', path: 'category', itemId: params.id, fieldsUpdate: ['name', 'status'], })
        }
        return _helper.flashResult(params.formType, status, link);
    },

    updateMany: async function(params, options){
        var query   = (params.hasOwnProperty('query')) ? params.query : {};
        var option  = (params.hasOwnProperty('option')) ? params.option : {};
        let result  = await _model.updateMany(query, option);
        if (result.nModified > 0){
            //this.updateCategory();
            let setObj = params.option.$set;
            for (let field in setObj){
                let ids = params.query._id.$in;
                if (field == 'status'){
                    await this.updateCollection({
                        collection: 'article',
                        path: 'category',
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

    changeIsHome: async function(params, options){
        let field           = 'is_home';
        let currentVal      = params.type;
        let newVal          = (currentVal == 'yes') ? 'no' : 'yes';
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

    changeStatus: async function(params, options){
        let field           = 'status';
        let currentVal      = params.type;
        let newVal          = (currentVal == 'inactive') ? 'active' : 'inactive';
        let setObj          = this.setModified({}, params.user);
        setObj[field]       = newVal;
        let tempResult      = await _model.updateOne({_id: params.id}, {$set: setObj});
        if (tempResult.nModified > 0){
            //this.updateCategory();
            this.updateCollection({ collection: 'article', path: 'category', itemId: params.id, fieldsUpdate: ['status'], })
        } 
        let result          = this.getChangeResult({
            field: field,
            newVal: newVal,
            rowsAffected: tempResult.nModified,
            id: params.id,
        });
        return result;
    },

    changeDisplay: async function(params, options){
        let status          = 'fail';
        let field           = 'display';
        let newVal          = params.type;
        let setObj          = this.setModified({}, params.user);
        setObj[field]       = newVal;
        let tempResult      = await _model.updateOne({_id: params.id}, {$set: setObj});
        status          = (tempResult.nModified > 0 ) ? 'success' : status;
        let result  = {
            status: status,
            message: conf.template.message.change[status],
        };
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

    queryWithLookup: async function(data){
        let match = data.match || { status: 'active', 'articles.0': {$exists: true}}; 
        let lookupMatch = data.lookupMatch || { $and: [ {$eq: ['$$categoryId', '$category.id']}, {$eq: ['$status', 'active']}, ] };
        let lookupLimit = data.lookupLimit || 10;
        let limit = data.limit || 5;
        let project = data.project || { name: 1, slug: 1, display: 1, created: 1, articles: 1}
        let lookupProject = {title: 1, slug: 1, type: 1, content: 1, thumb: 1, created: 1};

        let result = await _model.aggregate([
            { $lookup: {
                    from: 'articles',
                    let: {categoryId: '$_id'},
                    pipeline: [ 
                        { $match: { $expr:  lookupMatch}, },
                        { $project: lookupProject},
                        { $sort: {ordering: 1, created: -1, title: 1} },
                        { $limit: lookupLimit },
                    ],
                    as: 'articles', }, },
            { $match: match, },
            { $sort: {ordering: 1, title: 1}},
            { $project: project},
            { $limit: limit },
        ])
        return result;
    },

    get _model(){
        return _model;
    },

    checkOrdering: function(val){
        if (val % 5 != 0) return false;
        return true;
    },

    updateCategory: async function(){
        let jsonfile = require('jsonfile');
        let activeCats = await this.listItems({query: {status: 'active'}, fields: ['name']}, {task: 'list-width-fields'});
        let path = __path.libs+'/activeCats.json';
        jsonfile.writeFile(path, activeCats, function (err) {
            if (err) console.error(err)
        })
    },

    get controller(){
        return controller;
    }

}
module.exports = extend(true, currentModel, adminModel);
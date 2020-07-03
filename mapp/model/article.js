const controller = 'article';
let extend = require('node.extend');
let _model = require(__path.schema + '/' + controller)
let _helper = require(__path.helper + '/helper');
let fieldAccepted = ['id', 'title', 'type', 'category.name', 'status', 'ordering', 'created.time', 'modified.time', 'content'];

let adminModel = require(__path.model + '/adminModel');
let currentModel = {
    listItems: function(params, options) {
        let result = [];
        switch (options.task) {
            case 'list-all':
                result = this.listAll(params, options);
                break;
            case 'list-width-fields':
                result = this.listWithFields(params, options);
                break;
        }
        return result;
    },

    listFrontendItems: function(params, options) {
        let result = [];
        switch (options.task) {
            case 'list-relevant-articles-by-articleId':
                result = this.listRelevantArticlesByArticleId(params.articleId);
                break;
            case 'list-article-by-articleId':
                result = this.getArticleByArticleId(params.articleId);
                break;
            case 'list-articles-by-catId':
                result = this.listArticlesByCatId(params, options);
                break;
            case 'list-latest-items':
                result = this.listLatestItems();
                break;
            case 'list-featured-items':
                result = this.listFeaturedItems();
                break;
        }
        return result;
    },

    getItem: function(params, options) {
        let result;
        switch (options.task) {
            case 'by-id':
                result = this.getItemById(params, options);
                break;
            case 'by-query':
                result = this.getItemByQuery(params, options);
                break;
        }
        return result;
    },

    saveItem: function(params, options) {
        let result;
        switch (options.task) {
            case 'change-status':
                result = this.changeStatus(params, options);
                break;
            case 'change-ordering':
                result = this.changeOrdering(params, options);
                break;
            case 'change-type':
                result = this.changeType(params, options);
                break;
            case 'change-category':
                result = this.changeCategory(params, options);
                break;
            case 'delete-by-id':
                result = this.deleteById(params.id);
                break;
            case 'delete-many':
                result = this.deleteMany(this, params, options);
                break;
            case 'insert-item':
                result = this.insertItem(params, options);
                break;
            case 'update-item':
                result = this.updateItem(params, options);
                break;
            case 'update-many':
                result = this.updateMany(params, options);
                break;
        }
        return result;
    },

    listAll: async function(params, options) {
        let query = {};
        query = this.filter(query, params.urlParams);
        query = this.search(query, params.urlParams);
        let option = {};
        option = this.sort(option, extend(true, params.urlParams, { fieldAccepted: fieldAccepted }));
        option = this.paginate(option, params);
        let result = await _model.find(query, null, option);
        return result;
    },

    listArticlesByCatId: async function(params, options) {
        let result = await _model.find({ status: 'active', 'category.status': 'active', 'category.id': _helper.toObjectId(params.catId) })
            .select('title slug content category thumb created modified')
            .sort({ ordering: 1, created: -1, name: 1 })
            .skip(Number.parseInt(params.skip))
            .limit(params.limit);
        return result;
    },

    listLatestItems: async function() {
        let result = await _model.find({ status: 'active', 'category.status': 'active' })
            .select('title slug content category thumb created modified')
            .sort({ created: -1, ordering: 1 })
            .limit(displayConf.frontend.webPage.maxLatestPost);
        return result;
    },

    listRelevantArticlesByArticleId: async function(articleId) {
        let catId = await _model.findById({ _id: _helper.toObjectId(articleId) }).select('category.id');
        let queryParams = {
            match: { _id: { $ne: _helper.toObjectId(articleId) }, status: 'active', 'category.id': _helper.toObjectId(catId.category.id) },
            limit: displayConf.frontend.articlePage.maxRelaventPost,
        }
        let result = await this.queryWithLookup(queryParams);
        return result;
    },

    getArticleByArticleId: async function(articleId) {
        let match = { _id: _helper.toObjectId(articleId), status: 'active', 'cat': { $gt: {} } };
        let result = await this.queryWithLookup({ match: match });
        return result[0];
    },

    listFeaturedItems: async function() {
        let match = { status: 'active', type: 'featured', 'cat': { $gt: {} } };
        let limit = displayConf.frontend.homePage.maxTopPost;
        let result = await this.queryWithLookup({ match: match, limit: limit });
        return result;
    },

    getItemByQuery: async function(params, options) {
        var query = (params.hasOwnProperty('query')) ? params.query : {};
        var option = (params.hasOwnProperty('option')) ? params.option : {};
        let result = await _model.findOne(query, option);
        return result;
    },

    insertItem: async function(params, options) {
        let link = _helper.appendIdIfExist(`${displayConf.prefix.admin}/` + controller + '/form', params.id);
        let status = 'fail';
        params.item = this.setCreated(params.item, params.user);
        params.item = this.standardize(params.item);
        params.item = await this.setCategory(params.item);
        let tempResult = await new _model(params.item).save();
        if (tempResult) status = 'success';
        if (options.note != 'raw') { return _helper.flashResult(params.formType, status, link); }
        return tempResult;
    },

    updateItem: async function(params, options) {

        let link = _helper.appendIdIfExist(`${displayConf.prefix.admin}/` + controller + '/form', params.id);
        let status = 'fail';
        params.item = this.setModified(params.item, params.user);
        params.item = this.standardize(params.item);
        params.item = await this.setCategory(params.item);
        let tempResult = await _model.updateOne({ _id: params.id }, { $set: params.item });
        if (tempResult.nModified > 0) status = 'success';
        return _helper.flashResult(params.formType, status, link);
    },

    updateMany: async function(params, options) {
        var query = (params.hasOwnProperty('query')) ? params.query : {};
        var option = (params.hasOwnProperty('option')) ? params.option : {};
        let result = await _model.updateMany(query, option);
        return result.nModified;
    },

    changeStatus: async function(params, options) {
        let field = 'status';
        let currentVal = params.type;
        let newVal = (currentVal == 'inactive') ? 'active' : 'inactive';
        let setObj = this.setModified({}, params.user);
        setObj[field] = newVal;
        let tempResult = await _model.updateOne({ _id: params.id }, { $set: setObj });
        let result = this.getChangeResult({
            field: field,
            newVal: newVal,
            rowsAffected: tempResult.nModified,
            id: params.id,
        });
        return result;

    },

    changeOrdering: async function(params, options) {
        let status = 'fail';
        let field = 'ordering';
        let newVal = params.type;
        let flag = this.checkOrdering(newVal);
        if (flag) {
            let setObj = this.setModified({}, params.user);
            setObj[field] = newVal;
            let tempResult = await _model.updateOne({ _id: params.id }, { $set: setObj });
            status = (tempResult.nModified > 0) ? 'success' : status;
        }
        let result = {
            status: status,
            message: conf.template.message.change[status],
        };
        return result;
    },

    changeCategory: async function(params, options) {
        let status = 'fail';
        let field = 'category';
        let setObj = this.setModified({}, params.user);
        setObj[`${field}.id`] = params.type;
        setObj = await this.setCategory(setObj);
        let tempResult = await _model.updateOne({ _id: params.id }, { $set: setObj });
        status = (tempResult.nModified > 0) ? 'success' : status;
        let result = {
            status: status,
            message: conf.template.message.change[status],
        };
        return result;
    },

    changeType: async function(params, options) {
        let status = 'fail';
        let field = 'type';
        let newVal = params.type;
        let setObj = this.setModified({}, params.user);
        setObj[field] = newVal;
        let tempResult = await _model.updateOne({ _id: params.id }, { $set: setObj });
        status = (tempResult.nModified > 0) ? 'success' : status;
        let result = {
            status: status,
            message: conf.template.message.change[status],
        };
        return result;
    },

    setCategory: async function(item) {
        let collection = 'category';
        let tempModel = require(__path.model + `/${collection}`);
        let itemResult = await tempModel._model.findById(_helper.getProperty(item, `${collection}.id`)).select('name status');
        item[`${collection}.name`] = itemResult.name;
        item[`${collection}.status`] = itemResult.status;
        return item;
    },

    queryWithLookup: async function(data) {
        let match = data.match || { status: 'active', 'cat': { $gt: {} } }
        let lookupMatch = data.lookupMatch || { $and: [{ $eq: ['$$categoryId', '$_id'] }, { $eq: ['$status', 'active'] }, ] }
        let project = data.project || { 'title': 1, 'slug': 1, 'type': 1, 'content': 1, 'thumb': 1, 'created': 1, 'cat': { $arrayElemAt: ['$cat', 0] }, }
        let lookupProject = { _id: 0, id: "$_id", name: 1, slug: 1 };
        let limit = data.limit || 10;

        let result = await _model.aggregate([{
                $lookup: {
                    from: 'categories',
                    let: { categoryId: '$category.id' },
                    pipeline: [
                        { $match: { $expr: lookupMatch }, },
                        { $project: lookupProject },
                    ],
                    as: 'cat',
                },
            },
            { $match: match, },
            { $sort: { ordering: 1, title: 1 } },
            { $project: project },
            { $limit: limit },
        ])
        return result;
    },

    get _model() {
        return _model;
    },

    checkOrdering: function(val) {
        if (val % 5 != 0) return false;
        return true;
    },

    get controller() {
        return controller;
    }
}
module.exports = extend(true, currentModel, adminModel);
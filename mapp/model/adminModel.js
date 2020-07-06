const _helper = require(__path.helper + '/helper');
const _upload = require(__path.helper + '/upload');
module.exports = {
    getItemById: async function (params, options) {
        let result = await this._model.findById(params.id);
        return result;
    },

    getItemByQuery: async function (params, options) {
        var query = params.query || {};
        var option = params.option || {};
        let result = await this._model.findOne(query, option);
        return result;
    },

    setCreated: function (item, user, type = 'object') {
        if (type == 'object') {
            if (item.created) {
                item.created.time = Date.now();
            } else {
                var user = user || {};
                item.created = {};
                item.created.username = user.username;
                item.created.time = Date.now();
            }
        } else if (type == 'string') { item.created = Date.now(); }
        return item;
    },

    setModified: function (item, user, type = 'object') {
        if (type == 'object') {
            if (item.modified) {
                item.modified.time = Date.now();
            } else {
                var user = user || {};
                item.modified = {};
                item.modified.username = user.username;
                item.modified.time = Date.now();
            }
        } else if (type == 'string') { item.modified = Date.now(); }
        return item;
    },

    standardize: function (item) {
        if (item.hasOwnProperty('name')) item.name = _helper.ucfirst(item.name);
        return item;
    },

    convOrderToNumber: function (order) {
        return (order == 'asc') ? 1 : -1;
    },

    countAll: async function (params) {
        let query = {};
        query = this.filter(query, params.urlParams);
        query = this.search(query, params.urlParams);
        let result = await this._model.countDocuments(query);
        return result;
    },

    //optional{params, task}
    count: async function (field, alias = false, match = {}, optional = false) {
        if (optional) {
            if (optional.task == 'filter' && Object.keys(match).length < 1) {
                match = this.filter(match, optional.params.urlParams);
                match = this.search(match, optional.params.urlParams);
            }
        }

        for (let key in match) if (key.slice(-2) == 'id') match[key] = _helper.toObjectId(match[key]);
        let param =
            [
                { $match: match },
                {
                    $group: {
                        _id: `$${field}`,
                        count: { $sum: 1 }
                    }
                }
            ]
        if (alias) {
            let project = {
                $project: {
                    [alias]: "$_id",
                    count: 1,
                    _id: false,
                }
            }
            param.push(project);
        }
        let result = await this._model.aggregate(param);
        return result;
    },

    getCountArrays: async function (params) {
        var countArrays = [];
        let match = this.filter({}, params.urlParams);
        match = this.search(match, params.urlParams);
        let tempArr = conf.template_config.filter[this.controller];
        let filterList = [];
        tempArr.forEach((value) => {
            if (!value.includes('_select')) filterList.push(value);
        })
        for (let filter of filterList) {
            let result = await this.count(filter, filter, match);
            result = this.addAllInCountArray(filter, result);
            if (result) countArrays[filter] = result;
        }
        return countArrays;
    },

    getChangeResult: function (params) {
        let link = '#';
        let status = 'fail';
        if (params.rowsAffected > 0) {
            link = _helper.getChangeLink({
                controller: this.controller,
                field: params.field,
                type: params.newVal,
                id: params.id,
            })
            status = 'success';
        }
        let result = {
            status: status,
            newVal: params.newVal,
            link: link,
            template: conf.template.format_button[params.field][params.newVal],
            message: conf.template.message.change[status],
        };
        return result;
    },

    filter: function (query, params) {
        let filters = params.filter;
        for (let key in filters) {
            if (filters[key] != 'all') {
                query[key] = filters[key];
            }
        }
        let select_filters = params.select_filter;
        for (let key in select_filters) {
            if (select_filters[key] != 'all') {
                query[key] = select_filters[key];
            }
        }
        return query;
    },

    search: function (query, params) {
        if (params.search.field) {
            let field = params.search.field;
            let value = params.search.value;
            let fullTextSearch = '\"' + _helper.removeMultiSpace(value) + '\"';
            let patern = new RegExp(value, 'igmsu');
            let searchList = conf.template_config.search[this.controller];
            if (field != 'all') {
                if (searchList.indexOf(field) > -1) {
                    if (field == 'content.text') query.$text = { $search: fullTextSearch };
                    else query[field] = patern;
                }
            } else {
                let orArr = [];
                for (let field of searchList) {
                    if (field == 'all') continue;
                    orArr.push({ [field]: patern });
                }
                if (orArr.length > 0) query.$or = orArr;
            }
        }
        return query;
    },

    sort: function (option, params) {
        option.sort = {};
        if (params.sort.field) {
            let field = params.sort.field;
            let value = params.sort.value;
            if (params.fieldAccepted.indexOf(field) > -1) {
                option.sort[field] = this.convOrderToNumber(value);
            }
        }

        if (Object.keys(option.sort).length < 1) option.sort._id = -1;
        return option;
    },

    paginate: function (option, params) {
        let curPage = params.urlParams.page;

        if (params.pagination) {
            option.limit = params.pagination.itemsPerPage;
            option.skip = (curPage - 1) * option.limit;
        }
        return option;
    },

    deleteById: async function (id) {
        let status = 'fail';
        let tempResult = await this._model.findOneAndDelete({ _id: id });
        if (tempResult) {
            let thumb = tempResult.thumb;
            _upload.remove(thumb, this.controller);
            status = 'success';
        }
        let result = {
            status: status,
            message: conf.template.message.delete[status],
        };
        return result;
    },

    deleteMany: async function (_model, params, options) {
        var query = (params.hasOwnProperty('query')) ? params.query : {};
        let thumbs = await _model.listItems({ query: query, fields: ['thumb'] }, { task: 'list-width-fields' });
        let result = await _model._model.deleteMany(query);
        if (result.deletedCount > 0) {
            for (let item of thumbs) {
                let thumb = item.thumb;
                _upload.remove(thumb, this.controller);
            }
        }
        return result.deletedCount;
    },

    addAllInCountArray: function (field, array) {
        if (array) {
            let all = {
                [field]: 'all',
                count: 0,
            };
            for (let x of array) {
                all.count += x.count;
            }
            array.unshift(all);
        }
        return array;
    },

    listWithFields: async function (params, options) {
        let query = params.query || {};
        let option = params.option || {};
        let result;
        if (params.fields) result = await this._model.find(query, null, option).select(params.fields.join(' '));
        else result = await this._model.find(query, null, option);
        return result;
    },

    getActiveCats: function () {
        let jsonfile = require('jsonfile');
        let path = __path.libs + '/activeCats.json';
        let result = jsonfile.readFileSync(path);
        return result;
    },

    // data{collection, path, itemId, [, fieldsUpdate[...], type(one|many), option]}
    updateCollection: async function (data = {}) {
        if (Object.keys(data).length > 1) {
            // set deafault value
            data.fieldsUpdate = data.fieldsUpdate || ['name'];
            data.type = data.type || 'one';
            let tempModel = require(__path.model + `/${data.collection}`);
            let query = {};

            // query
            if (data.type == 'one') query = { [`${data.path}.id`]: data.itemId };
            else if (data.type == 'many') query = { [`${data.path}.id`]: { $in: data.objectIds } };

            let option;
            if (!data.hasOwnProperty('option')) {
                let item = await this._model.findById(data.itemId).select(data.fieldsUpdate.join(' '));
                // set
                let set = {};
                for (let field of data.fieldsUpdate) {
                    set[`${data.path}.${field}`] = item[field];
                }
                option = { $set: set };
            } else option = data.option;
            let result = await tempModel.saveItem({ query: query, option: option }, { task: 'update-many' });
        }
    },

    removeTrashThumb: function (items) {
        let thumbArr = [];
        for (let item of items) { thumbArr.push(item.thumb); }
        let fs = require('fs');
        let path;
        path = __path.files + `/${this.controller}/${conf.name.folder.original}`;
        fs.readdirSync(path).forEach(file => {
            if (!thumbArr.includes(file.trim())) {
                path += `/${file}`;
                if (fs.existsSync(path)) fs.unlink(path, (err) => console.log(err));
            }
        });
        path = __path.files + `/${this.controller}/${conf.name.folder.resize}`;
        fs.readdirSync(path).forEach(file => {
            if (!thumbArr.includes(file.trim())) {
                path += `/${file}`;
                if (fs.existsSync(path)) fs.unlink(path, (err) => console.log(err));
            }
        });
    },

    createResizeThumbFromOrginal: async function (data) {
        for (let item of items) { thumbArr.push(item.thumb); }
        let jimp = require('jimp');
        for (let thumb of thumbArr) {
            originalPath = __path.files + `/${this.controller}/${conf.name.folder.original}/${thumb}`;
            resizePath = __path.files + `/${this.controller}/${conf.name.folder.resize}/${thumb}`;

            let image = await jimp.read(originalPath)
            image.cover(data.width, data.height).quality(100).write(resizePath);
        }
    },

    rawArticles: async function (item) {
        const request = require("request-promise");
        const cheerio = require("cheerio");

        let nCatLink = 99;
        let catLinks = [];
        let articleArr = [];

        // domain
        let domainPattern = new RegExp('^https:\/\/[a-zA-Z_0-9]+\\.[a-z]{2,10}');
        let domain = _helper.matchRegex(item.catLink, domainPattern);

        // cat link
        let catLinkPattern = new RegExp('^https:\/\/[a-zA-Z_0-9]+\\.[a-z]{2,10}\/[a-zA-Z0-9\\-]+');
        catLinks.push(_helper.matchRegex(item.catLink, catLinkPattern));

        // create cat links (multi page)
        for (let i = 2; i < nCatLink; i++) {
            let link = catLinks[0] + `/trang-${i}.html`;
            catLinks.push(link);
        }

        // raw
        let articleLinks = [];
        let enoughFlag = false;
        for (let catLink of catLinks) {
            if (!enoughFlag) {
                // raw article link
                let html = await request({ url: catLink });
                let $ = cheerio.load(html);
                let articles = $('.zone--timeline > .relative > article.story');
                articles.each(function () {
                    let data = $(this);
                    articleLinks.unshift(data.children('a.story__thumb').attr('href'));
                    if (articleLinks.length >= item.wishNumber) {
                        enoughFlag = true;
                        return false;
                    }
                })
            } else break;
        }

        // raw article
        for (let articleLink of articleLinks) {
            let goodUrl = domain + articleLink;
            let result = await this.rawArticleByArticleLink({ url: goodUrl, item: item });
            if (result) {
                articleArr.push(result);
                console.log(_helper.computePercent(articleArr.length, item.wishNumber) + '%');
                if (articleArr.length >= item.wishNumber) return articleArr;
            }
        }
        return articleArr;
    },

    rawArticleByArticleLink: async function (data = {}) {
        const request = require("request-promise");
        const cheerio = require("cheerio");
        const upload = require(__path.helper + '/upload');

        let _myModel = this;
        let controller = this.controller;

        let html = await request({ url: data.url });
        let $ = cheerio.load(html);
        let article = $('div.details');
        let item = data.item;
        let flag = true;
        article.filter(function () {
            try {
                let data = $(this);
                item.title = data.children('.details__headline').text().trim();
                item.slug = _helper.slug(item.title);
                item.content = {};
                item.content.html = data.children('.l-content')
                    .children('.pswp-content')
                    .children('.details__content')
                    .children('#main_detail')
                    .children('.detail')
                    .text()
                item.content.text = item.content.html;
                let thumbUrl = $(this).children('.l-content')
                    .children('.pswp-content')
                    .children('#contentAvatar')
                    .children('.pswp-content__wrapimage')
                    .children('.pswp-content__image')
                    .children('figure')
                    .children('a')
                    .children('img')
                    .attr('src');
                item.thumb = upload.save({ originalname: thumbUrl, url: thumbUrl }, controller, { type: 'url', resize: { width: 450, height: 360 } });
            } catch (e) { flag = false; }
        })
        if (flag) {
            let result = await _myModel.saveItem({ item: item }, { task: 'insert-item', note: 'raw' });
            return result;
        }
    },

    // import - export
    exportCollection: async function (path) {
        let jsonfile = require('jsonfile');
        let items = await this._model.find({});
        jsonfile.writeFileSync(path, items);
    },

    importCollection: async function (path) {
        let jsonfile = require('jsonfile');
        let items = jsonfile.readFileSync(path);
        if (items.length > 0) {
            let result = await this._model.insertMany(items);
            return result;
        }
    },

    // getjson - importjson
    getCollectionJsonData: async function (controller) {
        if (this.getCollectionName(controller)) {
            let model = require(`${__path.model}/${controller}`);
            let items = await model._model.find({});
            return items;
        }
    },

    //importCollectionByJson: async function (controller, jsonData) {
    //let items = jsonfile.readFileSync(path);
    //if (items.length > 0) {
    //let result = await this._model.insertMany(items);
    //return result;
    //}
    //},

    getCollectionName: function (controller) {
        var databaseConfig = require(__path.config + '/database');
        return databaseConfig.collection[controller];
    }
}
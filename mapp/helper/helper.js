const _mongoose = require('mongoose');
const _url = require('url');
const _js = require(__path.helper + '/js');

class Helper {

    static getPureUrl(req) {
        return req.protocol + '://' + req.hostname + ((conf.activation_port) ? `:${conf.activation_port}` : conf.activation_port);
    }

    // {field, type, id, (query)?}
    static getChangeLink(data) {
        let path = `${displayConf.prefix.admin}/${data.controller}/${data.field}/${data.type}/${data.id}`
        let query = data.query || {};
        let link = _url.format({
            pathname: path,
            query: query,
        });
        return link;
    }

    static getUrl(module, controller, action, params = {}) {
        let pureUrl = `${module}/${controller}/${action}`;
        let result = this.getUrlWithNewParams(params, pureUrl);
        return result;
    }

    static createFrontendLink(data = {}) {
        let type = data.type || '';
        let slug = data.slug || '';
        let id = data.id || '';

        let prefixes = displayConf.prefix.frontend;
        let link = displayConf.prefix.news;
        link += prefixes[type] || '';
        link += (slug.trim() != '') ? `/${slug}` : '';
        link += (id.toString().trim() != '') ? '-' + id : '';
        return link;
    }

    static getUrlWithNewParams(params, originalUrl) {
        let urlObj = _url.parse(originalUrl);
        let _params = new URLSearchParams(urlObj.query);
        for (let key in params) {
            _params.set(key, params[key]);
        }
        if (_params.toString().trim() == '') return urlObj.pathname;
        return urlObj.pathname + '?' + _params.toString();
    }

    static ucfirst(string) {
        if (string) {
            return string.substr(0, 1).toUpperCase() + string.slice(1);
        }
    }

    // SOLVE URL PARAMS
    static solveUrlParams(data, controller) {
        let urlParams = {
            select_filter: {},
            filter: {},
            search: {},
            sort: {},
        };
        for (let key in data.req.query) {
            // filter
            urlParams = this.solveFilterParams(data.req.query, urlParams, key, controller);

            // search
            urlParams = this.solveSearchParams(data.req.query, urlParams, key, controller);

            // sort
            urlParams = this.solveSortParams(data.req.query, urlParams, key, controller);
        }
        data.params.urlParams = urlParams;
        data.params = this.standardizeUrlParams(data.params);
        return data.params;
    }

    // solveParams: filter
    static solveFilterParams(query, params, key, controller) {
        let filterList = conf.template_config.filter[controller];
        if (key.includes('_filter')) {
            let field = key.replace('_filter', '').trim();
            // button filter
            if (!field.includes('_select')) {
                if (filterList.includes(field)) {
                    let value = (conf.template.format_button[field].hasOwnProperty(query[key])) ? query[key].trim() : 'all';
                    params.filter[field] = value;
                }
                // select filter
            } else {
                field = field.replace('_select', '');
                if (conf.template_config.select_filter[controller].includes(field)) params.select_filter[field] = query[key];
            }
        }
        return params;
    }

    // solveParams: search
    static solveSearchParams(query, params, key, controller) {
        if (key === 'search_field') {
            let field = query[key].trim();
            if (conf.template_config.search[controller].indexOf(field) > -1) {
                params.search.field = field;
            }
        }
        if (key == 'search_value') {
            let value = query[key].trim();
            params.search.value = value;
        }
        return params;
    }

    // solveParams: sort
    static solveSortParams(query, params, key) {
        if (key == 'sort_field') {
            let field = query[key].trim();
            params.sort.field = field;
        }
        if (key == 'sort_value') {
            let value = query[key].trim();
            params.sort.value = value;
        }
        return params;
    }

    // solveParams: pagination
    static solvePaginationParams(query, params) {
        // pageRange
        params.pagination.pageRange = (params.pagination.pageRange % 2 == 0) ? params.pagination.pageRange - 1 : params.pagination.pageRange;

        // total page
        params.pagination.totalPage = Math.ceil(params.pagination.totalItems / params.pagination.itemsPerPage);

        // current page
        let page = query.page || 1;
        page = (page < 1) ? page = 1 : page;
        if (!isNaN(page)) {
            page = (page > params.pagination.totalPage && params.pagination.totalPage > 0) ? params.pagination.totalPage : page;
            params.urlParams.page = parseInt(page);
        }
        return params;
    }

    // solveParams: standardize
    static standardizeUrlParams(params) {
        if (params.urlParams.search.value) {
            if (!params.urlParams.search.field) delete params.urlParams.search.value;
        }
        return params;
    }

    // get body param
    static getBodyParam(obj, field, defaultValue = ':') {
        return (obj.hasOwnProperty(field)) ? obj[field] : defaultValue;
    }

    // append link with id if exist
    static appendIdIfExist(link, id) {
        if (id) link += `/${id}`;
        return link;
    }

    // to object id
    static toObjectId(id) {
        return _mongoose.Types.ObjectId(id);
    }

    static slug(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
        // remove accents, swap ñ for n, etc
        var from = 'áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệoóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữự·/_,:;';
        var to = 'aaaaaaaaaaaaaaaaadeeeeeeeeeeeoooooooooooooooooouuuuuuuuuuu------';
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
        return str;
    }

    static getProperty(object, property, defaultVal = '') {
        if (object[property]) return object[property];
        else if (typeof object == 'object' && Object.keys(object).length > 0) {
            let keys = property.split('.');
            for (let value of keys) {
                object = object[value];
                if (object == undefined) break;
            }
            if (object) return object;
            else if (defaultVal) return defaultVal;
            return undefined;
        }
    }

    static cvertHtmlToText(html) {
        let enterWord = '</p>';
        const striptags = require('striptags');
        const Entities = require('html-entities').Html5Entities;
        const entities = new Entities();
        return this.removeMultiSpace(entities.decode(striptags(html.replace(new RegExp(enterWord, 'g'), ' '))));
    }

    static removeMultiSpace(string) {
        return string.replace(/\s{2,}/g, ' ').trim();
    }

    // data{id, name, countData}
    static showNameWithCount(data) {
        let name = data.name;
        for (let item of data.countData) {
            if (data.id == item._id) name += ` (${item.count})`;
        }
        return name;
    }

    static limitString(string, limit) {
        if (string.length > limit) return string.substr(0, limit - 3) + '...';
        return string;
    }

    static matchRegex(string, pattern) {
        try {
            string = string.trim().match(pattern)[0];
        } catch (e) { string = false; }
        return string;
    }

    static computePercent(num, total) {
        if (total > 0 && num > 0) return ((num / total) * 100).toFixed(2);
    }

    static md5(string) {
        const md5 = require('md5');
        return md5(string);
    }

    static flashResult(type = '', message = '', link = '#') {
        return {
            type: type,
            message: message,
            link: link,
        }
    }

    static setDefaultCookieMaxAge(req) {
        req.session.cookie.maxAge = conf.cookie.default_max_age;
    }

    static extendCookieMaxAgeForRememberMeLogin(req) {
        req.session.cookie.maxAge = conf.cookie.remember_me_login_max_age;
    }

    static createCode(username) {
        return this.md5(username + `-${Date.now()}`);
    }

    static standardizeLink(link) {
        let _template = require(__path.helper + '/template');
        return _template.standardizeLink(link);
    }

    static getRelationship(data) {
        let relationship;
        let relationshipData = {
            friend_list: 'friend',
            request_to: 'sent-invite',
            request_from: 'receive-invite',
        }
        for (let key in data.friends) {
            if (data.friends[key].includes(data.userId)) {
                relationship = key;
                break;
            }
        }
        return relationshipData[relationship] || 'stranger';
    }

    static getChatType(type) {
        if (type[0] == 'p') return 'private';
        if (type[0] == 'g') return 'group';
        if (type[0] == 'r') return 'room';
        return 'unknow';
    }

    static getReceiver(conversation, loggedUserId) {
        let result = { name: '', thumb: [] };
        let receiverIds = [];
        let gI = 1;
        for (let item of conversation.members) {
            if (!item._id.equals(loggedUserId)) receiverIds.push(item._id);
            if (conversation.type[0] == 'p' && !item._id.equals(loggedUserId)) {
                result = this.getReceiverParamsFromUserData(item);
            } else if (conversation.type[0] == 'g' && !item._id.equals(loggedUserId)) {
                if (gI <= 2) {
                    if (!result._id) result._id = conversation._id;
                    result.thumb.push(item.thumb);
                    result.name += `${item.username}, `;
                }
                gI++;
            }
        }
        if (['g', 'r'].includes(conversation.type[0])) result.name += '...';
        result.ids = receiverIds;
        result.convid = conversation._id;
        return result;
    }

    static getReceiverParamsFromUserData(data) {
        let obj = {
            _id: data._id,
            name: data.username,
            thumb: [data.thumb],
        }
        return obj;
    }

    static parseJson(data) {
        let result;
        try {
            result = JSON.parse(data);
        } catch (e) { result = data; }
        return result;
    }

    static getNewSmConvData(receiver, isNewConv = false) {
        let item;
        if (receiver) item = receiver;
        else {
            item = {
                _id: 0,
                name: '<span class="font-weight-normal" >New message</span>',
                thumb: ['sample.png'],
            }
        }
        if (isNewConv) {
            item.name = '<span class="font-weight-normal" >New message to</span> ' + item.name;
        }
        item.msgType = 'custom';
        return item;
    }

    static getConvTypeByMemberLength(length, type = 'short') {
        let result = (length <= 2) ? 'private' : 'group';
        if (type == 'short') return result[0];
        return result;
    }

    static getIdsOfItems(items) {
        let ids = [];
        for (let item of items) {
            ids.push(item._id);
        }
        return ids;

    }

    static getCollections(){
        let collections = require(__path.config+'/database').collection;
        let result = {};
        for (let key in collections){
            if (['chat', 'room', 'conversation'].includes(key)){
                if (!result.conversation) result.conversation = 'conversations';
            }else result[key] = collections[key];
        }
        return result;
    }
}
module.exports = Helper;
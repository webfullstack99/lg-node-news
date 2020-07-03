const controller = 'article';
let option      = {
    title: {minLength: 2, maxLength: 300},
    content: {minLength: 10, maxLength: 50000},
    ordering: {min: 5, max: 100, step: 5},
}

let util        = require('util');

let { body }    = require('express-validator'); 
let mongodb     = require('mongodb');
let extend = require('node.extend');

const _upload      = require(__path.helper+'/upload'); 
const _helper      = require(__path.helper+'/helper'); 
const _model       = require(__path.model+`/${controller}`); 

let error       = conf.template.form_errors;

let check = {
    title: async (req) => {
        await body('title')
            .isLength({min: option.title.minLength, max: option.title.maxLength})
            .withMessage(util.format(error.text_length, option.title.minLength, option.title.maxLength))
            .bail()
            //unique
            .custom( async (value, {req}) => {
                let query;
                if (req.params.id) query   = {_id: {$ne: req.params.id}, title: value};
                else query   = {title: value};
                let item    = await _model.getItem({query: query}, {task: 'by-query'})
                if (!item) return Promise.resolve();
                return Promise.reject();
            })
            .withMessage(error.unique).run(req);
    },
    contenthtml: async (req) => {
        await body('content.html')
            .custom((value) => {
                let text = _helper.cvertHtmlToText(value);
                if (text.length < option.content.minLength || text.length > option.content.maxLength) return Promise.reject();
                return Promise.resolve();
            })
            .withMessage(util.format(error.text_length, option.content.minLength, option.content.maxLength)).run(req);
    },
    categoryid: async (req) => {
        await body('category.id')
            .custom( async (value) => {
                if (mongodb.ObjectId.isValid(value)){
                    let _categoryModel = require(__path.model+'/category');
                    let item = await _categoryModel.getItem({id: value}, {task: 'by-id'});
                    if (item) return Promise.resolve();
                }
                return Promise.reject();
            }).run(req);
    },
    type: async (req) => {
        await body('type').custom((value, {path}) => {
            let list  = conf.template[path+'_select'];
            return list.includes(value);
        }).run(req);
    },
    status: async (req) => {
        await body('status').custom((value, {req}) => {
                let statusList = conf.template.status_select;
                return statusList.includes(value);
            }).run(req);
    },
    ordering: async (req) => {
        await body('ordering')
            .isNumeric()
            .bail()
            .isInt({min: option.ordering.min, max: option.ordering.max})
            .withMessage(util.format(error.number_value, option.ordering.min, option.ordering.max))
            .bail()
            .custom((value) => {
                if (value % option.ordering.step != 0) return Promise.reject();
                return Promise.resolve();
            }).run(req);
    },
    thumb: async (req) => {
        let message = error.required;
        await body('thumb')
            .if((value) => {
                if (!req.file && req.body.oldThumb) return false;
                return true;
            })
            .bail()
            .custom(() => {
                if (!req.file) return Promise.reject();
                let uploadData = extend(true, req.file, {
                    base64: req.body.base64,
                });
                let err = _upload.check(uploadData);
                if (err.length < 1) return Promise.resolve();
                message = err[0];
                return Promise.reject();
            })
            .withMessage(() => {
                return message;
            })
            .run(req);
    },
}
let runValidate = async function (fields, req){
    for (let field of fields){
        let functionName = field.replace(/\./g, '');
        if (check.hasOwnProperty(functionName))
            await check[functionName](req);
    }
}
module.exports = async (formType, req) => {
    let fields = [];
    switch (formType){
        case 'insert':
        case 'edit':
            fields  = ['title', 'slug', 'content.html', 'category.id', 'type', 'status', 'ordering', 'thumb'];
            break;
    }
    await runValidate(fields, req);
    if (!req.file && req.body.oldThumb) delete fields[fields.indexOf('thumb')];
    return fields;
}
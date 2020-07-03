const controller = 'room';
let option      = {
    name: {minLength: 2, maxLength: 300},
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
    name: async (req) => {
        await body('name')
            .isLength({min: option.name.minLength, max: option.name.maxLength})
            .withMessage(util.format(error.text_length, option.name.minLength, option.name.maxLength))
            .bail()
            //unique
            .custom( async (value, {req}) => {
                let query;
                if (req.params.id) query   = {_id: {$ne: req.params.id}, name: value};
                else query   = {name: value};
                let item    = await _model.getItem({query: query}, {task: 'by-query'})
                if (!item) return Promise.resolve();
                return Promise.reject();
            })
            .withMessage(error.unique).run(req);
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
            fields  = ['name', 'thumb', 'status', 'ordering'];
            break;
    }
    await runValidate(fields, req);
    if (!req.file && req.body.oldThumb) delete fields[fields.indexOf('thumb')];
    return fields;
}
const controller = 'article';
let option      = {
    wishNumber: {min: 1, max: 999},
    ordering: {min: 5, max: 100, step: 5},
}

let util        = require('util');

let { body }    = require('express-validator'); 
let mongodb     = require('mongodb');
let extend = require('node.extend');

const _helper      = require(__path.helper+'/helper'); 
const _model       = require(__path.model+`/${controller}`); 

let error       = conf.template.form_errors;

let check = {
    catLink: async (req) => {
        await body('catLink')
            .isURL()
            .run(req);
    },
    wishNumber: async (req) => {
        await body('wishNumber')
            .isNumeric()
            .bail()
            .isInt({min: option.wishNumber.min, max: option.wishNumber.max})
            .run(req);
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
}
let runValidate = async function (fields, req){
    for (let field of fields){
        let functionName = field.replace(/\./g, '');
        if (check.hasOwnProperty(functionName))
            await check[functionName](req);
    }
}
module.exports = async (formType, req) => {
    let fields  = ['catLink', 'wishNumber', 'category.id', 'type', 'status', 'ordering'];
    await runValidate(fields, req);
    return fields;
}
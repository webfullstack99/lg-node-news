const controller = 'item';
let option      = {
    name: {minLength: 2, maxLength: 100},
    ordering: {min: 5, max: 100, step: 5},
}

let util        = require('util');

let { body }    = require('express-validator'); 

const _model      = require(__path.model+`/${controller}`); 

let error       = conf.template.form_errors;
module.exports  = [
    body('name')
        .isLength({min: option.name.minLength, max: option.name.maxLength})
        .withMessage(util.format(conf.template.form_errors.text_length, option.name.minLength, option.name.maxLength))
        .bail()
        //unique
        .custom( async (value, {req}) => {
            let query   = {name: value};
            if (req.params.id) query._id = {$ne: req.params.id};
            let item    = await _model.getItem({query: query}, {task: 'by-query'})
            if (!item) return Promise.resolve();
            return Promise.reject();
        })
        .withMessage(error.unique),
    body('status').custom((value, {req}) => {
            let statusList  = conf.template.status_select;
            return statusList.includes(value);
        }),
    body('ordering')
        .isNumeric()
        .bail()
        .isInt({min: option.ordering.min, max: option.ordering.max})
        .withMessage(util.format(conf.template.form_errors.number_value, option.ordering.min, option.ordering.max))
        .bail()
        .custom((value) => {
            if (value % option.ordering.step != 0) return Promise.reject();
            return Promise.resolve();
        })
]
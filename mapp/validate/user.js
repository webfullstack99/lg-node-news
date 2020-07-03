const controller = 'user';
let option = {
    username: { minLength: 2, maxLength: 16 },
    fullname: { minLength: 5, maxLength: 50 },
    password: { minLength: 8, maxLength: 16 },
    ordering: { min: 5, max: 100, step: 5 },
}

let util = require('util');

let { body } = require('express-validator');
let mongodb = require('mongodb');
let extend = require('node.extend');

const _upload = require(__path.helper + '/upload');
const _model = require(__path.model + `/${controller}`);

let error = conf.template.form_errors;

let check = {
    username: async(req) => {
        await body('username')
            // check space
            .custom((value) => {
                if (value.match(/\s/)) return Promise.reject();
                else return Promise.resolve();
            })
            .withMessage(error.contain_space)
            .bail()
            .isLength({ min: option.username.minLength, max: option.username.maxLength })
            .withMessage(util.format(error.text_length, option.username.minLength, option.username.maxLength))
            .bail()
            //unique
            .custom(async(value, { req }) => {
                let query;
                if (req.params.id) query = { _id: { $ne: req.params.id }, username: value };
                else query = { username: value };
                let item = await _model.getItem({ query: query }, { task: 'by-query' })
                if (!item) return Promise.resolve();
                return Promise.reject();
            })
            .withMessage(error.unique).run(req);
    },
    fullname: async(req) => {
        await body('fullname')
            .isLength({ min: option.fullname.minLength, max: option.fullname.maxLength })
            .withMessage(util.format(error.text_length, option.fullname.minLength, option.fullname.maxLength)).run(req);
    },
    email: async(req) => {
        await body('email')
            .isEmail()
            .bail()
            //unique
            .custom(async(value, { req }) => {
                let query = { email: value };;
                if (req.params.id) query._id = { $ne: req.params.id };
                let item = await _model.getItem({ query: query }, { task: 'by-query' })
                if (!item) return Promise.resolve();
                return Promise.reject();
            })
            .withMessage(error.unique).run(req);
    },
    password: async(req) => {
        await body('password')
            //.if((value, {req}) => {
            //if (value.trim() != '' || req.body._id.trim() == '') return true; 
            //return false;
            //})
            //// check password
            //.not().isEmpty()
            //.bail()
            .custom((value, { req }) => {
                if (value.match(/^(?=.*\d)(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,16}$/)) return Promise.resolve();
                return Promise.reject();
            })
            .withMessage(util.format(error.password, option.password.minLength, option.password.maxLength))
            .bail()
            // confirm
            .custom((value, { req }) => {
                if (value == req.body.password_confirmed) return Promise.resolve();
                else return Promise.reject();
            })
            .withMessage(error.password_confirmed).run(req);
    },
    groupid: async(req) => {
        await body('group.id')
            .custom(async(value) => {
                if (mongodb.ObjectId.isValid(value)) {
                    let _groupModel = require(__path.model + '/group');
                    let item = await _groupModel.getItem({ id: value }, { task: 'by-id' });
                    if (item) return Promise.resolve();
                }
                return Promise.reject();
            }).run(req);
    },
    status: async(req) => {
        await body('status').custom((value, { req }) => {
            let statusList = conf.template.status_select;
            return statusList.includes(value);
        }).run(req);
    },
    ordering: async(req) => {
        await body('ordering')
            .isNumeric()
            .bail()
            .isInt({ min: option.ordering.min, max: option.ordering.max })
            .withMessage(util.format(error.number_value, option.ordering.min, option.ordering.max))
            .bail()
            .custom((value) => {
                if (value % option.ordering.step != 0) return Promise.reject();
                return Promise.resolve();
            }).run(req);
    },
    thumb: async(req) => {
        let message = error.required;
        await body('thumb')
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
let runValidate = async function(fields, req) {
    for (let field of fields) {
        await check[field.replace(/\./g, '')](req);
    }
}
module.exports = async(formType, req) => {
    let fields = [];
    switch (formType) {
        case 'insert':
            fields = ['username', 'fullname', 'email', 'password', 'group.id', 'status', 'ordering', 'thumb'];
            break;
        case 'info_edit':
            fields = ['username', 'fullname', 'email', 'status', 'ordering'];
            if (req.file) fields.push('thumb');
            break;
        case 'password_edit':
            fields = ['password'];
            break;
        case 'group_edit':
            fields = ['group.id'];
            break;
    }
    await runValidate(fields, req);
    return fields;
}
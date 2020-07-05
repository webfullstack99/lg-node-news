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
    username: async (req) => {
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
            .custom(async (value, { req }) => {
                let query;
                if (req.params.id) query = { _id: { $ne: req.params.id }, username: value };
                else query = { username: value };
                let item = await _model.getItem({ query: query }, { task: 'by-query' })
                if (!item) return Promise.resolve();
                return Promise.reject();
            })
            .withMessage(error.unique).run(req);
    },
    email: async (req) => {
        await body('email')
            .isEmail()
            .run(req);
    },
    password_confirmed: async (req) => {
        await body('password_confirmed')
            .custom((value, { req }) => {
                if (req.body.password == value) return Promise.resolve();
                else return Promise.reject();
            })
            .withMessage(error.password_confirmed).run(req);
    },
    password: async (req) => {
        await body('password')
            .custom((value, { req }) => {
                if (value.match(/^(?=.*\d)(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,16}$/)) return Promise.resolve();
                return Promise.reject();
            })
            .withMessage(util.format(error.password, option.password.minLength, option.password.maxLength))
            .run(req);
    },
}
let runValidate = async function (fields, req) {
    for (let field of fields) {
        await check[field.replace(/\./g, '')](req);
    }
}
module.exports = async (formType, req, loginBy = null) => {
    let fields = [];
    switch (formType) {
        case 'update-pass':
            fields = ['password', 'password_confirmed'];
            await runValidate(fields, req);
            break;
        case 'forgot-pass':
            fields = ['email'];
            await runValidate(fields, req);
            break;
        case 'register':
            fields = ['username', 'password'];
            // validate email
            await body('email')
                .isEmail()
                .bail()
                //unique
                .custom(async (value, { req }) => {
                    let query = { email: value };;
                    let item = await _model.getItem({ query: query }, { task: 'by-query' })
                    if (!item) return Promise.resolve();
                    return Promise.reject();
                })
                .withMessage(error.unique).run(req);
            await runValidate(fields, req);
            break;
        case 'login':
            fields = ['password'];
            if (loginBy != null) fields.push(loginBy);
            else fields.push('username');

            for (let field of fields) {
                await body(field)
                    .notEmpty()
                    .run(req);
            }
            break;
    }
    return fields;
}
const express = require('express');
const router  = express.Router();
const util        = require('util');

const md5 = require('md5');
const multer = require('multer');
const extend = require('node.extend');

const controller = 'room';
var upload = multer({limits: {fieldSize: conf.upload.image.fileSize.max}})
const viewFolder  = 'admin/pages/'+controller;
const { validationResult } = require('express-validator');
let params = { pagination: displayConf.backend.pagination[controller], }
const _upload    = require(__path.helper+'/upload'); 
const _helper      = require(__path.helper+'/helper');
const _form        = require(__path.helper+'/form');
const _validate    = require(__path.validate+`/${controller}`);
const _model       = require(__path.model+`/${controller}`);

// INDEX
router.get('/', async function (req, res, next) {
    params  = _helper.solveUrlParams({req: req, params: params}, controller);
    params.pagination.totalItems    = await _model.countAll(params);
    params  = _helper.solvePaginationParams(req.query, params);
    params.urlParams.originalUrl    = req.originalUrl;
    res.render(viewFolder+'/index', {
        pageTitle: "List Page", 
        items: await _model.listItems(params, {task: 'list-all'}),
        filterData: {button: await _model.getCountArrays(params)},
        controller, params, require,
    });  
});

// CHANGE STATUS
router.get('/status/:type(active|inactive)/:id([a-z0-9]+)', async (req, res, next) => {
    let result  = await _model.saveItem({type: req.params.type, id: req.params.id, user: req.user}, {task: 'change-status'});
    res.json(result);
});

// CHANGE ORDERING
router.get('/ordering/:type(\\d+)/:id([a-z0-9]+)', async (req, res, next) => {
    let result  = await _model.saveItem({type: req.params.type, id: req.params.id, user: req.user}, {task: 'change-ordering'});
    res.json(result);
});

// CHANGE CATEGORY
router.get('/category/:type([\\w\\W]+)/:id([a-z0-9]+)', async (req, res, next) => {
    let result  = await _model.saveItem({type: req.params.type, id: req.params.id, user: req.user}, {task: 'change-category'});
    res.json(result);
});

// CHANGE TYPE
router.get('/type/:type(\\w+)/:id([a-z0-9]+)', async (req, res, next) => {
    let result  = await _model.saveItem({type: req.params.type, id: req.params.id, user: req.user}, {task: 'change-type'});
    res.json(result);
});

// DELETE
router.get('/delete/:id([a-z0-9]+)', async (req, res, next) => {
    let result          = await _model.saveItem({id: req.params.id, controller: controller}, {task: 'delete-by-id'});
    res.json(result);
});

// FORM
router.get('/form/:id(\\w+)?', async (req, res, next) => {
    let formType    = (req.params.id) ? 'edit' : 'insert';
    let item        = {};
    if (formType == 'edit') item = await _model.getItem({id: req.params.id}, {task: 'by-id'});
    // category select data
    let _categoryModel = require(__path.model+'/category');
    let categoryInfo = await _categoryModel.listItems({fields: ['_id', 'name', 'status']}, {task: 'list-width-fields'});
    let categorySelectData = _form.cvertToSelectData(categoryInfo, 'category'); 
    res.render(viewFolder+'/form', {
        formType: formType,
        pageTitle: "Form Page", 
        controller: controller,
        require: require,
        item: item,
        categoryInfo: categoryInfo,
        categorySelectData: categorySelectData,
        controller: controller,
    });
});


// SAVE
router.post('/save/:id(\\w+)?', upload.single('thumb'), async (req, res) => {
    let formType    = (req.params.id) ? 'edit' : 'insert';
    let validatedFields = await _validate(formType, req);
    let errors  = validationResult(req);

    // validate error
    if (!errors.isEmpty()){
        let item = {};
        if (formType == 'insert') item = req.body;
        else item = await _model.getItem({id: req.body._id}, {task: 'by-id'})
        res.render(viewFolder+'/form', {
            formType: formType,
            pageTitle: "Form Page", 
            controller: controller,
            require: require,
            item: item,
            errors: errors.array(),
        });
    // validate success
    }else{
        let item = {};
        for (let field of validatedFields){
            if (field == 'thumb'){
                let uploadData = extend(true, req.file, {
                    base64: req.body.base64,
                });
                let thumbName = _upload.save(uploadData, controller, {filenameLength: conf.upload.image.filenameLength, resize: {width: 500, height: 400}});
                item.thumb = thumbName;
                // case edit
                if (formType == 'edit') _upload.remove(req.body.oldThumb, controller);
            }else item[field] = req.body[field];
        }
        let result;
        if (formType == 'insert') result = await _model.saveItem({user: req.user, item: item, formType: formType}, {task: 'insert-item'});
        else if (formType == 'edit') result = await _model.saveItem({user: req.user, item: item, formType: formType, id: req.params.id}, {task: 'update-item'});
        req.flash('notify', {type: result.type, message: result.message});
        res.redirect(result.link);
    }
});

// SAVE MULTI
router.post('/savemulti/:type(delete|status)/:value(\\w+)?', async (req, res, next) => {
    let type    = req.params.type;
    if (req.body){
        let rowsAffected;
        if (type == 'status'){
            rowsAffected  = await _model.saveItem(
                {query: {_id: {$in: req.body.id}}, option: {$set: {status: req.params.value}}},
                {task: 'update-many'},
            );
        }else if (type == 'delete'){
            rowsAffected  = await _model.saveItem(
                {query: {_id: {$in: req.body.id}}, ids: req.body.id, controller: controller},
                {task: 'delete-many'},
            );
        }
        let message;
        if (type != 'delete') message = util.format(conf.template.message.change_multi, rowsAffected);
        else message = util.format(conf.template.message.delete_multi, rowsAffected);
        req.flash('notify', {type: 'custom', message: message});
        res.redirect(req.body.link);
    }
});
module.exports = router;
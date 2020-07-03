const express = require('express');
const router  = express.Router();
const util        = require('util');

const controller = 'group';
const viewFolder  = 'admin/pages/'+controller;
const { validationResult } = require('express-validator');
let params = { pagination: displayConf.backend.pagination[controller], }
const _helper      = require(__path.helper+'/helper');
const _validate   = require(__path.validate+`/${controller}.js`);
const _model      = require(__path.model+`/${controller}`);


// INDEX
router.get('/', async function (req, res, next) {
    let _userModel = require(__path.model+'/user');

    // params
    params  = _helper.solveUrlParams({req: req, params: params}, controller);
    params.pagination.totalItems    = await _model.countAll(params);
    params  = _helper.solvePaginationParams(req.query, params);
    params.urlParams.originalUrl    = req.originalUrl;
    let filterData = {};
    filterData.button = await _model.getCountArrays(params);   
    res.render(viewFolder+'/index', {
        pageTitle: "List Page",
        items: await _model.listItems(params, {task: 'list-all'}),
        userCountData: await _userModel.count(_userModel._model, 'group.id'),
        controller, filterData, params, require,
    });  
});

// CHANGE STATUS
router.get('/status/:type(active|inactive)/:id([a-z0-9]+)', async (req, res, next) => {
    let result  = await _model.saveItem({type: req.params.type, id: req.params.id, user: req.user}, {task: 'change-status'});
    res.json(result);
});

// CHANGE GROUP ACP
router.get('/groupAcp/:type(yes|no)/:id([a-z0-9]+)', async (req, res, next) => {
    let result  = await _model.saveItem({type: req.params.type, id: req.params.id, user: req.user}, {task: 'change-groupAcp'});
    res.json(result);
});
    
// CHANGE ORDERING
router.get('/ordering/:type(\\d+)/:id([a-z0-9]+)', async (req, res, next) => {
    let result  = await _model.saveItem({type: req.params.type, id: req.params.id, user: req.user}, {task: 'change-ordering'});
    res.json(result);
});

// DELETE
router.get('/delete/:id([a-z0-9]+)', async (req, res, next) => {
    let result          = await _model.saveItem({id: req.params.id}, {task: 'delete-by-id'});
    res.json(result);
});

// FORM
router.get('/form/:id(\\w+)?', async (req, res, next) => {
    let formType    = (req.params.id) ? 'edit' : 'insert';
    let item        = {};
    if (formType == 'edit') item = await _model.getItem({id: req.params.id}, {task: 'by-id'});
    res.render(viewFolder+'/form', {
        formType: formType,
        pageTitle: "Form Page", 
        controller: controller,
        require: require,
        item: item,
    });
});

// SAVE
router.post('/save/:id(\\w+)?', _validate, async (req, res) => {
    // insert
    let formType    = (req.params.id) ? 'edit' : 'insert';
    let errors  = validationResult(req);
    
    // validate error
    if (!errors.isEmpty()){
        let item    = req.body;
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
        let item    = {
            name: req.body.name,
            groupAcp: req.body.groupAcp,
            status: req.body.status,
            ordering: req.body.ordering,
        }
        let result;
        if (formType == 'insert'){
            result = await _model.saveItem({user: req.user, item: item, formType: formType}, {task: 'insert-item'});
        }else if (formType == 'edit'){
            result = await _model.saveItem({user: req.user, item: item, formType: formType, id: req.params.id}, {task: 'update-item'});
        }
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
                {query: {_id: {$in: req.body.id}}},
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
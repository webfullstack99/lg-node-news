const express = require('express');
const router = express.Router();

const controller = 'get-data';
const viewFolder = 'admin/pages/' + controller;

const _adminModel = require(__path.model + `/adminModel`);

// INDEX
router.get('/', async function (req, res, next) {
    res.render(viewFolder + '/index', { pageTitle: "Get Json Data Page", controller });
});

router.post('/', async function (req, res, next) {
    let jsonData = await _adminModel.getCollectionJsonData(req.body.collection)
    if (jsonData)
        res.json(jsonData);
    else res.render(viewFolder + '/index', { pageTitle: "Get Json Data Page", controller });
});

module.exports = router;
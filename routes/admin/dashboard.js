const express = require('express');
const router = express.Router();

const controller    = "dashboard";
const viewFolder    = 'admin/pages/dashboard';

/* GET item listing. */
router.get('/', function (req, res, next) {
    res.render(viewFolder+'/index', {pageTitle: "Dashboard Page", controller: controller});
});

router.get('/no-permission', function (req, res, next) {
    res.render(viewFolder+'/no_permission', {pageTitle: "No permission", controller: controller});
});

module.exports = router;
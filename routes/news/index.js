var express = require('express');
var router = express.Router();

// middlewares
let userInfo = require(__path.middleware+'/logged_user_info');
let catsMenu = require(__path.middleware_frontend+'/news/catsMenu');
let latestArticles = require(__path.middleware_frontend+'/news/latestArticles');
let middlewares = [userInfo, catsMenu, latestArticles];

router.use('/', middlewares, require('./home'));
router.use('/category', require('./category'));
router.use('/article', require('./article'));
router.use('/notify', require('./notify'));
router.use('/contact', require('./contact'));
router.use('/about', require('./about'));


module.exports = router;
var express = require('express');
var router = express.Router();

// middlewares
const ensureAuthenticated = require(__path.middleware+'/ensure_authenticated');
let userInfo = require(__path.middleware+'/logged_user_info');

router.use('/', ensureAuthenticated, userInfo, require('./dashboard'));
router.use('/item', require('./item'));
router.use('/category', require('./category'));
router.use('/article', require('./article'));
router.use('/group', require('./group'));
router.use('/user', require('./user'));
router.use('/room', require('./room'));
router.use('/get-data', require('./get-data'));
module.exports = router;
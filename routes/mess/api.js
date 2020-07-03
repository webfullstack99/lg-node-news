const express = require('express');
const router = express.Router();
const _userModel = require(__path.model+'/user');

// FRIEND - ADD
router.get('/friend-add', async function (req, res, next) {
    let result = await _userModel.saveItem({userId: req.query.userId, friendUserId: req.query.friendUserId}, {task: 'friend-add'});
    res.json(result);
});

// FRIEND - ACCEPT
router.get('/friend-accept', async function (req, res, next) {
    let result = await _userModel.saveItem({userId: req.query.userId, friendUserId: req.query.friendUserId}, {task: 'friend-accept'});
    res.json(result);
});

// FRIEND - DENY
router.get('/friend-deny', async function (req, res, next) {
    let result = await _userModel.saveItem({userId: req.query.userId, friendUserId: req.query.friendUserId}, {task: 'friend-deny'});
    res.json(result);
});

// FRIEND - CANCEL REQUEST
router.get('/friend-cancel-request', async function (req, res, next) {
    let result = await _userModel.saveItem({userId: req.query.userId, friendUserId: req.query.friendUserId}, {task: 'friend-cancel-request'});
    res.json(result);
});

// FRIEND - UNFRIEND
router.get('/friend-unfriend', async function (req, res, next) {
    let result = await _userModel.saveItem({userId: req.query.userId, friendUserId: req.query.friendUserId}, {task: 'friend-unfriend'});
    res.json(result);
});

module.exports = router;
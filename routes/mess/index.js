module.exports = function (io){
    const express = require('express');
    const router = express.Router();

    const _socketio = require(__path.helper_socketio+'/server_socketio');
    _socketio.io = io; _socketio.prefix = displayConf.prefix.socketio.server;

    // middlewares
    let ensureAuthenticated = require(__path.middleware+'/ensure_authenticated');
    let userInfo = require(__path.middleware+'/logged_user_info');
    let friendRequests = require(__path.middleware_frontend+'/mess/friendRequests');
    let recentConvs = require(__path.middleware_frontend+'/mess/recentConversations');
    let middlewares = [userInfo, ensureAuthenticated, friendRequests, recentConvs];

    // routes
    router.use('/', middlewares, require('./home')(io));
    router.use('/room', require('./room')(io));
    router.use('/rooms', require('./rooms')(io));
    router.use('/friends', require('./friends')(io));
    router.use('/friend-invitations', require('./friend_invitations')(io));
    router.use('/messages', require('./messages')(io));
    router.use('/api', require('./api'));

    // socket
    io.on('connection', function(socket){
        _socketio.run(socket);
    })
    return router;

};
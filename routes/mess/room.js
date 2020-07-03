module.exports = function (io){
    const express = require('express');
    const router = express.Router();

    const controller = 'room';
    const  prfSocketio = displayConf.prefix.socketio.room;
    const viewFolder = __path.views_mess+'/pages/'+controller;
    const _helper = require(__path.helper+'/helper');
    const _conversationModel = require(__path.model+'/conversation');
    const _roomModel = require(__path.model+'/room');
    const _userModel = require(__path.model+'/user');
    const _socketio = Object.assign({}, require(__path.helper_socketio+'/room_socketio'));
    _socketio.io = io; _socketio.prefix = prfSocketio; _socketio.type = 'room';

    // INDEX
    router.get('/:id([a-zA-Z0-9]+)', async function (req, res, next) {
        res.render(viewFolder+'/index', {
            prfSocketio,
            msgs: await _conversationModel.listItems({name: req.params.id}, {task: 'list-msgs-by-conversation-name'}),
            room: await _roomModel.getItem({id: req.params.id}, {task: 'get-frontend-item-by-id'}),
            layout: __path.views_mess+'/main',
        });
    });

    // SOCKET IO
    io.on( "connection", async function( socket ) { 
        _socketio.run(socket);
    });

    return router;
}
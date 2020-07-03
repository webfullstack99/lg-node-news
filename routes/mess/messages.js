module.exports = function (io){
    const express = require('express');
    const router = express.Router();

    const controller = 'messages';
    const  prfSocketio = 'MESSAGES_';
    const viewFolder = __path.views_mess+'/pages/'+controller;
    const _helper = require(__path.helper+'/helper');
    const _conversationModel = require(__path.model+'/conversation');
    const _socketio = Object.assign({}, require(__path.helper_socketio+'/room_socketio'));
    _socketio.io = io; _socketio.prefix = prfSocketio;
    const _newConvSocketio = Object.assign({}, require(__path.helper_socketio+'/new_conv_socketio'));
    _newConvSocketio.io = io; _newConvSocketio.prefix = prfSocketio;
    
    // INDEX
    router.get('/:type(p|g|r)/:id([a-zA-Z0-9]+)?', async function (req, res, next) {
        _socketio.type = req.params.type;
        let currentConversation= await _conversationModel.getItem({myId: req.user.id, type: req.params.type, id: req.params.id}, {task: 'get-item-by-type-and-id', note: 'create-if-not-exists'});

        res.render(viewFolder+'/index', {
            prfSocketio, controller, currentConversation,
            get friend(){
                return _helper.getReceiver(currentConversation, req.user.id);
            },
            layout: __path.views_mess+'/main',
        });
    });

    // NEW
    router.get('/new', async function (req, res, next) {
        _socketio.type = req.params.type;

        res.render(viewFolder+'/index', {
            prfSocketio, controller, friend: {}, currentConversation: {},
            isNewMsgOnTop: true,
            layout: __path.views_mess+'/main',
        });
    });

    // SOCKET IO
    io.on( "connection", async function( socket ) { 
        _socketio.run(socket);
        _newConvSocketio.run(socket);
    });



    return router;
}
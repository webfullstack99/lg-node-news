module.exports = function (io){
    const express = require('express');
    const router = express.Router();

    const controller = 'rooms';
    const viewFolder = __path.views_mess+'/pages/'+controller;
    const _helper = require(__path.helper+'/helper');
    const _roomModel = require(__path.model+'/room');
    const _userModel = require(__path.model+'/user');

    // INDEX
    router.get('/', async function (req, res, next) {
        res.render(viewFolder+'/index', {
            controller,
            //msgs: await _chatModel.listItems({room: req.params.id}, {task: 'list-in-room'}),
            //room: await _roomModel.getItem({id: req.params.id}, {task: 'get-frontend-item-by-id'}),
            layout: __path.views_mess+'/main',
        });
    });

    // SOCKET IO
    io.on( "connection", async function( socket ) { 
    });

    return router;
}
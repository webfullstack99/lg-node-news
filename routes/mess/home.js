module.exports = function (io){
    const express = require('express');
    const router = express.Router();

    const controller = 'home';
    const viewFolder = __path.views_mess+'/pages/'+controller;
    const _helper = require(__path.helper+'/helper');
    const _conversationModel = require(__path.model+'/conversation');
    const _roomModel = require(__path.model+'/room')
    const _userModel = require(__path.model+'/user');

    // INDEX
    router.get('/', async function (req, res, next) {
        res.render(viewFolder+'/index', {
            controller,
            msgs: await _conversationModel.listItems({name: 'home'}, {task: 'list-msgs-by-conversation-name'}),
            rooms: await _roomModel.listFrontendItems({}, {task: 'list-all-for-home'}),
            layout: __path.views_mess+'/main',
        });
    });

    // DELETE ALL MSGS
    router.get('/delete-all-msgs', async function (req, res, next) {
        await _conversationModel._model.deleteMany({});
        res.redirect(`${displayConf.prefix.mess}`);
    });

    // SOCKET IO
    io.on( "connection", async function( socket ) { 
    });

    return router;
}
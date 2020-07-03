module.exports = function (io){
    const express = require('express');
    const router = express.Router();

    const controller = 'friends';
    const viewFolder = __path.views_mess+'/pages/'+controller;
    const _helper = require(__path.helper+'/helper');
    const _roomModel = require(__path.model+'/room');
    const _userModel = require(__path.model+'/user');

    // INDEX
    router.get('/', async function (req, res, next) {
        let friendsObj = _helper.getProperty(req.user, 'friends', {});
        let notStrangerArr = [].concat(friendsObj.friend_list).concat(friendsObj.request_to).concat(friendsObj.request_from);
        notStrangerArr.push(req.user.id);
        let friendSuggestions = await _userModel.listItems({ids: notStrangerArr}, {task: 'list-strangers'});

        res.render(viewFolder+'/index', {
            controller, friendSuggestions,
            friends: await _userModel.listItems({ids: friendsObj.friend_list}, {task: 'list-friends'}),
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
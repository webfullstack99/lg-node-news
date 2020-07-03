module.exports = function (io){
    const express = require('express');
    const router = express.Router();

    const controller = 'friend-invitations';
    const viewFolder = __path.views_mess+'/pages/'+controller;
    const _helper = require(__path.helper+'/helper');
    const _roomModel = require(__path.model+'/room');
    const _userModel = require(__path.model+'/user');

    // INDEX
    router.get('/:type(sent)?', async function (req, res, next) {
        let invitationType = req.params.type || 'receive';
        let friendsObj = _helper.getProperty(req.user, 'friends', {});
        let notStrangerArr = [].concat(friendsObj.friend_list).concat(friendsObj.request_to).concat(friendsObj.request_from);
        notStrangerArr.push(req.user.id);
        let friendSuggestions = await _userModel.listItems({ids: notStrangerArr}, {task: 'list-strangers'});

        let friendRequests;
        if (invitationType == 'receive') friendRequests = await _userModel.listItems({ids: _helper.getProperty(req.user, 'friends.request_from')}, {task: 'list-friends'});
        else friendRequests = await _userModel.listItems({ids: _helper.getProperty(req.user, 'friends.request_to')}, {task: 'list-friends'});
        res.render(viewFolder+'/index', {
            controller, friendSuggestions, friendRequests, invitationType,
            layout: __path.views_mess+'/main',
        });
    });

    // SOCKET IO
    io.on( "connection", async function( socket ) { 
    });

    return router;
}
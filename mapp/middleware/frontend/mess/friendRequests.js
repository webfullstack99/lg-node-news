module.exports = async (req, res, next) => {
    const _helper = require(__path.helper+'/helper');
    const _mess = require(__path.routes_mess+'/mess');
    res.locals.friendRequests = await _mess.getFriendRequests(_helper.getProperty(req.user, 'friends.request_from'));
    return next();
}
module.exports = async (req, res, next) => {
    const _helper = require(__path.helper+'/helper');
    const _mess = require(__path.routes_mess+'/mess');
    res.locals.recentConversations = await _mess.getRecentConvs(req.user.id)
    return next();
}
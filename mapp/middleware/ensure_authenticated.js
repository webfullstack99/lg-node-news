const _helper = require(__path.helper+'/helper');
let loginForms = {
    [displayConf.prefix.admin]: `${displayConf.prefix.auth}/admin/login`,
    [displayConf.prefix.mess]: `${displayConf.prefix.auth}/messenger/login`,
}

module.exports = function (req, res, next){
    let type = _helper.matchRegex(req.baseUrl, /^\/\w*(?=\/)?/);
    if (conf.authentication){
        if (!req.isAuthenticated()) return res.redirect(loginForms[type]);
        if (type == '/admin') if (req.user.group.groupAcp == 'no') return res.redirect(loginForms[type]);
    }
    return next();
}
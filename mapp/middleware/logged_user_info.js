module.exports = (req, res, next) => {
    let user = req.user;
    if (!conf.authentication) if (!user) user = {};
    res.locals.user = user;
    return next();
}
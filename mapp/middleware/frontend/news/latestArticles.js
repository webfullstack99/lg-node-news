module.exports = async (req, res, next) => {
    const news = require(__path.routes_frontend+'/news');
    res.locals.latestArticles = await news.getLatestArticles();
    return next();
}
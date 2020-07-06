const createError = require('http-errors');
module.exports = function (app) {

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(async function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        if (conf.evn == 'dev') res.render('error/dev_error');
        if (conf.evn == 'publish') {
            const news = require(__path.routes_frontend + '/news');
            res.render('error/publish_error', {
                catsMenu: await news.getCatsMenu(),
                latestArticles: await news.getLatestArticles(),
                layout: __path.views_news + '/main',
            });
        }
    });
}
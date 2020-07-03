const express = require('express');
const router = express.Router();
const util = require('util');

const controller = 'article';
const viewFolder = 'news/pages/'+controller;
const news = require('./news');

// INDEX
router.get('/:slug([\\w-]+)\-:id([a-z0-9]+)', async function (req, res, next) {
    res.render(viewFolder+'/index', {
        mainArticle: await news.getArticleByArticleId(req.params.id),
        relevantArticles: await news.listRelevantArticlesByArticleId(req.params.id),
        layout: __path.views_news+'/main',
    });
});

module.exports = router;
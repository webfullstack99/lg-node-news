const express = require('express');
const router = express.Router();
const util = require('util');

const controller = 'notify';
const viewFolder = 'news/pages/'+controller;
const news = require('./news');

// INDEX
router.get('/:type([\\w\-]+)', async function (req, res, next) {
    res.render(viewFolder+'/index', {
        type: req.params.type,
        catsMenu: await news.getCatsMenu(),
        latestArticles: await news.getLatestArticles(),
        user: req.user,
        layout: __path.views_news+'/main',
        hasTopPosts: false,
    });
});

module.exports = router;
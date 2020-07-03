const express = require('express');
const router = express.Router();

const controller = 'home';
const viewFolder = 'news/pages/'+controller;
const news = require('./news');

// INDEX
router.get('/', async function (req, res, next) {
    res.render(viewFolder+'/index', {
        catsInHome: await news.getCatsInHome(),
        featuredArticles: await news.getFeaturedArticles(),
        layout: __path.views_news+'/main',
        hasTopPosts: true,
    });
});

module.exports = router;
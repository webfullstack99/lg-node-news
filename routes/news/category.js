const express = require('express');
const router = express.Router();
const util = require('util');

const controller = 'category';
const viewFolder = 'news/pages/'+controller;
const news = require('./news');

// INDEX
router.get('/:slug([\\w-]+)\-:id([a-z0-9]+)', async function (req, res, next) {
    res.render(viewFolder+'/index', {
        articlesInCat: await news.getArticlesByCatId({catId: req.params.id, limit: displayConf.frontend.catPage.maxPost}),
        layout: __path.views_news+'/main',
        hasTopPosts: false,
    });
});

// LOAD MORE
router.get('/load_more', async function (req, res, next) {
    let moreFlag = true;
    let catPageParams = displayConf.frontend.catPage;
    let limit = Number.parseInt(catPageParams.maxAddPostByAjax);
    let skip = Number.parseInt(req.query.skip);
    let total = skip + limit;
    if (total >= catPageParams.max_total_post){
        limit = catPageParams.max_total_post - skip;
        moreFlag = false;
    } 

    let items = await news.getArticlesByCatId({catId: req.query.catId, skip: skip, limit: limit+1});
    if (items.length > 0){
        let outOfPost = (items.length < (limit + 1) || !moreFlag) ? true : false;
        if (items.length == (limit + 1)) items.pop();
        res.render(viewFolder+'/more_post', {articles: items, layout: false, outOfPost: outOfPost});
        res.write('');
    }else res.json('false');
});

module.exports = router;
const express = require('express');
const router = express.Router();

const controller = 'contact';
const viewFolder = 'news/pages/'+controller;

// INDEX
router.get('/', async function (req, res, next) {
    res.render(viewFolder+'/index', {
        hasTopPosts: false,
        layout: __path.views_news+'/main',
    });
});

module.exports = router;
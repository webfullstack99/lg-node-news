const _helper = require(__path.helper+'/helper');
const _categoryModel = require(__path.model+'/category');
const _articleModel = require(__path.model+'/article');

module.exports = {
    listRelevantArticlesByArticleId: async function (articleId){
        let result = await _articleModel.listFrontendItems({articleId: articleId}, {task: 'list-relevant-articles-by-articleId'})
        return result;
    },

    getArticleByArticleId: async function (articleId){
        let result = await _articleModel.listFrontendItems({articleId: articleId}, {task: 'list-article-by-articleId'})
        return result;
    },

    getArticlesByCatId: async function (data){
        let result = await _articleModel.listFrontendItems({catId: data.catId, skip: data.skip || 0, limit: data.limit || 10}, {task: 'list-articles-by-catId'})
        return result;
    },

    getCatsInHome: async function (){
        let result = await _categoryModel.listFrontendItems({}, {task: 'list-cats-in-home'})
        return result;
    },

    getLatestArticles: async function (){
        let result = await _articleModel.listFrontendItems({}, {task: 'list-latest-items'})
        return result;
    },

    getFeaturedArticles: async function (){
        let result = await _articleModel.listFrontendItems({}, {task: 'list-featured-items'})
        return result;
    },

    getCatsMenu: async function (){
        let result = await _categoryModel.listFrontendItems(null, {task: 'list-cats-menu'});
        return result;
    }
}
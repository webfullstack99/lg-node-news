const controller = 'article';

var mongoose    = require('mongoose');

var databaseConfig = require(__path.config+'/database');

let collectionName = databaseConfig.collection[controller];

var schema  = new mongoose.Schema({
    title: String,
    slug: String,
    content: {
        html: String,
        text: String,
    },
    category: {
        id: { type: mongoose.Schema.ObjectId},
        name: String,
        status: String,
    },
    type: String,
    status: String,
    ordering: Number,
    thumb: String,
    created: {
        userId: Number,
        username: String,
        time: Date,
    },
    modified: {
        userId: Number,
        username: String,
        time: Date,
    }
});
schema.index({'content.text': 'text'})
var model   = mongoose.model(collectionName, schema);
module.exports  = model;
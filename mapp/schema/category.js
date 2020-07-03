const controller = 'category';
var mongoose    = require('mongoose');

var databaseConfig = require(__path.config+'/database');

let collectionName = databaseConfig.collection[controller];

var schema  = new mongoose.Schema({
    name: String,
    slug: String,
    status: String,
    is_home: String,
    ordering: Number,
    display: String,
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


var model    = mongoose.model(collectionName, schema);
module.exports  = model;
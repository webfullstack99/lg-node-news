const controller = 'group';
var mongoose    = require('mongoose');

var databaseConfig = require(__path.config+'/database');

let collectionName = databaseConfig.collection[controller];

var schema  = new mongoose.Schema({
    name: String,
    status: String,
    ordering: Number,
    groupAcp: String,
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
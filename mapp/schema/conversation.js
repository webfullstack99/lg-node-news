const controller = 'conversation';

var mongoose    = require('mongoose');

var databaseConfig = require(__path.config+'/database');

let collectionName = databaseConfig.collection[controller];

var schema  = new mongoose.Schema({
    type: String, // private | group | room
    name: String, // optional
    members: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user}],
    messages: [
        {
            user: { type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user},
            content: String,
            seen: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user}], // yes / no
            created: Date,
        }
    ],
    created: Date,
    modified: Date,
});

var model    = mongoose.model(collectionName, schema);
module.exports  = model;
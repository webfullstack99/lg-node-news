const controller = 'user';

var mongoose    = require('mongoose');

var databaseConfig = require(__path.config+'/database');

let collectionName = databaseConfig.collection[controller];

var schema  = new mongoose.Schema({
    username: String,
    email: String,
    fullname: String,
    password: String,
    group: {
        id: { type: mongoose.Schema.ObjectId},
        name: String,
        status: String,
    },
    friends: { 
        friend_list: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user}],
        request_to: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user}],
        request_from: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user}],
    },
    rooms: {
        room_list: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.room}],
        //request_to: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user}],
        //request_from: [{ type: mongoose.Schema.ObjectId, ref: databaseConfig.collection.user}],
    },
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
    },
    code: {
        activation: String,
        update_pass: String,
        
    }
});


var model    = mongoose.model(collectionName, schema);
module.exports  = model;
const mongoose = require('mongoose');
const util = require('util');

const databaseConfig = require(__path.config + '/database');
mongoose.connect(util.format(databaseConfig.uri, databaseConfig.username, databaseConfig.password, databaseConfig.database_name), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).catch((e) => {
    console.log('Fail to connect database');
});
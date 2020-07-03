const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const util = require('util');

const passport = require('passport');
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const socket_io = require("socket.io");
const sharedsession = require("express-socket.io-session");


// set global variable
global.__path = require(__dirname + '/mapp/path');
global.conf = require(__path.config + '/mainConfig');
global.displayConf = require(__path.helper + '/display');

const databaseConfig = require(__path.config + '/database');

mongoose.connect(util.format(databaseConfig.uri, databaseConfig.username, databaseConfig.password, databaseConfig.database_name), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).catch((e) => {
    console.log('Fail to connect database');
});

var app = express();

// socket io
var io = socket_io();
app.io = io;


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

let hour = 60 * 60 * 1000
    // session
let mySession = session({
    resave: false,
    saveUninitialized: false,
    secret: 'keyboard cat',
    cookie: { maxAge: conf.cookie.default_max_age },
})
app.use(mySession);
app.io.use(sharedsession(mySession, { autoSave: true }));

app.use(passport.initialize());
app.use(passport.session());

// session notification
app.use(flash());
app.use((req, res, next) => { res.locals.flash = req.flash();
    res.locals.require = require; return next(); });

// validator
const { check, validationResult } = require('express-validator');

// view engine setup
app.set('views', path.join(__path.views));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'admin/main');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// router
app.use(`${displayConf.prefix.admin}`, require(__path.routes_backend + '/index'));
app.use(`${displayConf.prefix.news}`, require(__path.routes_frontend + '/index'));
app.use(`${displayConf.prefix.auth}`, require(__path.routes_auth + '/index'));
app.use(`${displayConf.prefix.mess}`, require(__path.routes_mess + '/index')(io));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(async function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    if (conf.evn == 'dev') res.render('error/dev_error');
    if (conf.evn == 'publish') {
        const news = require(__path.routes_frontend + '/news');
        res.render('error/publish_error', {
            catsMenu: await news.getCatsMenu(),
            latestArticles: await news.getLatestArticles(),
            layout: __path.views_news + '/main',
        });
    }
});

module.exports = app;
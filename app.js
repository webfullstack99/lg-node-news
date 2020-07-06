const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const passport = require('passport');
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const socket_io = require("socket.io");
const sharedSession = require("express-socket.io-session");


// set global variable
global.__path = require(__dirname + '/mapp/path');
global.conf = require(__path.config + '/mainConfig');
global.displayConf = require(__path.helper + '/display');

var app = express();

// passport-google-oauth2
require(`${__path.libs}/passport-google-oauth2`);

// socket io
var io = socket_io();
app.io = io;

// database
require(`${__path.libs}/database`);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// session
let mySession = session({
    resave: false,
    saveUninitialized: false,
    secret: 'keyboard cat',
    cookie: { maxAge: conf.cookie.default_max_age },
})
app.use(mySession);
app.io.use(sharedSession(mySession, { autoSave: true }));

app.use(passport.initialize());
app.use(passport.session());

// session notification
app.use(flash());
app.use((req, res, next) => {
    res.locals.flash = req.flash();
    res.locals.require = require; return next();
});

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

// routes
app.use(`${displayConf.prefix.admin}`, require(__path.routes_backend + '/index'));
app.use(`${displayConf.prefix.news}`, require(__path.routes_frontend + '/index'));
app.use(`${displayConf.prefix.auth}`, require(__path.routes_auth + '/index'));
app.use(`${displayConf.prefix.mess}`, require(__path.routes_mess + '/index')(io));

// database
require(`${__path.libs}/handle-error`)(app);

module.exports = app;
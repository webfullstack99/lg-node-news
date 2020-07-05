const LocalStrategy = require('passport-local').Strategy;

const _helper = require(__path.helper + '/helper');
const _userModel = require(__path.model + '/user')

module.exports = function (passport) {
    // CHECK CREADENTIAL
    let checkCredential = function (user, type, done) {
        if (!user) { return done(null, false, { message: 'User does not exists' }); }
        if (type == 'admin' && user.group.groupAcp != 'yes') return done(null, false, { message: 'No permission to access' });
        return done(null, user);
    }

    passport.use('adminLogin', new LocalStrategy(async function (username, password, done) {
        let user = await _userModel.getItem({ username: username, password: _helper.md5(password) }, { task: 'get-profile' });
        return checkCredential(user, 'admin', done);
    }));

    passport.use('messengerLogin', new LocalStrategy(async function (username, password, done) {
        let user = await _userModel.getItem({ username: username, password: _helper.md5(password) }, { task: 'get-profile' });
        return checkCredential(user, 'news', done);
    }));

    passport.use('newsLogin', new LocalStrategy(async function (username, password, done) {
        let user = await _userModel.getItem({ username: username, password: _helper.md5(password) }, { task: 'get-profile' });
        return checkCredential(user, 'news', done);
    }));

    passport.use('adminLoginByEmail', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async function (username, password, done) {
        let user = await _userModel.getItem({ email: username, password: _helper.md5(password) }, { task: 'get-profile' });
        return checkCredential(user, 'admin', done);
    }));

    passport.use('messengerLoginByEmail', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async function (username, password, done) {
        let user = await _userModel.getItem({ email: username, password: _helper.md5(password) }, { task: 'get-profile' });
        return checkCredential(user, 'news', done);
    }));

    passport.use('newsLoginByEmail', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async function (username, password, done) {
        let user = await _userModel.getItem({ email: username, password: _helper.md5(password) }, { task: 'get-profile' });
        return checkCredential(user, 'news', done);
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let user = await _userModel.getItem({ query: { _id: _helper.toObjectId(id) } }, { task: 'get-profile-by-query' });
        done(null, user);
    });
}
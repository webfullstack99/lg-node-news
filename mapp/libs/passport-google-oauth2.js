const userModel = require(`${__path.model}/user`);

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

//passport.serializeUser(function (user, done) {
    //done(null, user.googleId);
//});

//passport.deserializeUser(async function (id, done) {
    //let item = await userModel.getItem({ googleId: id }, { task: 'get-by-google-id' });
    //console.log(item);
    //done(null, item);
//});

passport.use(new GoogleStrategy({
    clientID: '803959963328-174t6vqsqt0786ihqiidl9d1uaouan1n.apps.googleusercontent.com',
    clientSecret: '_MYQ5MTbEY1Ek2d6G792bL56',
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        let item = await userModel.findOrCreateItemGoogleLogin(profile);
        return done(null, item);
    }
));
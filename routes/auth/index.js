const express = require('express');
const router = express.Router();

const passport = require('passport');

const controller = 'auth';
const { validationResult } = require('express-validator');
const _js = require(__path.helper + '/js');
const _helper = require(__path.helper + '/helper');
const _validate = require(__path.validate + '/auth');
const _userModel = require(__path.model + '/user')
const mail = require(__path.helper + '/mail');
const passportConfig = require(__path.config + '/passport');
const news = require(__path.routes_frontend + '/news');

// DATA FOR BEHAVE
let data = {
    admin: {
        pageTitle: 'Admin login',
        successRedirect: `${displayConf.prefix.admin}`,
        failureRedirect: `${displayConf.prefix.auth}/admin/login`,
        layout: __path.views_auth + '/backend/main',
        login_form: `${__path.views_auth}/backend/login`,
    },
    news: {
        successRedirect: `${displayConf.prefix.news}`,
        failureRedirect: `${displayConf.prefix.auth}/login`,
        layout: __path.views_news + '/main',
        login_form: `${__path.views_auth}/frontend/login`,
    },
    messenger: {
        pageTitle: 'Messenger login',
        successRedirect: `${displayConf.prefix.mess}`,
        failureRedirect: `${displayConf.prefix.auth}/messenger/login`,
        layout: __path.views_auth + '/mess/main',
        login_form: `${__path.views_auth}/mess/login`,
    },
}

// NEWS BASIC PARAMS
let newsBasicParams = async () => {
    let params = {
        catsMenu: await news.getCatsMenu(),
        latestArticles: await news.getLatestArticles(),
        controller: controller,
        layout: data.news.layout,
    }
    return params;
}

// LOGIN BEHAVE
let loginBehave = async (req, res, optionalData = null) => {
    let type = req.params.type || 'news';
    let currentData = data[type];
    let params = {};
    if (['admin', 'messenger'].includes(type)) {
        params = { pageTitle: currentData.pageTitle, controller: controller, layout: currentData.layout, };
    } else if (type == 'news') {
        params = await newsBasicParams();
    }
    if (optionalData) params = _js.objMerge(params, optionalData);
    return res.render(currentData.login_form, params);
}

// REGISTER
router.get('/register', async function (req, res, next) {
    res.render(__path.views_auth + `/frontend/register`, await newsBasicParams());
});

// POST REGISTER
router.post('/register', async function (req, res, next) {
    await _validate('register', req);
    let errors = validationResult(req);

    // validate error
    if (!errors.isEmpty()) { return res.render(__path.views_auth + `/frontend/register`, _js.objMerge(await newsBasicParams(), { item: req.body, errors: errors.array() })); }

    //validate success 
    let activationCode = _helper.createCode(req.body.username);
    let item = {
        username: req.body.username,
        password: _helper.md5(req.body.password),
        email: req.body.email,
        'code.activation': activationCode,
    }

    // save item
    let result = await _userModel.saveItem({ item: item, formType: 'register', user: { username: 'user-register' } }, { task: 'save-register' });
    if (result) {
        // send mail
        mail.sendActivationUserMail({ email: req.body.email, activationCode: activationCode, pureUrl: _helper.getPureUrl(req) });
        return res.redirect(_helper.standardizeLink(`${displayConf.prefix.news}/notify/register-success`));
    } return res.redirect(_helper.standardizeLink(`${displayConf.prefix.news}/notify/register-fail`));
});

// GET LOGIN
router.get('/:type(admin|messenger)?/login', function (req, res, next) {
    let type = req.params.type || 'news'; let currentData = data[type];

    // passport
    passport.authenticate(type + 'Login', async function (err, user, info) {
        if (err) { return next(err); }

        // not logged in
        if (!req.user) { return loginBehave(req, res, { item: {} }); }

        // logged in
        req.logIn(req.user, function (err) {
            if (err) { return next(err); }
            if (type == 'admin') {

                // have permission
                if (req.user.group.groupAcp == 'yes') res.redirect(`${displayConf.prefix.admin}`);

                // no permission
                req.logOut();
                req.flash('error', 'No permission to access');
                res.redirect(currentData.failureRedirect);
            } else { res.redirect(currentData.successRedirect); }
        });
    })(req, res, next);
});

// POST LOGIN
router.post('/:type(admin|messenger)?/login', async function (req, res, next) {
    let type = req.params.type || 'news';
    let loginBy = req.body.loginBy;
    let getPassportName = (loginArea, loginBy) => {
        let append = (loginBy == 'email') ? `By${_helper.ucfirst(loginBy)}` : '';
        return `${loginArea}Login${append}`;
    }
    let currentData = data[type];
    await _validate('login', req, loginBy);
    let errors = validationResult(req);
    if (!errors.isEmpty()) { return loginBehave(req, res, { item: req.body, errors: errors.array() }) }
    passport.authenticate(getPassportName(type, loginBy), {
        get successRedirect() {
            if (req.body.rememberMe == 'on') _helper.extendCookieMaxAgeForRememberMeLogin(req);
            return currentData.successRedirect;
        },
        failureRedirect: currentData.failureRedirect,
        failureFlash: true,
    })(req, res, next);
});

// LOGOUT
router.get('/:type(admin|messenger)?/logout', function (req, res, next) {
    let type = req.params.type;
    req.logOut();
    _helper.setDefaultCookieMaxAge(req);
    if (['admin', 'messenger'].includes(type)) res.redirect(data[type].failureRedirect);
    res.redirect(`${displayConf.prefix.news}`);
});

// =========================== OTHER FEATURE =================== 
// SEND UPDATE PASS EMAIL
router.post('/:type(admin|messenger)?/send-update-pass-email', async function (req, res, next) {
    await _validate('forgot-pass', req);
    let errors = validationResult(req);

    // validate fail
    if (!errors.isEmpty()) return res.render(__path.views_admin + '/template/show-form-errors', { errors: errors.array(), layout: false });

    // validate success
    // email not exist
    let user = await _userModel.getItem({ query: { email: req.body.email } }, { task: 'by-query' })
    if (!user) return res.render(__path.views_admin + '/template/show-form-errors', { errors: [{ param: 'email', msg: 'does not exist' }], layout: false });

    // email exist
    let updatePassCode = _helper.createCode(user.username);
    user.code.update_pass = updatePassCode;
    await user.save();
    mail.sendUpdatePassMail({ email: req.body.email, code: updatePassCode, pureUrl: _helper.getPureUrl(req) });
    return res.send('success');
})

// UPDATE NEW USER PASSWORD
router.get('/update-new-pass/:code(\\w+)', async function (req, res, next) {
    let code = req.params.code;
    let user = await _userModel._model.findOne({ 'code.update_pass': code });
    if (user) { res.render(__path.views_auth + `/frontend/update_pass`, _js.objMerge(await newsBasicParams(), { updatePassCode: req.params.code })); }
    return res.redirect(`${displayConf.prefix.news}`);
})

// POST UPDATE NEW USER PASSWORD
router.post('/update-new-pass/:code(\\w+)', async function (req, res, next) {
    await _validate('update-pass', req);
    let errors = validationResult(req);

    // validate error
    if (!errors.isEmpty()) { return res.render(__path.views_auth + `/frontend/update_pass`, _js.objMerge(await newsBasicParams(), { errors: errors.array(), updatePassCode: req.params.code })); }

    // validate success
    let user = await _userModel._model.findOne({ 'code.update_pass': req.params.code });

    //user not exist
    if (!user) return res.redirect(_helper.standardizeLink(`${displayConf.prefix.news}/notify/update-pass-fail`));

    // user exist
    user.code.update_pass = _helper.createCode(user.username);
    user.password = _helper.md5(req.body.password); await user.save();
    return res.redirect(_helper.standardizeLink(`${displayConf.prefix.news}/notify/update-pass-success`));
})

// ACTIVATE USER
router.get('/activate/:code([\\w\-]+)', async function (req, res, next) {
    let code = req.params.code;
    let user = await _userModel._model.findOne({ 'code.activation': code });
    if (user)
        if (!['block', 'active'].includes(user.status)) {
            user.status = 'active';
            await user.save();
            return res.redirect(_helper.standardizeLink(`${displayConf.prefix.news}/notify/activate-success`));
        }
    return res.redirect(`${displayConf.prefix.news}`);
})

// google-oauth2
router.get('/google',
    passport.authenticate('google', {
        scope:
            ['https://www.googleapis.com/auth/plus.login',
                , 'https://www.googleapis.com/auth/plus.profile.emails.read'
            ]
    }
    ));

router.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/google/failure'
    }));

router.get('/google/success', (req, res) =>{
    res.send('auth success');
})

router.get('/google/failure', (req, res) =>{
    res.send('auth fail');
})

router.get('/google/logout', (req, res) =>{
    req.logout();
    res.redirect('/');
})

// CONFIG PASSPORT
passportConfig(passport);
module.exports = router;
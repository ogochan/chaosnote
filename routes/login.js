const express = require('express');
const passport = require('passport');
const Local = require('passport-local').Strategy;
const Session = require('../modules/session');

passport.use(new Local(
	{
		usernameField: 'user_name',
		passwordField: 'password',
		passReqToCallback: true,
		session: true,
	}, (req, user_name, password, done) => {
		process.nextTick(() => {
			let result = true;
			if ( result ) {
				return done(null, {
					user_name: user_name
				});
			} else {
				//console.log('login error');
				return done(null, false, {
					message: 'fail'
				});
			}
		});
	}));

passport.serializeUser((user, done) => {
	//console.log('serialize:', user);
	return done(null, user.user_name);
});

passport.deserializeUser((user, done) => {
	return done(null, user);
});

/* GET users listing. */
function get(req, res, next) {
	res.render('login', { title: 'Login',
						  version_hash: '0.0',
						  contents_js_source: '',
						  nbjs_translations: '',
						  path: req.params.name,
						});
}

function login(req, res, next) {
	//console.log(req.body.user_name);
	//console.log(req.body.password);

	passport.authenticate('local', (error, user, info) => {
		if (error) {
			return next(error);
		}
		if ( !user ) {
			console.log('user not found');
			res.redirect('/login');
		}
		req.login(user, (error, user) => {
			if (error) {
				return next(error);
			} else {
				console.log('user found');
				res.redirect('/tree');
			}
		});
	})(req, res, next);
}

function logout(req, res, next) {
	//console.log('logout', req.user);
	req.logout();
	req.session = null;
	res.redirect('/login');
}

module.exports = {
	get: get,
	login: login,
	logout: logout
};

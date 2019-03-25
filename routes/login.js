const express = require('express');
const passport = require('passport');
const Local = require('passport-local').Strategy;
const Session = require('../modules/session');
const {auth_user, User} = require('../modules/user');

passport.use(new Local(
	{
		usernameField: 'user_name',
		passwordField: 'password',
		passReqToCallback: true,
		session: true,
	}, (req, user_name, password, done) => {
		console.log('user_name', user_name);
		console.log('password', password);
		console.log('done', done);

		process.nextTick(() => {
			let result = auth_user(user_name, password);
			console.log("result:", result);
			if ( result ) {
				return done(null, {
					user_name: user_name
				});
			} else {
				console.log('login error');
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
	//console.log('deserialize:', user);
	return done(null, user);
});

/* GET users listing. */
function get(req, res, next) {
	res.render('login', { title: 'Login',
						  version_hash: '0.0',
						  contents_js_source: '',
						  nbjs_translations: '',
						  path: req.params.name,
						  msg_type: '',
						  message: '',
						});
}

function login(req, res, next) {
	//console.log(req.body.user_name);
	//console.log(req.body.password);

	passport.authenticate('local', (error, user, info) => {
		console.log('error', error);
		console.log('user', user);
		console.log('info', info);
		if (error) {
			return next(error);
		}
		if ( !user ) {
			console.log('user not found');
			res.render('login', { title: 'Login',
								  version_hash: '0.0',
								  msg_type: 'danger',
								  message: `user ${user.user_name} not found`
								});
		} else {
			req.login(user, (error, next) => {
				console.log(error);
				if (error) {
					console.log("error");
					res.render('login', { title: 'Login',
										  version_hash: '0.0',
										  msg_type: 'danger',
										  message: `user ${user.user_name} not found`
										});
				} else {
					res.redirect('/tree');
				}
			});
		}
	})(req, res, next);
}

function logout(req, res, next) {
	console.log('logout', req.user);
	req.logout();
	res.redirect('/login');
}

function signup_get(req, res, next) {
	res.render('signup', { title: 'Signup',
						  version_hash: '0.0',
						  contents_js_source: '',
						   nbjs_translations: '',
						   msg_type: '',
						   message: ''
						});
}

function signup_post(req, res, next) {
	console.log(req.body.user_name);
	console.log(req.body.password);

	user_name = req.body.user_name;
	password = req.body.password;
	if ( !User.check(user_name) ) {
		user = new User(user_name, {
			name: user_name
		})
		user.password = password;
		User.save();
		res.redirect('/login');
	} else {
		console.log('user duplicate', user_name);
		res.render('signup', { title: 'Signup',
							   version_hash: '0.0',
							   msg_type: 'danger',
							   message: `user ${user_name} duplicated`
							 });
	}
}

module.exports = {
	signup_get: signup_get,
	signup_post: signup_post,
	get: get,
	login: login,
	logout: logout
};

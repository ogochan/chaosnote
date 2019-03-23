const crypto = require('crypto');

function is_authenticated(req, res, next) {
	console.log(req.session);

	if ( req.isAuthenticated() ) {
		return (next());
	} else {
		res.redirect('/login');
	}
}

function auth_user(name, pass) {
	let user = users[name];

	if ( user ) {
		if ( user.password === pass ) {
			return (true);
		}
	}
	return (false);
}

let users;
class User {
	constructor (user_info) {
		if ( user_info ) {
			Object.keys(user_info).forEach((key) => {
				this[key] = user_info[key];
			});
		}
	}
	static init() {
		users = {};
		console.log('load users');
		try {
			let users_str = Fs.readFileSync(global.env.password_path);
			let env_load = JSON.parse(users_str);
			Object.keys(env_load).forEach((name) => {
				let user_info = env_load[name];
				console.log('user_info:', user_info);
				users[name] = new User(user_info);
			});
		}
		catch {
		};
	}

}

module.exports = {
	is_authenticated: is_authenticated,
	auth_user: auth_user,
	User: User,
};

const Fs = require('fs');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

function is_authenticated(req, res, next) {
	console.log(req.session);

	if ( req.isAuthenticated() ) {
		return (next());
	} else {
		res.redirect('/login');
	}
}

function auth_user(name, password) {
	let user = users[name];
	if ( user ) {
		return ( bcrypt.compareSync(password, user.hash_password) );
	}
	return (false);
}

let users;
class User {
	constructor (name, user_info) {
		if ( !user_info ) {
			user_info = {
				name: name
			}
		}
		Object.keys(user_info).forEach((key) => {
			this[key] = user_info[key];
		});
		users[name] = this;
	}
	static init() {
		users = {};
		console.log('load users');
		try {
			let users_str = Fs.readFileSync(global.env.password_path);
			let env_load = JSON.parse(users_str);
			env_load.forEach((user_info) => {
				console.log('user_info:', user_info);
				let user = new User(user_info.name,user_info);
			});
		}
		catch {
		};
	}
	static save() {
		let users_str = JSON.stringify(users);
		console.log(users_str);
		//try {
			Fs.writeFileSync(global.env.password_path, users_str);
		//}
		//catch {
		//}
	}
	set password(p) {
		this.hash_password = bcrypt.hashSync(p, SALT_ROUNDS);
	}
	get password() {
		return (this.hash_password);
	}
	static check(name) {
		return (users[name] ? true : false);
	}
}

module.exports = {
	is_authenticated: is_authenticated,
	auth_user: auth_user,
	User: User,
};
const new_id = require('../modules/id');
const Kernel = require('../modules/kernel');
const Fs = require('fs');
const Path = require('path');

let UserSessions = {};
let sessions;

class Session {
	constructor(user, path, type, name, kernel, id) {
		this.id = ( typeof id === 'undefined' ) ? new_id() : id;
		this.path = path;
		this.name = name;
		this.type = type;
		this.kernel = kernel;
		sessions[this.id] = this;
		if ( !UserSessions[user] ) {
			UserSessions[user] = {
				sessions: {}
			};
		}
		UserSessions[user].sessions[this.id] = this;
	}
	static user_sessions(user) {
		if ( !UserSessions[user] ) {
			UserSessions[user] = {
				sessions: {}
			};
		}
		return (UserSessions[user]);
	}
	static init() {
		sessions = {};
	}
	static load() {
		//console.log('load sessions');
		try {
			let env_str = Fs.readFileSync(global.env.save_env_path);
			let env = JSON.parse(env_str);
			//Kernel.load(env.kernels);
			Object.keys(env.sessions).forEach((key) => {
				let v = env.sessions[key];
				//console.log('load session:', v);
				let o = new Session(v.path, v.type, v.name, null, v.id);	// assign is needed
			});
		}
		catch {
			Kernel.load({});
		};
	}
	save() {
		if ( this.kernel ) {
			return ({
				id: this.id,
				path: this.path,
				name: this.name,
				type: this.type,
				kernel: this.kernel.id
			});
		} else {
			return ({
				id: this.id,
				path: this.path,
				name: this.name,
				type: this.type,
			});
		}
	}
	static save() {
		let save_sessions = {};
		Object.keys(sessions).forEach((key) => {
			save_sessions[key] = sessions[key].save();
		});
		let this_env = {
			sessions: save_sessions,
			kernels: Kernel.save()
		};
	
		let env_str = JSON.stringify(this_env);
		Fs.writeFileSync(global.env.save_env_path, env_str);
		//console.log("envs:", env_str);
	}
	static session(id) {
		return (sessions[id]);
	}
	static delete_(user, id) {
		let succ = false;
		let session = sessions[id];
		if ( session ) {
			session.kernel.dispose();
			delete sessions[id];
			succ = true;
			delete UserSessions[user].sessions[session_id];
		}
		return (succ);
	}
	kernel_info() {
		if ( this.kernel ) {
			return ({
				id: this.kernel.id,
				name: this.kernel.name,
				last_activity: "2018-10-17T10:43:30.981163Z",
				execute_status: this.kernel.status,
				connections: this.kernel.connections
			});
		} else {
			return (null);
		}
	}
	info() {
		return ({
			id: this.id,
			path: this.path,
			name: this.name,
			type: this.type,
			kernel: this.kernel_info(),
			notebook: {
				path: this.path,
				name: ""
			}});
	}
	static info_all(session) {
		//console.log(session);
		let infos = [];
		Object.keys(session.sessions).forEach((key) => {
			//console.log('key: ', key, sessions[key]);
			if ( sessions[key] ) {
				infos.push(sessions[key].info());
			}
		});
		return (infos);
	}
}
module.exports = Session;

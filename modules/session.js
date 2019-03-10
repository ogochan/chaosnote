const new_id = require('../modules/id');
const Kernel = require('../modules/kernel');

let sessions = {};

class Session {
	constructor(path, type, name, kernel_name) {
		this.id = new_id();
		this.path = path;
		this.name = name;
		this.type = type;
		this.kernel = new Kernel(kernel_name);
		sessions[this.id] = this;
	}
	static session(id) {
		return (sessions[id]);
	}
	static delete_(id) {
		let succ = false;
		let session = session.sessions[id];
		if ( session ) {
			session.kernel.dispose();
			delete sessions[id];
			succ = true;
		}
		return (succ);
	}
	kernel_info() {
		return ({
			id: this.kernel.id,
			name: this.kernel.name,
			last_activity: "2018-10-17T10:43:30.981163Z",
			execute_status: this.kernel.status,
			connections: this.kernel.connections
		});
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
		let infos = [];
		Object.keys(session.sessions).forEach((key) => {
			console.log('key: ', key);
			infos.push(sessions[key].info());
		});
		return (infos);
	}
}
module.exports = Session;

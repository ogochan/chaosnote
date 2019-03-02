const fs = require('fs');
const path = require('path');
const zmq = require('zeromq');
const crypto = require('crypto');
const net = require('net');
const co = require('co');
const child_process = require('child_process');
const spawn = child_process.spawn;
const new_id = require('../modules/id');

//console.log(global.env);

function aport (options) {
  options = options || {}
  let host = options.host || '127.0.0.1'

  return co(function * () {
    let server = net.createServer()
    let port = null
    server.on('listening', () => {
      port = server.address().port
      server.close()
    })

    return new Promise((resolve, reject) => {
      server.on('close', () => resolve(port))
      server.on('error', (err) => reject(err))
      server.listen(0, host)
    })
  })
}

function hash(key, string) {
    let hmac = crypto.createHmac('sha256', key);
    hmac.update(string);
    let res = hmac.digest('hex');
    return res;
}

async function alloc_port(base) {
	console.log("alloc_port");
	let port = null;

	if ( base > 0 ) {
		port = base;
	} else {
		port = await aport({host: global.env.host});
	}
	console.log(port);
	return(port);
}


function make_command_line(kernel_name, this_env) {
	let kernel = global.kernelspecs[kernel_name].spec;
	let argv = kernel.argv;
	let command = argv[0];
	let args = [];
	argv.slice(1).forEach((arg) => {
		console.log(arg);
		if ( match = arg.match(/\{.*\}/) ) {
			if ( match[0] == '{connection_file}' ) {
				args.push(this_env.connection_file);
			}
		} else {
			args.push(arg);
		}
	});
	opt = {
		cwd: this_env.home
	};
	return ({
		command: command,
		args: args,
		opt: opt
	});
}

async function make_ports() {
	let shell_port = await alloc_port(global.env.shell_port);
	let stdin_port = await alloc_port(global.env.stdin_port);
	let control_port = await alloc_port(global.env.control_port);
	let hb_port = await alloc_port(global.env.heartbeat_port);
	let iopub_port = await alloc_port(global.env.iopub_port);
	return ({
		shell_port: shell_port,
		stdin_port: stdin_port,
		control_port: control_port,
		hb_port: hb_port,
		iopub_port: iopub_port
	});
}

function create_connected_socket(port, type, identity = null) {
	console.log('create_connected_socket port = ', port);
	let socket = zmq.socket(type);
	socket.connect(`tcp://${global.env.host}:${port}`);
	socket.linger = 1000;
	if ( identity ) {
		socket.identity = identity;
	}
	return (socket);
}

async function  make_config(key, connection_file_name) {
	console.log("make_config");
	let ports = await make_ports();

	let config = ports;

	config.ip = "127.0.0.1";
	config.transport = "tcp";
	config.signature_scheme = 'hmac-sha256';
	config.key = key;

	console.log('config:', config);
	fs.writeFileSync(connection_file_name, JSON.stringify(config));
	return (ports);
}

function iopub_socket_on_message(ws, _ident, _delim, _hmac, _header, _last_header, _gap, _content){
	//console.log('message:');
	//console.log('ident: ',_ident.toString()),
	//console.log('_delim: ', _delim.toString()),
	//console.log('hmac: ', _hmac.toString()),
	//console.log('_header: ', _header.toString());
	//console.log('_last_header: ', _last_header.toString());
	//console.log('_gap: ', _gap.toString());
	//console.log('_content: ', _content.toString());
				
	let ident = _ident.toString();
	if ( _header ) {
		let header = JSON.parse(_header.toString());
		let last_header = JSON.parse(_last_header.toString());
		let content = JSON.parse(_content.toString());
		let hmac = _hmac.toString();
		
		console.log('type: ', header.msg_type);
		console.log(' content:', content);
		if ( header.msg_type === 'status' ) {
			console.log('STATUS:', content.execution_state);
		} else
		if ( header.msg_type === 'execute_input' ) {
			console.log('execution code: ', content.code);
		} else
		if ( header.msg_type === 'error' ) {
			if ( ws ) {
				ws.send(JSON.stringify({
					channel: 'iopub',
					header: header,
					parent_header: last_header,
					content: content
				}));
				ws.send(JSON.stringify({
					channel: 'shell',
					header: header,
					parent_header: last_header,
					metadata: {
						engine: this.id,
						status: "error"
					},
					content: content
				}));
			}
		} else
		if (( header.msg_type === 'stream' ) ||
			( header.msg_type === 'execute_result' )) {
			if ( ws ) {
				ws.send(JSON.stringify({
					channel: 'iopub',
					header: header,
					parent_header: ( last_header.msg_id ) ? last_header : this.last_header,
					content: content
				}));
			}
		}
	}
}

let kernels = {};
class Kernel {
	static kernel(id) {
		return (kernels[id]);
	}
	constructor(kernel_name) {
		let kernel_id = new_id();
		let connection_file_name = global.env.connection_dir + `/kernel-${kernel_id}.json`;

		this.name = kernel_name;

		this.id = kernel_id;
		this.connection_file_name = connection_file_name;
		this.command = make_command_line(kernel_name, {
			home: global.env.home,
			connection_file: connection_file_name});
		this.status = 'stop';
		this.headers = [];
		this.connections = 0;
		
		kernels[kernel_id] = this;
	}
	dispose() {
		delete kernels[this.kernel_id];
	}
	async start_channels(ports) {
		console.log('start_channels', ports);
		let iopub_socket = null;

		let shell_socket = await create_connected_socket(ports.shell_port, 'dealer');
		shell_socket.on('message', (msg) => {
			console.log('shell:', msg.toString());
		});
		let hb_socket = await create_connected_socket(ports.hb_port, 'req');
		hb_socket.on('message', (msg) => {
			console.log('hb:', msg.toString());
		});
		console.log('iopub_port', ports.iopub_port);
		if ( ports.iopub_port ) {
			iopub_socket = await create_connected_socket(ports.iopub_port, 'sub');
			console.log(iopub_socket);
			iopub_socket.subscribe('');
			iopub_socket.on('message', (_ident, _delim, _hmac, _header, _last_header, _gap, _content) => {
				iopub_socket_on_message(this.ws, _ident, _delim, _hmac, _header, _last_header, _gap, _content);
			});
		}
		return ({
			shell: shell_socket,
			iopub: iopub_socket,
			hb: hb_socket
		});
	}

	async _start(key) {
		this.key = key;
		console.log("_start");
		let ports = await make_config(key, this.connection_file_name);
		console.log("_start()*");
		let command = this.command;
		console.log('this.status:', this.status);
		console.log(`kernel ${this.id}(${this.name}) started`);
		let socket_ports = ports;
		console.log('control_ports = ', socket_ports.control_port);
		let control_socket = create_connected_socket(socket_ports.control_port, 'dealer');
		control_socket.on('message', (msg) => {
			console.log('control: ', msg.toString());
		});
		this.process = spawn(command.command, command.args, command.opt);
		this.process.stdout.on("data", (data) => {
			console.log("data: ");
			console.log(data.toString());
		});
		this.sockets = await this.start_channels(socket_ports);
		this.status = 'idle';
	}
	start(key) {
		console.log('this.status:', this.status);
		if ( this.status === 'stop' ) {
			return this._start(key);
		}
	}
	static _msg_header(msg_type) {
		return ({
			msg_id: new_id(),
			username: 'ogochan',
			session: new_id(), //session_id,
			date: Date.now().toString(),
			msg_type: msg_type,
			version: '5.0'
		});
	}
	static _msg(msg_type, content = {}, opts, key) {
		let msg_list = [
			JSON.stringify(opts.header ? opts.header : Kernel._msg_header(msg_type)),
			JSON.stringify(opts.parent_header),
			JSON.stringify(opts.metadata),
			JSON.stringify(content),
			opts.buffers
		];
		//console.log('key: ', key);
		let s = hash(key, msg_list.join(''));
		//console.log('hash: ', s);
		return([
			'stdin',
			'<IDS|MSG>',
			s].concat(msg_list));
	}
	execute(args, opts) {
		console.log("execute");
		if ( typeof opts === "undefined" ) {
			opts = {
				parent_header: {},
				header: null,
				metadata: {},
				buffers: ''
			};
			this.last_header = {};
		} else {
			this.last_header = opts.header;
		}
//		args = {
//			code: code,
//			silent: silent,
//			store_history: store_history,
//			user_expressions: user_expressions,
//			allow_stdin: allow_stdin,
//			stop_on_error: stop_on_error
//		};
		let msg = Kernel._msg('execute_request', args, opts, this.key);
		this.send("shell", msg);
		return (msg[3].msg_id);
	}
	send(name, content) {
		//console.log("socket:", name);
		//console.log(this.sockets);
		//console.log("content: ", content);
		let socket = this.sockets[name];
		socket.send(content);
	}
}

module.exports = Kernel;

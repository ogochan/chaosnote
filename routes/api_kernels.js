const Kernel = require('../modules/kernel');
const Session = require('../modules/session');

function channels(ws, req) {
	ws.on('message', _message => {
		//console.log('params: ', req.params);
		//console.log('Received -', _message);
		message = JSON.parse(_message);
		kernel = Kernel.kernel(req.params.id);
		//console.log('kernel: ', kernel);
		//console.log("session:", req.session);
		//console.log('header: ', message.header);
		if ( kernel ) {
			//console.log('msg_type: ', message.header.msg_type);
			kernel.execute(message.header.msg_type, message.channel, message.content, {
					parent_header: message.parent_header,
					header: message.header,
					parent_header: message.parent_header,
					metadata: message.metadata,
					buffers: message.buffers
			});
			kernel.ws = ws;
		}
	});

	ws.on('close', () => {
		//console.log('close');
		return false;
	});
}

function restart(req, res, next) {
	let id = req.params.id;
	let kernel = Kernel.kernel(id);
	let ret;
	if ( typeof kernel !== 'undefined' ) {
		console.log(kernel.session);
		let session = Session.session(kernel.session.id);
		if ( typeof session !== 'undefined') {
			kernel.session.register();
		} else {
			session = kernel.session;
		}
		res.json(session.kernel.restart());
	} else {
		res.sendStatus(304);		//	no kernel(not started)
	}
}

function interrupt(req, res, next) {
	let id = req.params.id;
	let kernel = Kernel.kernel(id);
	if ( typeof kernel !== 'undefined' ) {
		kernel.session.dispose();
		res.sendStatus(204);
	} else {
		res.sendStatus(304);		//	no kernel(not started)
	}
}

module.exports = {
	restart: restart,
	channels: channels,
	interrupt: interrupt
};

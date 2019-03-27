const Kernel = require('../modules/kernel');

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

function post(req, res, next) {
	let id = req.params.id;
	let kernel = Kernel.kernel(id);
	res.json(kernel.restart());
}

module.exports = {
	post: post,
	channels: channels
};

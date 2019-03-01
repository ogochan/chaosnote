const Kernel = require('../modules/kernel');

function channels(ws, req) {
	ws.on('message', _message => {
		//console.log('params: ', req.params);
		//console.log('Received -', _message);
		message = JSON.parse(_message);
		kernel = Kernel.kernel(req.params.id);
		//console.log('kernel: ', kernel);
		console.log('header: ', message.header);
		if ( kernel ) {
			console.log('msg_type: ', message.header.msg_type);
			if ( message.header.msg_type === 'execute_request' ) {
				kernel.execute(message.content, {
					parent_header: message.parent_header,
					header: message.header,
					parent_header: message.parent_header,
					metadata: message.metadata,
					buffers: message.buffers
				});
				kernel.ws = ws;
			}
		}
	});

	ws.on('close', () => {
		console.log('close');
		return false;
	});
}

module.exports = {
	channels: channels
};

const new_id = require('../modules/id');
const Session = require('../modules/session');

function put(req, res, next)	{
	console.log("put");
	console.log(req.body);
}

//Kernel.kernel(kernel.id).start();

//let kernel = new Kernel('ruby');
//kernel.start().then(() => {
//	res = kernel.execute({
//		code: '10.times { p "!" }'
//	});
//	console.log('res:', res);
//});
					
function post(req, res, next)	{
	console.log("post");
	console.log(req.body);
	console.log(req.path);
	console.log(req.params);
	path = req.body.path;
	msg_id = new_id();
	kernel_name = req.body.kernel.name;

	session = new Session(path, "notebook", "", kernel_name);
	console.log(session);
	session.kernel.start(session.id);

	res.json(session.info());
}

function get(req, res, next)	{
	console.log("get");
	
	res.json(Session.info_all());
}

function patch(req, res, next) {
	console.log("patch");
	console.log('body: ', req.body);
	console.log('path: ', req.path);
	console.log('params: ', req.params);

	session_id = req.params.id;
	session = Session.session(session_id);
	new_path = req.body.path;
	session.path = new_path;

	res.json(session.info());
}

function delete_(req, res, next) {
	console.log("patch");
	console.log('body: ', req.body);
	console.log('path: ', req.path);
	console.log('params: ', req.params);

	session_id = req.params.id;
	if ( Session.delete_(session_id) ) {
		res.sendStatus(204);
	}
}


module.exports = {
	post: post,
	get: get,
	put: put,
	patch: patch,
	delete: delete_,
};

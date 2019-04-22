const new_id = require('../modules/id');
const Session = require('../modules/session');
const Kernel = require('../modules/kernel');
const Content = require('../modules/content');
const {User} = require('../modules/user');

function put(req, res, next)	{
	//console.log("put");
	//console.log(req.body);
}

function post(req, res, next)	{
/*
	console.log("post");
	console.log(req.body);
	console.log(req.path);
	console.log(req.params);
	console.log(req.session.passport.user);
*/
	let path = req.body.path;
	let msg_id = new_id();
	let kernel_name;

	if ( req.body.kernel.name ) {
		kernel_name = req.body.kernel.name;
	} else {
		try {
			base = new Content(User.current(req), path).load(true);
			//console.log(base);
			kernel_name = base.metadata.kernelspec.name;
		}
		catch {
			kernel_name = '** not found **';
		};
	}
	//console.log('kernel_name:', kernel_name);
	kernel = new Kernel(kernel_name);
	session = new Session(req.session.passport.user, path, "notebook", "", kernel);
	//Session.save();
	//console.log(session);
	session.kernel.start(session.id);

	res.json(session.info());
}

function get(req, res, next)	{
	//console.log("get");
	
	res.json(Session.info_all(Session.user_sessions(req.session.passport.user)));
}

function patch(req, res, next) {
	//console.log("patch");
	//console.log('body: ', req.body);
	//console.log('path: ', req.path);
	//console.log('params: ', req.params);

	session_id = req.params.id;
	session = Session.session(session_id);
	new_path = req.body.path;
	session.path = new_path;

	res.json(session.info());
}

function delete_(req, res, next) {
	//console.log("patch");
	//console.log('body: ', req.body);
	//console.log('path: ', req.path);
	//console.log('params: ', req.params);

	session_id = req.params.id;
	if ( Session.delete_(req.session.passport.user, session_id) ) {
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

const Fs = require('fs');
const Content = require('../modules/content');
const {User} = require('../modules/user');

function make_path(dir, file){
    if ( dir == '/' ) {
        return ( '/' + file);
	} else
	if ( dir == '' ) {
		return (file);
    } else {
        return ( dir + '/' + file );
    }
}

function get_checkpoints(req, res, next) {
	//console.log("checkpoints");
	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	//console.log("path =" + params_path);

	content = new Content(User.current(req), params_path);

	res.json([{
		id: "checkpoint",
		last_modified: content.last_modified
	}]);
}

function post_checkpoints(req, res, next) {
	//console.log("post_checkpoints");
	//console.log('path: ', req.path);
	//console.log('params: ', req.params);

	content = new Content(User.current(req), req.params.path);
	//console.log(content);
	content.load(true);
	content.save(true);

	res.json({
		id: "checkpoint",
		last_modified: content.last_modified
	});
}

function get(req, res, next) {
	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	//console.log("path =" + params_path);

	base = new Content(User.current(req), params_path);

	//console.log('query.content:', req.query.content);
	if (( typeof req.query.content === 'undefined' ) ||
		( req.query.content !== '0' )) {
		//console.log('get content');
		base.load(false);
	} else {
		base.load(false);
		base.content = null;
	}
	res.header("Content-Type", "application/json; charset=utf-8");
	res.json(base);
}


function put(req, res, next) {
	//console.log('body: ', req.body);
	console.log('pub', req.params.path);
	body = req.body;

	content = new Content(User.current(req), req.params.path);
	content.set_body(body.content);
	content.save(false);

	res.json(content.attribute());
}

function post(req, res, next) {

	console.log("post");
	console.log('body: ', req.body);
	console.log('path: ', req.path);
	console.log('params: ', req.params);

	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	if ( req.body.type === 'notebook' ) {
		name = Content.new_note(User.current(req), params_path);
		path = make_path(params_path, name)
		content = new Content(User.current(req), path);

		stat = content.save(false);
		stat.content = null,
		stat.type = 'notebook';
	} else
	if ( req.body.type === 'directory' ) {
		name = Content.new_folder(User.current(req), params_path);
		path = make_path(params_path, name);
		stat = Content.stat(User.current(req), path);
		stat.size = null;
		stat.type = 'directory';
/*	} else
	if ( req.body.type === 'file' ) {
		name = Content.new_file(User.current(req), params_path, req.body.ext);
		path = make_path(params_path, name);
		stat = Content.stat(User.current(req), path);
		stat.type = 'file';
*/	} else {
		if ( req.body.copy_from ) {
			let from = req.body.copy_from;
			name = Content.copy_file(User.current(req), params_path, from);
			path = make_path(params_path, name);
			stat = Content.stat(User.current(req), path);
		} else {
			stat = {};
		};
	}

	res.json(stat);
}

function patch(req, res, next) {
	//console.log("patch");
	//console.log('body: ', req.body);
	//console.log('path: ', req.path);
	//console.log('params: ', req.params);

	to_path = req.body.path;
	orig_path = req.params.path;
	content = new Content(User.current(req), orig_path);
	content.rename(User.current(req), to_path);

	res.json(content.attribute());
}

function delete_(req, res, next) {
	//console.log("delete");
	//console.log('path: ', req.path);
	//console.log('params: ', req.params);

	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	//console.log("path =" + params_path);

	if ( Content.delete_(User.current(req), params_path) ) {
		res.sendStatus(204);
	}
}

function post_trust(req, res, next) {
}

module.exports = {
	get: get,
	get_checkpoints: get_checkpoints,
	post_checkpoints: post_checkpoints,
	post_trust: post_trust,
	put: put,
	post: post,
	patch: patch,
	delete: delete_,
};

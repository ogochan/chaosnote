const fs = require('fs');
const path = require('path');
const Content = require('../modules/content');

const BASE_DIR = "/home/ogochan/jupyter"

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
	console.log("checkpoints");
	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	console.log("path =" + params_path);

	content = new Content(params_path);

	res.json([{
		id: "checkpoint",
		last_modified: content.last_modified
	}]);
}

function post_checkpoints(req, res, next) {
	console.log("post_checkpoints");
	console.log('path: ', req.path);
	console.log('params: ', req.params);

	content = new Content(req.params.path);
	content.load(true);
	content.save(false);

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

	base = new Content(params_path);

	console.log('query.content:', req.query.content);
	if (( typeof req.query.content === 'undefined' ) ||
		( req.query.content !== '0' )) {
		console.log('get content');
		base.load(false);
	} else {
		base.load(false);
		base.content = null;
	}

	res.header("Content-Type", "application/json; charset=utf-8");
	res.json(base);
}


function put(req, res, next) {
	console.log('body: ', req.body);
	body = req.body;

	content = new Content(req.params.path);
	content.set_body(body.content);
	content.save(true);

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

	fn = Content.new_file(params_path);
	content = new Content(fn);
	stat = content.save(false);
	res.json({
		path: content.path
	});
}

function patch(req, res, next) {
	console.log("patch");
	console.log('body: ', req.body);
	console.log('path: ', req.path);
	console.log('params: ', req.params);

	to_path = req.body.path;
	orig_path = req.params.path;
	content = new Content(orig_path);
	content.rename(to_path);

	res.json(content.attribute());
}

function delete_(req, res, next) {
	console.log("delete");
	console.log('path: ', req.path);
	console.log('params: ', req.params);

	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	//console.log("path =" + params_path);

	if ( Content.delete_(params_path) ) {
		res.sendStatus(204);
	}
}

module.exports = {
	get: get,
	get_checkpoints: get_checkpoints,
	post_checkpoints: post_checkpoints,
	put: put,
	post: post,
	patch: patch,
	delete: delete_,
};

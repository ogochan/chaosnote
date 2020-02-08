const express = require('express');
const router = express.Router();
const {auth_user, is_authenticated, User} = require('../modules/user');

const Fs = require('fs');
const Content = require('../modules/content');


router.get('/:path(*)', is_authenticated, (req, res, next) => {
	let params_path;
	let base;
	
	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	console.log(params_path);

	base = new Content(User.current(req), params_path);
	base.load(false);
	console.log(base);

//	if ( base.type == 'markdown' ) {
//		res.render('markdown/edit', {
//			content: base.content
//		});
//	}
	res.render('edit', {
		content: base.content,
		path: req.params.path,
		version_hash: '0.0'
	});
});

router.post('/:path(*)', is_authenticated,  (req, res, next) => {
	let params_path;
	let content;
	
	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	console.log(params_path);

	contente = new Content(User.current(req), params_path);
	content.set_body(req.body.content);
	content.save(true);
	console.log(base);
});

module.exports = router;

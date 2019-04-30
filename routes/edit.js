const express = require('express');
const router = express.Router();
const {auth_user, is_authenticated, User} = require('../modules/user');

const Fs = require('fs');
const Content = require('../modules/content');

function get(req, res, next) {
	if ( req.params.path ) {
		params_path = req.params.path;
	} else {
		params_path = '';
	}
	console.log(params_path);

	base = new Content(User.current(req), params_path);
	base.load(false);

	console.log(base);

	if ( base.type == 'markdown' ) {
		res.render('markdown', {
			content: base.content
		});
	}
}
router.get('/:path(*)', is_authenticated, get);

module.exports = router;

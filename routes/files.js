const express = require('express');
const router = express.Router();
const Path = require('path');
const Content = require('../modules/content');
const {User} = require('../modules/user');

router.get('/:name(*)', (req, res, next) => {
	if ( req.params.name ) {
		params_path = req.params.name;
	} else {
		params_path = '';
	}
	content = new Content(User.current(req), params_path);
	content.load(false);
	
	//console.log(content.mime_type);
	res.set('Content-Type', content.mime_type);
	res.send(content.content);
});

/* GET users listing. */

module.exports = router;

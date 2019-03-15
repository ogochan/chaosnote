const express = require('express');
const router = express.Router();
const Path = require('path');
const Content = require('../modules/content');

const filesFunc = function(req, res, next) {
	if ( req.params.name ) {
		params_path = req.params.name;
	} else {
		params_path = '';
	}
	content = new Content(params_path);
	content.load(false);
	
	//console.log(content.mime_type);
	res.set('Content-Type', content.mime_type);
	res.send(content.content);
};

/* GET users listing. */
router.get('/:name(*)', filesFunc);

module.exports = router;

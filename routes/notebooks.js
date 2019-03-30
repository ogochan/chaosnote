const express = require('express');
const router = express.Router();
const path = require('path');
const Content = require('../modules/content');
const {User, is_authenticated} = require('../modules/user');
const notebookFunc = function(req, res, next) {
	let name = req.params.name;
	console.log(name);
	if ( name.match(/\.ipynb$/) ) {
		res.render('notebooks', { title: 'Notebooks',
								  name: path.basename(req.params.name),
								  path: req.params.name,
								  version_hash: '0.0'
								});
	} else {
		let content = new Content(User.current(req), name);
		content.load(false);
	
		//console.log(content.mime_type);
		res.set('Content-Type', content.mime_type);
		res.send(content.content);
	}
};

/* GET users listing. */
router.get('/', is_authenticated, notebookFunc);
router.get('/:name(*)', is_authenticated, notebookFunc);

module.exports = router;

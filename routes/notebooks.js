const express = require('express');
const router = express.Router();
const path = require('path');
const is_authenticated = require('../modules/user.js').is_authenticated;

const notebookFunc = function(req, res, next) {
	//console.log(req.params.name);
	res.render('notebooks', { title: 'Notebooks',
							  name: path.basename(req.params.name),
							  path: req.params.name,
							  version_hash: '0.0'
							});
};

/* GET users listing. */
router.get('/', is_authenticated, notebookFunc);
router.get('/:name(*)', is_authenticated, notebookFunc);

module.exports = router;

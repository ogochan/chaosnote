const express = require('express');
const router = express.Router();
const path = require('path');
const isAuthenticated = require('../modules/auth_check.js');

const notebookFunc = function(req, res, next) {
	//console.log(req.params.name);
	res.render('notebooks', { title: 'Notebooks',
							  name: path.basename(req.params.name),
							  path: req.params.name,
							  version_hash: '0.0'
							});
};

/* GET users listing. */
router.get('/', isAuthenticated, notebookFunc);
router.get('/:name(*)', isAuthenticated, notebookFunc);

module.exports = router;

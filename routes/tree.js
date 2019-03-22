const express = require('express');
const router = express.Router();
const isAuthenticated = require('../modules/auth_check.js');

const treeFunc = function(req, res, next) {
	//console.log(req.params.name);
	res.render('tree', { title: 'Tree',
						 path: req.params.name,
						 version_hash: '0.0',
						 contents_js_source: '',
						 nbjs_translations: '',
					   });
};

/* GET users listing. */
router.get('/', isAuthenticated, treeFunc);
router.get('/:name(*)', isAuthenticated, treeFunc);

module.exports = router;

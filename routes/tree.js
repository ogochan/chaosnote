const express = require('express');
const router = express.Router();
const is_authenticated = require('../modules/user.js').is_authenticated;

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
router.get('/', is_authenticated, treeFunc);
router.get('/:name(*)', is_authenticated, treeFunc);

module.exports = router;

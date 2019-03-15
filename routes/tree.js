var express = require('express');
var router = express.Router();

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
router.get('/', treeFunc);
router.get('/:name(*)', treeFunc);

module.exports = router;

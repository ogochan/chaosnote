var express = require('express');
var router = express.Router();
const path = require('path');

const notebookFunc = function(req, res, next) {
	console.log(req.params.name);
	res.render('notebooks', { title: 'Notebooks',
							  name: path.basename(req.params.name),
							  path: req.params.name,
							  version_hash: '0.0'
							});
};

/* GET users listing. */
router.get('/', notebookFunc);
router.get('/:name(*)', notebookFunc);

module.exports = router;

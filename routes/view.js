const express = require('express');
const router = express.Router();
const Path = require('path');

const viewFunc = function(req, res, next) {
	console.log(req.params.name);
	res.render('view', { page_title: Path.basename(req.params.name),
						 file_url: `/files/${req.params.name}`
					   });
};

/* GET users listing. */
router.get('/:name(*)', viewFunc);

module.exports = router;

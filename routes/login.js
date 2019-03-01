var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.render('login', { title: 'Login',
						  version_hash: '0.0',
						  contents_js_source: '',
						  nbjs_translations: '',
						  path: req.params.name,
						});
});

router.post('/', function(req, res, next) {
	console.log(req.body.user_name);
	console.log(req.body.password);
});

module.exports = router;

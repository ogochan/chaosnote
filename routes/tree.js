const express = require('express');
const router = express.Router();
//const _user = require('../modules/user');
//const auth_user = _user.auth_user;
//const is_authenticated = _user.is_authenticated;
//const User = _user.User;
const {auth_user, is_authenticated, User} = require('../modules/user');

const treeFunc = function(req, res, next) {
	//console.log(req.params.name);
	res.render('tree', { title: 'Tree',
						 data_server_root: '/',
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

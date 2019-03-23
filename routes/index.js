const express = require('express');
const router = express.Router();
const login = require('../routes/login');
const is_authenticated = require('../modules/user.js').is_authenticated;

/* GET home page. */
router.get('/', is_authenticated, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', login.login);
router.get('/login', login.get);
router.get('/logout', login.logout);
router.get('/signup', login.signup_get);
router.post('/signup', login.signup_post);


module.exports = router;

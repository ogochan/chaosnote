const express = require('express');
const router = express.Router();
const login = require('../routes/login');
const isAuthenticated = require('../modules/auth_check.js');

/* GET home page. */
router.get('/', isAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', login.login);
router.get('/login', login.get);
router.get('/logout', login.logout);


module.exports = router;

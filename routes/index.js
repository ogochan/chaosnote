const express = require('express');
const router = express.Router();
const login = require('../routes/login');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', login.login);
router.get('/login', login.get);
router.get('/logout', login.logout);


module.exports = router;

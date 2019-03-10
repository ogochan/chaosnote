var createError = require('http-errors');
const express = require('express');
const app = express();
const expressWS = require('express-ws')(app);
const session = require('express-session');
const passport = require('passport');

global.env = require('./config/config');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

global.kernelspecs = require('./modules/kernelspecs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var loginRouter = require('./routes/login');
var treeRouter = require('./routes/tree');
var apiRouter = require('./routes/api');
var notebooksRouter = require('./routes/notebooks');
var nbextensionsRouter = require('./routes/nbextensions');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
	secret: 'chaosnote',
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: false,
		maxage: 1000 * 60 * 30
	}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/kernelspecs', express.static(global.env.kernels_dir));

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/tree', treeRouter);
app.use('/notebooks', notebooksRouter);

app.use('/api', apiRouter);

//console.log(global.env.kernels_dir);

app.use('/nbextensions', nbextensionsRouter);
app.use('/nbextensions', express.static(path.join(__dirname, 'public/nbextensions')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

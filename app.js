const createError = require('http-errors');
const express = require('express');
const app = express();
const expressWS = require('express-ws')(app);
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const router = express.Router();
const Session = require('./modules/session');

global.env = require('./config/config');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

global.kernelspecs = require('./modules/kernelspecs');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const filesRouter = require('./routes/files');
const viewRouter = require('./routes/view');
const treeRouter = require('./routes/tree');
const apiRouter = require('./routes/api');
const notebooksRouter = require('./routes/notebooks');
const nbextensionsRouter = require('./routes/nbextensions');

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
	store: new FileStore({
		ttl: global.env.session_ttl,	//	default 3600(s)
		reapInterval: global.env.session_ttl,
		path: global.env.session_path	//	default path
	}),
	cookie: {
		httpOnly: true,
		secure: false,
		maxage: null
	}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/kernelspecs', express.static(global.env.kernels_dir));

app.use('/static', express.static(path.join(__dirname, 'public')));
//app.use('/files', express.static(global.env.data_dir));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tree', treeRouter);
app.use('/notebooks', notebooksRouter);
app.use('/files', filesRouter);
app.use('/view', viewRouter);

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

Session.init();

module.exports = app;

/* ***************************************************************** */
/*                                                                   */
/* VSI-International Confidential                                    */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright VSI-International Corp. 2016                            */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the VN. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var expressLayouts = require('express-ejs-layouts');

var session = require('express-session');
//var RedisStore = require('connect-redis')(session);
var passport = require('passport');

var AuthenStrategy = require('./common/authen_strategy');
var CouchDB = require('./common/couchdb');

var services = JSON.parse(process.env.VCAP_SERVICES || '{}');
var couchURL = (services.cloudantNoSQLDB ? services.cloudantNoSQLDB[0].credentials.url : (process.env.DB_URL||'localhost:5984'));
var dbDs = new CouchDB({ "DB_URL": couchURL});

// catching for any unknown error
var exception = {'uncaughtException': []};
process.on('uncaughtException', function(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  exception.uncaughtException = err;
  console.error(err.stack)
  process.exit(1)
});

var sessionOptions = {
  name: 'vnappstore.sid',
  secret: 'TmdoaWVtIFZhbiBWaWV0IC0gMjAxNiBNYXkgMTA=',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 3600000,// 1 hour
    expires: false
  },
  //store: new RedisStore(redisOptions)
};

//some stuff
if (process.env.NODE_ENV == 'production') {
	console.log('development production');
} else {
	console.log('development environment');
	// don't want to use cluster or redis for any purpose
	process.env.WORKERS = 1;
	delete sessionOptions.store;
	// redisClient.end(false);
}

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('layout', 'layout');
app.use(expressLayouts);

//authorization setup
passport.use(new AuthenStrategy());
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/vnas/public', express.static(path.join(__dirname, 'public')));

// routes
var routesHome = require('./routes/index')(dbDs);
var routesAuthen = require('./routes/authen')(passport, exception);

var routesReqApps = require('./routes/request_app')(dbDs);
var routesApiApps = require('./routes/api_apps')(dbDs);
var routesApiReq = require('./routes/api_request')(dbDs);

// Authencation section
app.use('/vnas/authen', routesAuthen);
app.use('/vnas/api/v1/apps', routesApiApps);

// Check for every request whether it has authorization or not
app.use(isRequiredAuthen);

// Authorized resources
app.use('/vnas', routesHome);
app.use('/vnas/req', routesReqApps);
app.use('/vnas/api/v1/req', routesApiReq);

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
	  error: err
  });
});
*/

// As with any middleware it is quintessential to call next()
// if the user is authenticated
function isRequiredAuthen(req, res, next) {
  var isAuthenticated = req.isAuthenticated();
  console.log('isAuthenticated?', isAuthenticated, req.method, req.url);
  //console.log('req.user', req.user);
  if (isAuthenticated) {
    return next();
  } else {
	  // if api request
	  if (req.url.indexOf('/vnas/api/') == 0) {
		  res.status(401).send({'error': 'Unauthorized'});
	  } else {
		  // other cases
		  res.render('login', {
		    error: ''
		  });
	  }
  }
  return true;
};

module.exports = app;

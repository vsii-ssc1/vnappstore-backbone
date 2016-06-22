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
/*#!/usr/bin/env node*/

/**
 * Module dependencies.
 */

var debug = require('debug')('vnappstore:server');
var http = require('http');

var cluster = require('cluster');

var enableLog4j = process.env.ENABLE_LOG4J||true;
//Apply the log4j if any
if (enableLog4j) {
	var logLevel = (process.env.LOG_LEVEL || 'INFO');//FATAL, ERROR, WARN, INFO, DEBUG, TRACE
	var logjs = require('./common/logger')();
	//write access logs into access.log
	//var logAccess = logjs.getLogger('access');
	//app.use(logjs.connectLogger(logAccess, {level: 'auto'}));
	// write console logs into console.log
	var logConsole = logjs.getLogger('console');
	logConsole.setLevel(logLevel);
}

/**
 * Get workers size
 */
var workers = process.env.WORKERS || 1;
// default size of workers must be greater or equal 4
//if (workers < 4) {
//	workers = 4;
//}
//if (process.env.NODE_ENV != 'production') {
//	workers = 1;
//}

/**
 * Create a new cluster for master or slaves
 */
if (cluster.isMaster) {
  console.log('Start cluster with %s workers', workers);
  for (var i = 0; i < workers; ++i) {
    var worker = cluster.fork().process;
    console.log('Worker %s started.', worker.pid);
  }
  cluster.on('exit', function(worker) {
    console.log('Worker %s died. restart...', worker.process.pid);
    cluster.fork();
  });
} else {
	console.log('Create HTTP server');

	var app = require('./app');
	/**
	 * Get port from environment and store in Express.
	 */
	var port = normalizePort(process.env.PORT || '4000');
	app.set('port', port);
	
	/**
	 * Create HTTP server.
	 */
	var server = http.createServer(app);
	
	/**
	 * Listen on provided port, on all network interfaces.
	 */
	
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening.bind(server));
}//if-else cluster

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = this.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

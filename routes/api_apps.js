var express = require('express');
var router = express.Router();

function AppServices(ds) {
	var generalServerError = { 'error': 'Could not receive the data at this time due to server problem, please try again later', 'data': {}};
	var invalidParamError = { 'error': 'Invalid paramater input', 'data': {}};
	
	// all apps
	router.get('/', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});

	// featured apps
	router.get('/featured', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});
	
	// latest apps
	router.get('/latest', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});
	
	// most download apps
	router.get('/most-download', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});
	
	return router;
}

module.exports = AppServices;

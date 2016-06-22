var express = require('express');
var router = express.Router();

function AppServices(ds) {
	var generalServerError = { 'error': 'Could not receive the data at this time due to server problem, please try again later', 'data': {}};
	var invalidParamError = { 'error': 'Invalid paramater input', 'data': {}};
	
	router.post('/', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});
	
	router.put('/', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});
	
	router.delete('/', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});
	
	router.get('/', function(req, res, next) {
		res.send({'message': 'Welcome to VN App Store'});
	});
	
	return router;
}

module.exports = AppServices;

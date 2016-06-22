var express = require('express');
var router = express.Router();

function RequestApp(ds) {
	var generalServerError = { 'error': 'Could not receive the data at this time due to server problem, please try again later', 'data': {}};
	
	/*RequestApp*/
	router.get('/', function(req, res, next) {
		console.log('Router:RequestApp');
		res.render('request_app', {  });
	});

	return router;
}

module.exports = RequestApp;

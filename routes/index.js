var express = require('express');
var router = express.Router();

function Router(ds) {
	var generalServerError = { 'error': 'Could not receive the data at this time due to server problem, please try again later', 'data': {}};
	
	/* GET home page. */
	router.get('/', function(req, res, next) {
	  res.render('index', { title: 'vnappstore@VSI-International' });
	});
	
	router.get('/api/user-info', function(req, res, next) {
	  res.send({"email": req.user.preferredIdentity, "callname": req.user.callupname});
	});
	
	router.get('/agents-left', function(req, res, next) {
		ds.Account.getLeftOnes().then(function(resp){
//			console.log('Router:Account::getLeftOnes: ', resp);
			res.render('agents_left', { 'data': {'accounts':resp}, 'error': '' });
		}).fail(function(err){
			console.log('Router:Account::Error: ', err);
			res.render('agents_left', generalServerError);
		});
	});
	
	return router;
}

module.exports = Router;

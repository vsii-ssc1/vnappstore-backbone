var express = require('express');
var router = express.Router();

var encode = require('../common/encode')();

function SignUpAPI(ds) {
	var generalServerError = { 'error': 'Could not receive the data at this time due to server problem, please try again later', 'data': {}};
	
	/* GET home page. */
	router.get('/:userid', function(req, res, next) {
		var userid = req.params.userid;
		
		userid = (userid||'').toLowerCase();
		if (userid) {
			ds.getUser(userid).then(function(resp){
				var user = resp.body;
				console.log('success', user);
				res.send(user);
			}, function(err){
				console.log('failure', err.response.body);
				res.send({
					  'message': 'Failure in looking up for the user',
					  'userid': userid,
					  'time': new Date(),
					  'err' : err.response.body
				  });
			});
		} else {
			res.send({'message': 'Nothing to do!'});
		}
		
	});
	
	router.get('/my/:userid/:passwd', function(req, res, next) {
		var userid = req.params.userid;
		var passwd = req.params.passwd;
		
		userid = (userid||'').toLowerCase();
		
		if (userid && passwd) {
			var secret = encode.sha256(userid, passwd);
			ds.addUser(userid, { 'mail': userid, 'secret': secret, 'time': new Date() }).then(function(resp){
				console.log('success', resp.body);
				res.send({
					  'message': 'Successful in signing up for the user',
					  'userid': userid,
					  'secret': secret,
					  'time': new Date()
				  });
			}, function(err){
				console.log('failure', err.response.body);
				res.send({
					  'message': 'Failure in signing up for the user',
					  'userid': userid,
					  'secret': secret,
					  'time': new Date(),
					  'err' : err.response.body
				  });
			});
		}
	});
	
	router.get('/mv/:userid/:passwd', function(req, res, next) {
		var userid = req.params.userid;
		var passwd = req.params.passwd;
		
		userid = (userid||'').toLowerCase();
		
		if (userid) {
			ds.getUser(userid).then(function(resp){
				var user = resp.body;
				console.log('success', user);
				if (passwd == user.secret) {
					ds.remove(ds.DB_USERS, user._id, user).then(function(e){
						res.send({
							  'message': 'Successful in moving for the user',
							  'userid': userid,
							  'time': new Date()
						  });
					}, function(e){
						console.log('failure', e.response.body);
						res.send({
							  'message': 'Failure in moving for the user',
							  'userid': userid,
							  'time': new Date(),
							  'err' : e.response.body
						  });
					});
				} else {
					res.send({'message': 'Nothing to do!'});
				}
			}, function(err){
				console.log('failure', err.response.body);
				res.send({
					  'message': 'Failure in moving for the user',
					  'userid': userid,
					  'time': new Date(),
					  'err' : err.response.body
				  });
			});
		}
	});
	
	return router;
}

module.exports = SignUpAPI;

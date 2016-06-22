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
var router = express.Router();

function Authen(passport, exception) {
	var failLDAPServerIssue = function(res){
		res.render('login', {
            error: 'Can not reach authentication server, please try again later'
        });
	};
	var failInvalidCredential = function(res){
		res.render('login', {
            error: 'Your ID or password was entered incorrectly'
        });
	};
	var failPermissionDeny = function(res){
		res.statusCode = 403;
		res.render('login', {
            error: 'Permition denied: You have no authorization to access this, please contact administrator of this site'
        });
	};
	
	var performRequestAuthen = function(user, req, res){
		// perform authen request
        req.logIn(user, function (err) {
            if (err) {
                failInvalidCredential(res);
                return;
            }
            res.redirect('/vnas');
        });
	};
	
	router.get('/', function(req, res, next) {
	  res.render('login', {error: ''});
	});

    router.post('/', function (req, res, next) {
        // clean this cache
        exception.uncaughtException = [];
        try {
            // perform authenticate
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    failInvalidCredential(res);
                    return;
                }
				
                if (user) {
                	performRequestAuthen(user, req, res);
                } else {
                    failInvalidCredential(res);
                }
            })(req, res, next);
        } finally {
            setTimeout(function () {
                if (exception.uncaughtException.hostname === 'xxx') {
                    console.log('Could not open connection to server, please add administrator for advise');
					failLDAPServerIssue(res);
                } else {
                    console.log('Connection to server is fine');
                }
            }, 300);
        }
    });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/vnas');
    });
	
	return router;
}

module.exports = Authen;

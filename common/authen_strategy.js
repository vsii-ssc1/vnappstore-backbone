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
var LocalStrategy = require('passport-local').Strategy;
var encode = require('../common/encode')();

module.exports = function AuthenStrategy(ds) {
	return new LocalStrategy({
			usernameField : 'userid',
			passwordField : 'passwd'
		}, 
		function(username, password, done) {
			username = (username||'').toLowerCase();
			
			ds.getUser(username).then(function(resp){
				var user = resp.body;
				var secret = encode.sha256(username, password);
				
				if (user.secret == secret) {
					return done(null, {'username': username, 'password': password}, { message: 'Welcome to VN AppStore' });
				} else {
					return done(null, false, { message: 'Incorrect password.' });
				}
			}, function(err){
				console.log('get user failed', (err.error? err.error : err.response.body));
				return done(null, false, { message: 'Incorrect username.' });
			});
	});
};

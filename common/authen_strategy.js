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

module.exports = function() {
	return new LocalStrategy({
			usernameField : 'userid',
			passwordField : 'passwd'
		}, 
		function(username, password, done) {
			// hard-code some users for testing
			var Users = {
				'vietn@vsii.com': 'hello',
				'admin@vsii.com': 'hello',
				'test@vsii.com': 'hello',
				'hello@vsii.com': 'hello'
			};
			var found = Users[username];
			if (found) {
				if (found == password) {
					return done(null, {'username': username, 'password': password}, { message: 'Welcome to VN AppStore' });
				} else {
					return done(null, false, { message: 'Incorrect password.' });
				}
			} else {
				return done(null, false, { message: 'Incorrect username.' });
			}
	});
};

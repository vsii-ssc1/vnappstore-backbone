var Common = {
	openReq: function(method, uri, inputJSON) {
		var req = $.ajax({
			'method' : method,
			'url' : uri,
			'data' : inputJSON
		});
		return req;
	},
	
	errorReq : function(err) {
		this.showMessage();
		if (err.status == 401) {
			var msg = 'Session expired, please sign in again to continue your works!';
			this.showError(msg);
			alert(msg);
			location.href = '/vnas';
		} else {
			var msg = 'Failure in saving data due to server problem, please try again later';
			var body = err.responseText;
			if (body) {
				try {
					body = JSON.parse(body);
					if (body.error) {
						msg = body.error;
					}
				} catch(e){}
			}
			this.showError(msg);				
		}
	},
	
	showUserInfo: function(attachPoint) {
		var uri = '/vnas/api/user-info';
		var templ = '<strong>#name</strong>';
		
		if (!attachPoint) {
			attachPoint = '.user-info';
		}
		if ($(attachPoint).length) {
			$.get(uri).done(function(resp){
				var callname = resp.callname;
				if (callname) {
					var i = callname.indexOf('*');
					if (i > 0) {
						callname = callname.substring(0, i-1);
					}
				}
				$(attachPoint).html(templ.replace(/\#name/, callname));
			}).fail(function(err){
				console.log(err);
			});
		}
	},
	
	showMessage: function (msg) {
		var id = '.alert-save-message';
		if (msg) {
			$('.message').html(msg);
			$(id).show();
		}
		else {
			$(id).hide();
		}
		// hide error alert if any
		this.showError();
	},
	
	showError: function (msg) {
		var id = '.alert-save-danger';
		if (msg) {
			$('.error').html(msg);
			$(id).show();
		}
		else {
			$(id).hide();
		}
	},
	
	signout: function() {
		location.href = '/vnas/authen/logout';
	}
};

function signout() {
	Common.signout();
}


$(document).ready(function(){
	console.log('DOM ready!');
	
	Common.showUserInfo();
	
});

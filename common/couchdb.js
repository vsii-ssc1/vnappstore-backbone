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
var request = require('request');
var Q = require('q');
function CouchDB(options) {
	this.ds = {
			debug : false,
			force2CreateDBs : false,
			
			DB_URL : 'localhost:5984',//'http://{user}:{pass}@{host}',
			DB_USER: '',
			DB_PASS: '',// format as Base64 encode
			DB_CERT: null,
			
			DB_USERS : 'vnapp_users',/*{_id, _rev, mail, fullname, create_at}*/
			DB_APPS  : 'vnapp_apps',/*{_id, _rev, roomCode, members[], create_at}*/
			DB_FILES : 'vnapp_files',/*{_id, _rev, roomId, userId, create_at}*/
			
			DB_USERS_VIEWS : {
				path: '_design/users',
				data : { "language":"javascript",
					"views": {
						"by_mail": {"map":"function(doc) { if (doc.mail) {emit(doc.mail, doc);}}" }/*,
						"by_mail_order_by_date": {"map":"function(doc) { if (doc.mail) {emit([ doc.mail, doc.create_at ], doc);}}" },
						"by_id": {"map":"function(doc) { emit(doc._id, doc);}" }*/
						}
					}
			},

			DB_APPS_VIEWS : {
				path: '_design/apps',
				data : { "language":"javascript",
					"views": {
						/*"by_id": {"map":"function(doc) { emit([ doc._id, doc.create_at], doc);}" },*/
						//"by_member": {"map":"function(doc) { for(var member in doc.members) if (member.everJoined) {emit([ member, doc.create_at, doc.title, doc.modify_at, doc.linkThumbnail, doc.password, doc.members ], null);} }" }
						"by_member": {"map": "function(doc) {var userIds = {};var count = 0;for (var userId in doc.members) {userIds[userId]={};count++;if(count == 2) break;}for(var member in doc.members)emit([member, doc.create_at],[null, doc.create_at, doc.title, doc.modify_at, doc.linkThumbnail, doc.password, userIds, doc.owner, doc.pageIds ]);}" },
						"search": {"map": "function(doc) {var userIds = {};var count = 0;for (var userId in doc.members) {userIds[userId]={};count++;if(count == 2) break;}if(doc.active !== null)emit(doc.active, [null, doc.create_at, doc.title, doc.modify_at, doc.linkThumbnail, doc.password, userIds, doc.owner, doc.pageIds ]);}" },

						"by_owner": {"map": "function(doc) {var userids=[];for(var k in doc.members){userids.push(k);}emit([doc.owner, doc.create_at], [doc.create_at, doc.title, doc.modify_at, doc.linkThumbnail, doc.password, userids, doc.owner, doc.pageIds]); }"},
						"by_parti": {"map": "function(doc) {var userids=[];for(var k in doc.members){userids.push(k);}var owner = doc.owner; for(var m in doc.members) { if (owner != m) { emit([m, doc.create_at], [doc.create_at, doc.title, doc.modify_at, doc.linkThumbnail, doc.password, userids, doc.owner, doc.pageIds]); } } }"},
						"by_visib": {"map": "function(doc) {var userids=[];for(var k in doc.members){userids.push(k);}var tp=doc.visibility?doc.visibility.type:'restricted';emit([tp, doc.create_at], [doc.create_at, doc.title, doc.modify_at, doc.linkThumbnail, doc.password, userids, doc.owner, doc.pageIds]); }"},
						
						"by_owner_search": {"map": "function(doc){var userids=[];for(var k in doc.members){userids.push(k);}if(doc.title){var l=128;var tk=doc.title.replace(/^\\s+|\\s+$/g,'');if(tk.length>l){tk=tk.substring(0,l-1);}var tks=tk.split(/[\\`\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\-\\_\\=\\+\\{\\[\\}\\]\\|\\: \\;\\\"\\'\\<\\,\\>\\.\\?\/\\n\\r\\t\\b\\v\\f\\0\\s]+/);emit([doc.owner,tk,doc.create_at],[doc.create_at,doc.title,doc.modify_at,doc.linkThumbnail,doc.password,userids,doc.owner,doc.pageIds]);while(tks.length > 0){tks.splice(0, 1);tk = tks.join(' ');if(tk.length<3)break;emit([doc.owner,tk,doc.create_at],[doc.create_at,doc.title,doc.modify_at,doc.linkThumbnail,doc.password,userids,doc.owner,doc.pageIds]);}}}"},
						"by_parti_search": {"map": "function(doc){var userids=[];for(var k in doc.members){userids.push(k);}var owner=doc.owner;if(doc.title){var l=128;var tk=doc.title.replace(/^\\s+|\\s+$/g,'');if(tk.length>l){tk=tk.substring(0,l-1);}var tks=tk.split(/[\\`\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\-\\_\\=\\+\\{\\[\\}\\]\\|\\: \\;\\\"\\'\\<\\,\\>\\.\\?\/\\n\\r\\t\\b\\v\\f\\0\\s]+/);for(var m in doc.members){if(owner!=m){emit([m,tk,doc.create_at],[doc.create_at,doc.title,doc.modify_at,doc.linkThumbnail,doc.password,userids,doc.owner,doc.pageIds]);}}while(tks.length > 0){tks.splice(0, 1);tk = tks.join(' ');if(tk.length<3)break;for(var m1 in doc.members){if(owner!=m1){emit([m1,tk,doc.create_at],[doc.create_at,doc.title,doc.modify_at,doc.linkThumbnail,doc.password,userids,doc.owner,doc.pageIds]);}}}}}"},
						"by_visib_search": {"map": "function(doc){var userids=[];for(var k in doc.members){userids.push(k);}var tp=doc.visibility?doc.visibility.type: 'restricted';if(doc.title){var l=128;var tk=doc.title.replace(/^\\s+|\\s+$/g,'');if(tk.length>l){tk=tk.substring(0,l-1);}var tks=tk.split(/[\\`\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\-\\_\\=\\+\\{\\[\\}\\]\\|\\: \\;\\\"\\'\\<\\,\\>\\.\\?\/\\n\\r\\t\\b\\v\\f\\0\\s]+/);emit([tp,tk,doc.create_at],[doc.create_at,doc.title,doc.modify_at,doc.linkThumbnail,doc.password,userids,doc.owner,doc.pageIds]);while(tks.length > 0){tks.splice(0, 1);tk = tks.join(' ');if(tk.length<3)break;emit([tp,tk,doc.create_at],[doc.create_at,doc.title,doc.modify_at,doc.linkThumbnail,doc.password,userids,doc.owner,doc.pageIds]);}}}"}
					}
				}
			},

//			DB_DRAWS_VIEWS : {
//				path: '_design/draws',
//				data : { "language":"javascript",
//					"views": {
//						/*"by_room": {"map":"function(doc) { if (doc.roomId) {emit(doc.roomId, doc);}}" },*/
//						"by_room_order_by_date": {"map":"function(doc) { if (doc.roomId) {emit([ doc.roomId, doc.create_at], doc);}}" }/*,
//						"by_room_page": {"map":"function(doc) { if (doc.roomId && doc.pageId) {emit([doc.roomId, doc.pageId], doc);}}" },
//						"by_room_page_order_by_date": {"map":"function(doc) { if (doc.roomId && doc.pageId) {emit([ doc.roomId, doc.pageId, doc.create_at], doc);}}" }*/
//						}
//					}
//			},
		
		_appendConnCert: function(inputData){
			var cert = this.DB_CERT;
			inputData['agentOptions'] = cert? { 'ca': cert } : {};//{ 'secureProtocol': 'SSLv3_method' };
		},
		
		/**
		 * request db with data
		 */
		_openRequest: function (inputData) {
			console.log('Connecting to the CouchDB ... ');
			var def = Q.defer();
			
			var _self = this;
			this._appendConnCert(inputData);
			request(inputData, function (error, response, body) {
				if(!error && (typeof response === 'undefined' || response.statusCode == 200 || response.statusCode == 201)){
					if (typeof body === 'string') {
			        	try {
			        		body = JSON.parse(body);
			        	} catch(e){
			        		console.log('could not parse response body');
			        		if (_self.debug) {
				        		console.log('response body:', body);
			        		}
			        	}
					}
					def.resolve({ 'body': body, 'response': response });
				} else {
					def.reject({ 'error': error, 'response': response });
					if (_self.debug) {
			    		  if (response) {
			    			  console.log('response code:', response.statusCode);			    			  
			    		  }
				          console.log('response body:', body);
			    	 }
				}
			});
			
			return def.promise;
		},
		
		/**
		 * request couch db with method, uir and JSON data.
		 */
		_openRequestGen: function (method, uri, jsonData) {
			console.log('_openRequestGen', method, uri);
			var connURL = this.DB_URL + '/' + uri;
			var inputData = {
				'method': method,
			    'uri': connURL,
			    'Accept': 'application/json',
			    'Content-type': 'application/json',
			    'json': jsonData
			};
			return this._openRequest(inputData);
		},
		
		createDB: function(db) {
			return this._openRequestGen('PUT', db, null);
		},
		deleteDB: function(db) {
			return this._openRequestGen('DELETE', db, null);
		},
		/**
		 * get head for specified DB and document ID
		 */
		head: function(db, id, body) {
			var rev = (body && body["_rev"]) ? '?rev='+body["_rev"] : '';
			return this._openRequestGen('HEAD', db+'/'+id+rev, body);
		},
		insert: function (db, id, data) {
			return this._openRequestGen('PUT', db+'/'+id, data);
		},
		get: function (db, key) {
			return this._openRequestGen('GET', db+'/'+key, null);
		},
		update: function(db, id, data) {
			return this._openRequestGen('PUT', db+'/'+id, data)
		},
		remove: function(db, id, body) {
			return this._openRequestGen('DELETE', db+'/'+id+'?rev='+body["_rev"], body);
		},
		
		/* USERS */
		addUser: function(docId, user) {
			return this.insert(this.DB_USERS, docId, user);
		},
		
		getUser: function(docId) {
			return this.get(this.DB_USERS, docId);
		},
		
		getUserByMail: function (mail) {
			return this._openRequestGen('GET', this.DB_USERS+'/'+this.DB_USERS_VIEWS.path+'/_view/by_mail?key='+encodeURIComponent('"'+mail+'"'), null);
		},
		
		
		getRoomById: function (id) {
			return this._openRequestGen('GET',  this.DB_APPS+'/'+id, null);
		},
		getRooms: function(userId, isOtherBoard, startDate, endDate, urlParams) {
			//var json = {"startkey":[userId], "endkey": [userId]};
			var json = '';
			var view = '';
			var params = ''; //keys=' + encodeURIComponent(JSON.stringify(json.keys));

			if (isOtherBoard) {
				//other board
				json = {"startkey":null, "endkey": [userId]};
			} else {
				// my boards
				json = {"startkey":[userId], "endkey": [userId]};
				if (urlParams && urlParams['descending']) {
					json.startkey.push(startDate || {});
					json.endkey.push(endDate);
				} else {
					json.startkey.push(startDate);
					json.endkey.push(endDate||{});
				}
				view = this.DB_APPS_VIEWS.path + '/_view/by_member?';
			}
			
			params = 'startkey='+encodeURIComponent(JSON.stringify(json.startkey));
			params += '&endkey='+encodeURIComponent(JSON.stringify(json.endkey));
			
			if (urlParams) {
				for (var k in urlParams) {
					params += '&'+k+'='+encodeURIComponent(urlParams[k]);
				}
			}
			
			var cpt = this.DB_APPS+'/'+view+ params;
			return  this._openRequestGen('GET', cpt, null);		
		},

		queryRooms: function(searchText) {
			view = this.DB_APPS_VIEWS.path + '/_view/search';
			
			var cpt = this.DB_APPS+'/'+view;
			console.log("QUERYDATA", cpt);
			
			return this._openRequestGen('GET', cpt, null);	
		},
		
		getRoom2: function(viewerPath, firstKey, keyword, startDate, endDate, urlParams) {
			var json = {'startkey':[firstKey], 'endkey': [firstKey]};
			var view = null;
			var params = null;
			var viewPath = viewerPath;

			if (keyword) {
				viewPath += '_search';
			}
			
			if (urlParams && urlParams['descending']) {
				if (keyword) {
					json.startkey.push(keyword+'\u9999');
					json.endkey.push(keyword.toLowerCase());
				}
				json.startkey.push(startDate || {});
				json.endkey.push(endDate);
			} else {
				if (keyword) {
					json.startkey.push(keyword.toLowerCase());
					json.endkey.push(keyword+'\u9999');
				}
				json.startkey.push(startDate);
				json.endkey.push(endDate||{});
			}
			
			params = 'startkey='+encodeURIComponent(JSON.stringify(json.startkey));
			params += '&endkey='+encodeURIComponent(JSON.stringify(json.endkey));
			
			if (urlParams) {
				for (var k in urlParams) {
					params += '&'+k+'='+encodeURIComponent(urlParams[k]);
				}
			}
			
			view = this.DB_APPS_VIEWS.path + '/_view/'+viewPath+'?';
			var cpt = this.DB_APPS+'/'+view+ params;
			 
			return this._openRequestGen('GET', cpt, null);		
		},
		
		getMyRooms: function(userId, keyword, startDate, endDate, urlParams) {
			return this.getRoom2('by_owner', userId, keyword, startDate, endDate, urlParams);
		},
		
		getPartiRooms: function(userId, keyword, startDate, endDate, urlParams) {
			return this.getRoom2('by_parti', userId, keyword, startDate, endDate, urlParams);
		},
		
		getVisiRooms: function(visiType, keyword, startDate, endDate, urlParams) {
			return this.getRoom2('by_visib', visiType, keyword, startDate, endDate, urlParams);
		},

//		getDrawByRoomOrderByDate: function (room_uuid, startDate, endDate) {
//			var json = {"startkey":[room_uuid, startDate], "endkey": [room_uuid, (endDate||{})]};
//			console.log(JSON.stringify(json))
//			var paramstr = 'startkey='+encodeURIComponent(JSON.stringify(json.startkey));
//			paramstr += '&endkey='+encodeURIComponent(JSON.stringify(json.endkey));
//			return this._openRequestGen('GET', this.DB_DRAWS+'/'+this.DB_DRAWS_VIEWS.path+'/_view/by_room_order_by_date?'+paramstr, null);
//		},
//		
//		getDrawById: function (key) {
//			return this._openRequestGen('GET',  this.DB_DRAWS+'/'+key, null);
//		},
		
		_getRev: function(info) {
			var rev = (info && info.response)? info.response.headers['etag'] : null;
			if (rev) {
				rev = rev.replace(/[\"\']+/g, '');
				return rev;
			}
			return null;
		},

		/**
		 * put file as attachment by binary content
		 */
		putFile: function (uri, binaryContent, contentType) {
			console.log('putFile', contentType, uri);
			var connURL = this.DB_URL + '/' + this.DB_FILES + '/' + uri;// uri = "id/file name"
			var inputData = {
				'method': 'PUT',
			    'uri': connURL,
			    'Accept': 'application/json',
			    'Content-type': contentType,
			    'body': binaryContent
			};
			return this._openRequest(inputData);
		},
		/**
		 * update or insert file as attachment by binary content
		 */
		upsertFile: function(uri, binaryContent, contentType) {
			var def = Q.defer();
			
			var _self = this;
			var _update = function(info) {
				var rev = _self._getRev(info);
				if (rev) {
					uri += "?rev=" + rev;
				}
				_self.putFile(uri, binaryContent, contentType).then(function(r){
					def.resolve(r);
				}, function(e){
					def.reject(e);
				});
			};
			
			//update for existing one
			//failed means not existing so that put directly
			this.head(this.DB_FILES, uri, {}).then(_update , _update);
			
			return def.promise;
		},
		/**
		 * get file from binary attachment(pipe can be read correctly)
		 * 
		 */
		getFile: function(uri, req, res) {
			console.log('getFile', uri);
			var def = Q.defer();
			
			var connURL = this.DB_URL + '/' + this.DB_FILES + '/' + uri;
			var inputData = {
				'method': 'GET', 
				'uri': connURL, 
				'timeout': 100000
			};
			
			this._appendConnCert(inputData);

			try {
				var stream = null;
				if (req) {
					stream = req.pipe(request(inputData));
				} else {
					stream = request(inputData);
				}
				
				if (stream) {
					stream.pipe(res, {'end': false});
					stream.on('end', function(){
						def.resolve(arguments);
					});
				}
			} catch (e) {
				console.log('IO Error', e);
				def.reject({ 'error': e });
				res.writeHead(200, {
					'Content-Type' : 'text/plain'
				});
				res.end('Error');
			}
			
			return def.promise;
		},
		/**
		 * remove file from attachment
		 */
		removeFile: function(uri) {
			console.log('removeFile', uri);
			var def = Q.defer();
			
			var _self = this;
			
			this.head(this.DB_FILES, uri, {}).then(function(info) {
				var rev = _self._getRev(info);
				_self.remove(self.DB_FILES, uri, {'_rev': rev}).then(function(resp){
					def.resolve(resp);
				}, function(e){
					def.reject(e);
				});
			}, function(e){
				def.reject(e);
			});
			
			return def.promise;
		},
		
	    /**
	     * save image file with base64 format
	     */
		saveImage64: function (id, filename, fileType, imageBase64) {
			console.log('saveImage64', id, fileType, filename);
			
			var def = Q.defer();
			if (imageBase64) {
				var pattern=/^data:image\/([a-zA-Z0-9_\-\+]+);base64,/g;
				var matcher = pattern.exec(imageBase64);
				if (matcher && matcher.length > 0) {
					if (!fileType) {
						fileType = 'image/' + matcher[1];
					}
					var i = filename.lastIndexOf('.');
					if (i == -1 || filename.substring(i).length > 5) {
						filename += '.' + matcher[1];						
					}
				}
				
				if (!fileType) {
					fileType = 'image/png';
				}
				console.log('saveImage64 Content-Type', fileType);
				
				var base64Data = imageBase64.replace(pattern, '');
				var binaryData = new Buffer(base64Data, 'base64');
				console.log('saveImage64 File-Size', binaryData.length);
				
				var _callback = function(info) {
					var response = info.response;
					var error = info.error;
					if (!error && (typeof response === 'undefined' || response.statusCode == 200 || response.statusCode == 201)) {
						def.resolve({filename: filename});
					} else {
						def.resolve(info);
					}
				}
				this.putFile(uri, binaryData, fileType).then(_callback, _callback);
			} else {
				console.log('saveImage64 File not found!', id, fileType, filename);
			}						
			return def.promise;
		},
		
		/**
		 * initialize for DB
		 */
		startup: function(props) {
			if (props) {
				// copy props
				for (var pr in props) {
					this[pr] = props[pr];
				}
			}
			console.log('DB startup',this.DB_URL);
			//this.createDBSchema();
			//Test DB connection
			this.testConnection();
		},
		
		testConnection: function() {
			var _succ = function(info) {
				console.log('Succeeded in connecting to the DB', info.body.db_name);
			};
			var _fail = function(err) {
				console.log('Failed in connecting to the DB', (err ? err.response? err.response.body : err : err));
			}
			
			var _self = this;
			var _test = function(db) {
				_self.get(db, '').then(_succ, _fail);
			}
			
			_test(this.DB_USERS);
			_test(this.DB_APPS);
			_test(this.DB_FILES);
		},
		
		createDBSchema: function(onSuccess, onFailure) {
			var _self = this;
			var _createDB = function(db, dbViews) {
				var _selfCreate = function() {
					_self.createDB(db).then(function(info){
						console.log(info);
						if (dbViews) {
							_self.insert(db, dbViews.path, dbViews.data).then(function(resp){
								console.log(info);
							});
						}
					});
				};
				
				if (_self.force2CreateDBs) {
					_self.deleteDB(db).then(_selfCreate, _selfCreate);
				} else {
					_selfCreate();
				}
			}
			
			_createDB(_self.DB_USERS, _self.DB_USERS_VIEWS);
			_createDB(_self.DB_APPS, _self.DB_APPS_VIEWS);
			_createDB(_self.DB_FILES);
		}
	};
	// execute
	this.ds.startup(options);
}

module.exports = CouchDB;



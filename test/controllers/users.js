var server,
	http = require('http'),
	assert = require('assert'),
	config = require('../config/config'),
	host = 'http://localhost:' + config.port + '/api/v1',
	single_user_endpoint = host+'/users/51964caa9c253bdbb1d00fb4',
	users_endpoint = host+'/users',
	http_options = {
		hostname: 'localhost',
		port: config.port,
		path: single_user_endpoint,
		method: 'GET',
		headers: {
			'Accept': '/',
			'Connection': 'Keep-Alive',
			'Content-Type': 'application/json'
		}
	};

describe('User API', function() {

	before(function(done) {
		server = require('../server');

		server.on('listening', function() {
			done();
		});
	});

	after(function(done) {
		server.close();
		done();
	});

	describe('GET /api/v1/users/:id', function() {

		it('should retrieve user information', function(done) {
			var callback = function(res) {
				var data = '';
				res.setEncoding('utf8');

				res.on('data', function(chunk) {
					data += chunk;
				});

				res.on('end', function() {
					var json = JSON.parse(data);

					assert.strictEqual(json.id, '51964caa9c253bdbb1d00fb4');
					assert.notEqual(json.name, undefined);
					assert.strictEqual(json.email, 'demo@didgeridoo.io');

					done();
				});
			};

			http.request(http_options, callback).on('error', function(e) {
				console.log('Got error: ' + e.message);
			}).end();
		});

	});


	describe('PUT /api/v1/users/:id', function() {
		it('should update user name', function(done) {
			var payload = {
			    	name: 'Jon Nieve'
			    },
			    payloadString = JSON.stringify(payload),
				callback = function(res) {
					var data = '';
					res.setEncoding('utf8');

					res.on('data', function(chunk) {
						data += chunk;
					});

					res.on('end', function() {
						var json = JSON.parse(data);

						assert.strictEqual(json.id, '51964caa9c253bdbb1d00fb4');
						assert.strictEqual(json.name, payload.name);

						done();
					});
				};

			http_options.method = 'PATCH';
			http_options.headers['Content-Length'] = payloadString.length;

			var req = http.request(http_options, callback);

			req.on('error', function(e) {
				console.log('Got error: ' + e.message);
			});

			req.write(payloadString);

			req.end();
		});

		it('should not allow updating protected attributes', function(done) {
			var payload = JSON.stringify({
			    	id: '51964caa9c253bdbb1d00fb3',
			    	email: 'something@something.com'
			    }),
				callback = function(res) {
					assert.strictEqual(res.statusCode, 403);
					done();
				};

			http_options.method = 'PATCH';
			http_options.headers['Content-Length'] = payload.length;

			var req = http.request(http_options, callback);

			req.on('error', function(e) {
				console.log('Got error: ' + e.message);
			});

			req.write(payload);

			req.end();
		});

	});


	describe('POST /api/v1/users', function() {
		it('should create a new user', function(done) {
			var payload = {
					email: Date.now() + '@didgeridoo.io',
					password: 'jonnieve',
			    	name: 'Jon Nieve'
			    },
			    payloadString = JSON.stringify(payload),
				callback = function(res) {
					var data = '';
					res.setEncoding('utf8');

					res.on('data', function(chunk) {
						data += chunk;
					});

					res.on('end', function() {
						var json = JSON.parse(data);

						assert.strictEqual(res.statusCode, 200);
						assert.strictEqual(json.name, payload.name);
						assert.strictEqual(json.email, payload.email);

						done();
					});
				};

			http_options.method = 'POST';
			http_options.path = users_endpoint;
			http_options.headers['Content-Length'] = payloadString.length;

			var req = http.request(http_options, callback);

			req.on('error', function(e) {
				console.log('Got error: ' + e.message);
			});

			req.write(payloadString);

			req.end();
		});

		it('should respond with a 422 (Unprocessable Entity) status', function(done) {
			var payload = JSON.stringify({
			    	name: 'Jon Nieve'
			    }),
				callback = function(res) {
					assert.strictEqual(res.statusCode, 422);
					done();
				};

			http_options.method = 'POST';
			http_options.path = users_endpoint;
			http_options.headers['Content-Length'] = payload.length;

			var req = http.request(http_options, callback);

			req.on('error', function(e) {
				console.log('Got error: ' + e.message);
			});

			req.write(payload);

			req.end();
		});
	});

});

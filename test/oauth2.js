var http = require('http');

//TODO: hacer peticiones al servidor siguiendo el flow del navegador y teniendo
// en cuenta que el plugin puede no estar aceptado aún.

//TODO: hacer tests de fallos intencionados y URLs raras

var host = 'http://localhost:3000',
clientID = '529cd86b14b7ac13324fe883',
redirectURI = 'http://192.168.0.192/oauth/',
loginPath = '/login',
codeEndpointURL = '/authorize?response_type=code&client_id='+clientID+'&redirect_uri='+redirectURI,
cookie;


describe('OAuth2', function() {

	beforeEach(function(done) {
		http.get(host+loginPath, function(res) {

			var querystring = require('querystring'),
			data = querystring.stringify({
				email: 'demo@didgeridoo.io',
				password: '1234'
			}),
			options = {
				hostname: 'localhost',
				port: 3000,
				path: loginPath+'?next='+encodeURIComponent(codeEndpointURL),
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(data)
				}
			};

			var req = http.request(options, function(res) {
				cookie = res.headers['set-cookie'][0];
				done();
			});

			req.on('error', function(e) {
				console.log('Got error on Login POST request: ' + e.message);
			});

			req.write(data);
			req.end();

		}).on('error', function(e) {
			console.log('Got error on login hook: ' + e.message);
		});
	});

	describe('#authorize', function() {

		it('should request for a code', function(done) {
			console.log('Sending Cookie: ' + cookie + '\n');
			var options = {
				hostname: 'localhost',
				port: 3000,
				path: codeEndpointURL,
				method: 'GET',
				headers: {
					'Cookie': cookie,
					'Accept': '/',
					'Connection': 'Keep-Alive'
				}
			};

			var req = http.request(options, function(res) {
				console.log('Got response: ' + res.statusCode);

				done()

			})

			req.on('error', function(e) {
				console.log('Got error: ' + e.message);
			});

			req.end();
		});

	});

});
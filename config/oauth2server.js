/*jslint vars:true, node:true */
"use strict";

var oauth2orize = require('oauth2orize'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    AccessToken = mongoose.model('AccessToken'),
    AuthorizationCode = mongoose.model('AuthorizationCode');

var oauth2server = oauth2orize.createServer();

oauth2server.serializeClient(function (client, done) {
	return done(null, client._id);
});

oauth2server.deserializeClient(function (_id, done) {
	Client.findById(_id, function (err, client) {
		if (err) { return done(err); }

		return done(null, client);
	});
});

oauth2server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
	var now = new Date().getTime(),
	    code = crypto.createHmac('sha1', 'access_token')
	           .update([client.id, now].join())
	           .digest('hex');

	var ac = new AuthorizationCode({
		code: code,
		client_id: client.id,
		redirect_uri: redirectURI,
		user_id: client.user_id,
		scope: ares.scope
	});

	ac.save(function (err) {
		if (err) { return done(err); }
		return done(null, code, {scope: ares.scope});
	});
}));

oauth2server.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
	AuthorizationCode.findOne({code: code}, function (err, code) {
		if (err) { return done(err); }
		if (!code || !code.client_id || !client || !client.id) { return done(null, false); }
		if (client.id.toString() !== code.client_id.toString()) { return done(null, false); }
		if (redirectURI !== code.redirect_uri) { return done(null, false); }

		var now = new Date().getTime(),
		    token = crypto.createHmac('sha1', 'access_token')
		    .update([client.id, now].join())
		    .digest('hex');


		var at = new AccessToken({
			oauth_token: token,
			user_id: code.user_id,
			client_id: client._id,
			scope: code.scope
		});

		at.save(function (err) {
			if (err) { return done(err); }
			return done(null, token, {scope: code.scope});
		});
	});
}));

module.exports = oauth2server;

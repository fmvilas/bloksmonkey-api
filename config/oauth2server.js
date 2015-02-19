/*jslint vars:true, node:true */
"use strict";

var oauth2orize = require('oauth2orize'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    AccessToken = mongoose.model('AccessToken'),
    AuthorizationCode = mongoose.model('AuthorizationCode'),
    moment = require('moment');

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

  AuthorizationCode.findOneAndUpdate({
    user_id: user.id,
    client_id: client.id
  }, {
    code: code,
    redirect_uri: redirectURI,
    scope: ares.scope
  }, {
    upsert: true
  },
  function(err, authorization_code) {
    if( err ) { return done(err); }

    return done(null, authorization_code.code, { scope: authorization_code.scope });
  });
}));

oauth2server.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
  AuthorizationCode.findOneAndRemove({ code: code }, function (err, code) {
    if( err ) { return done(err); }
    if( !code || !code.client_id || !client || !client.id ) { return done(null, false); }
    if( client.id.toString() !== code.client_id.toString() ) { return done(null, false); }
    if( redirectURI !== code.redirect_uri ) { return done(null, false); }

    var now = new Date().getTime(),
        token_hash = crypto.createHmac('sha1', 'access_token')
                      .update([client.id, now].join())
                      .digest('hex');

    AccessToken.findOneAndUpdate({
      user_id: code.user_id,
      client_id: client._id
    }, {
      oauth_token: token_hash,
      expires: moment().add(30, 'minutes').toDate(),
      scope: code.scope
    }, {
      upsert: true
    },
    function(err, access_token) {
      if( err ) { return done(err); }

      return done(null, access_token.oauth_token, { scope: access_token.scope });
    });
  });
}));

module.exports = oauth2server;

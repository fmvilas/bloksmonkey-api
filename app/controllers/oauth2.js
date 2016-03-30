/*jslint vars:true, node:true */
"use strict";

var passport = require('passport'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Client = mongoose.model('Client'),
    AuthorizationCode = mongoose.model('AuthorizationCode'),
    AccessToken = mongoose.model('AccessToken'),
    ensureLoggedIn = require('./middlewares/ensureLoggedIn'),
    validateScopes = require('./middlewares/validateScopes'),
    dbHelpers = require('../helpers/db'),
    isObjectID = dbHelpers.isObjectID;

module.exports = function(routes, passport, oauth2server) {
  return {
    authorize: [
      ensureLoggedIn,
      oauth2server.authorization(function (clientID, redirectURI, done) {
        if (!isObjectID(clientID)) {
          var err = new Error('Invalid parameter value: client_id.');
          err.status = 400;
          err.code = 'invalid_request';

          return done(err);
        }

        Client.findById(clientID, function (err, client) {
          if (err) { return done(err); }
          if (!client) { return done(null, false); }
          if (client.redirect_uri !== redirectURI) { return done(null, false); }

          return done(null, client, redirectURI);
        });
      }),
      function (req, res, next) {
        User.findById(req.user.id, function (err, user) {
          if( err ) { return next(err); }

          if( user.plugins.indexOf(req.oauth2.client._id) !== -1 ) {
            AuthorizationCode.findOne(
            {
              user_id: user._id,
              client_id: req.oauth2.client._id,
              redirect_uri: req.oauth2.redirectURI
            },
            function(err, authCode) {
              if( err ) { return next(err); }
              if( !authCode ) { return next(false); }

              var url = require('url'),
                  parsed = url.parse(req.oauth2.redirectURI, true),
                  location;

              delete parsed.search;
              parsed.query.code = authCode.code;
              location = url.format(parsed);

              res.redirect(location);
            });
          } else {
            res.render('user/allowplugin', {
              transactionID: req.oauth2.transactionID,
              plugin: req.oauth2.client,
              scopes: req.oauth2.req.scope,
              url: req.baseUrl + routes.oauth2.decision,
              csrf_token: req.csrfToken()
            });
          }
        });
      },
      oauth2server.errorHandler()
    ],


    decision: [
      ensureLoggedIn,
      validateScopes,
      oauth2server.decision(function(req, done) {
        if( !req.body.cancel ) {
          User.findByIdAndUpdate(
              req.user.id,
              {
                $addToSet: {
                  plugins: req.oauth2.req.clientID
                }
              },
              function (err, user) {
                return done(err, {scope: req.body.scope});
              }
          );
        } else {
          done();
        }
      }),
      oauth2server.errorHandler()
    ],


    token: [
      passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
      oauth2server.token(),
      oauth2server.errorHandler()
    ]
  };
};

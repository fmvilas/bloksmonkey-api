/*jslint vars:true, node:true */
"use strict";

var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    LocalStrategy = require('passport-local').Strategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Client = mongoose.model('Client'),
    AccessToken = mongoose.model('AccessToken');


// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new BasicStrategy({
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function (req, client_id, password, done) {
    Client.findById(client_id, function (err, client) {
      // if there are any errors, return the error before anything else
      if (err) { return done(err); }

      // if no client is found, return the message
      if (!client) {
        return done(null, false, req.flash('loginMessage', 'No client found.'));
      }

      // if the client is found but the password is wrong
      client.comparePassword(password, function(err) {
        if (err) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        }

        // all is well, return successful client
        return done(null, client);
      });
    });
  }
));

passport.use('local', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function (req, email, password, done) { // callback with email and password from our form
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'email':  email }, function (err, user) {
      // if there are any errors, return the error before anything else
      if (err) { return done(err); }

      // if no user is found, return the message
      if (!user) {
        return done(req.i18n.t('session.login_failed'), null);
      }

      // if user is not confirmed, return the message
      if (!user.is_confirmed) {
        return done(req.i18n.t('session.email_not_confirmed'), null);
      }

      // if the user is found but the password is wrong
      user.comparePassword(password, function(err, isMatch) {
        if( err ) { return done(err, null); }
        if( !isMatch ) { return done(null, false); }

        // all is well, return successful user
        return done(null, user);
      });
    });
  })
);

passport.use(new ClientPasswordStrategy(
  function(clientId, clientSecret, done) {
    Client.findById(clientId, function (err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.secret !== clientSecret) { return done(null, false); }

      return done(null, client);
    });
  }
));

passport.use(new BearerStrategy(
  function (accessToken, done) {
    AccessToken.findOne({oauth_token: accessToken}, function (err, token) {
      if (err) { return done(err); }
      if (!token) { return done(null, false); }

      User.findById(token.user_id, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }

        var info = {
          scope: token.scope || ''
        };

        done(null, user, info);
      });
    });
  }
));

module.exports = passport;

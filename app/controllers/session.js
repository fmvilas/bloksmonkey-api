/*jslint vars:true, node:true */
"use strict";

var SessionService = require('../services/session/session'),
    service,
    _ = require('underscore'),
    withErrorResponse = require('../mixins/withErrorResponse'),
    SessionControllerStatic;

SessionControllerStatic = {};

_.extend(SessionControllerStatic, withErrorResponse);

/**
 * Renders a form for login
 */
SessionControllerStatic.new = function (req, res, next) {
  var self = this,
      next_url = req.query.next || self.config.routes.app,
      view_data,
      error_message;

  error_message = req.flash('error_message');
  if( error_message && error_message.length ) {
    error_message = error_message[0];
  } else {
    error_message = null;
  }

  view_data = {
    next_url: next_url,
    error_message: error_message,
    csrf_token: req.csrfToken()
  };

  // render the page and pass in any flash data if it exists
  res.render('session/login', view_data);
};

/**
 * Performs login
 */
SessionControllerStatic.create = function (req, res, next) {
  var self = this;
  self.service.create(req.body, { login: req.logIn.bind(req), next_url: req.query.next }, function(err, url) {
    if( err ) {
      var view_data = {
        memento: {
          email: req.body.email
        },
        next_url: req.query.next,
        error_messages: {},
        csrf_token: req.csrfToken()
      };

      if( err.errors ) {
        for(var field in err.errors) {
          view_data.error_messages[field] = err.errors[field].message;
        }
      } else if( err.status === 404 ) {
        view_data.error_message = req.i18n.t('session.login_failed');
      }

      return res.render('session/login', view_data);
    }

    res.redirect(url);
  })(req, res, next);
};

/**
 * Displays a page to logout
 */
SessionControllerStatic.remove = function (req, res, next) {
  res.render('session/logout', {
    next_url: req.query.next,
    csrf_token: req.csrfToken()
  });
};

/**
 * Performs logout
 */
SessionControllerStatic.destroy = function (req, res, next) {
  var self = this,
      next_url = req.query.next || self.config.routes.session.login;

  req.logout();
  res.redirect(next_url);
};

/**
 * Checks if user is already logged in
 */
SessionControllerStatic.check_logged_in = function (req, res, next) {
  var self = this,
      next_url = req.query.next || self.config.routes.app;

  if( req.isAuthenticated() ) {
    res.redirect(next_url);
  }

  next();
};


function SessionController (routes, passport, oauth2server) {
  this.config = {
    routes: routes,
    passport: passport,
    oauth2server: oauth2server
  };

  this.service = new SessionService({
    passport: passport,
    routes: routes
  });

  this.new = [
    SessionControllerStatic.check_logged_in.bind(this),
    SessionControllerStatic.new.bind(this)
  ];

  this.create = [
    SessionControllerStatic.check_logged_in.bind(this),
    SessionControllerStatic.create.bind(this)
  ];

  this.remove = [
    SessionControllerStatic.remove.bind(this)
  ];

  this.destroy = [
    SessionControllerStatic.destroy.bind(this)
  ];
}

module.exports = SessionController;

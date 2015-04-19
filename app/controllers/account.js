/*jslint vars:true, node:true */
"use strict";

var AccountService = require('../services/account/account'),
    mongoose = require('mongoose'),
    service = new AccountService(mongoose.connection),
    _ = require('underscore'),
    withErrorResponse = require('../mixins/withErrorResponse'),
    AccountControllerStatic;

AccountControllerStatic = {};

_.extend(AccountControllerStatic, withErrorResponse);

/**
 * Renders a form for signup
 */
AccountControllerStatic.new = function (req, res, next) {
  var self = this;
  res.render('account/new', {
    csrf_token: req.csrfToken(),
    next_url: self.config.routes.app
  });
};

/**
 * Creates an account
 */
AccountControllerStatic.create = function (req, res, next) {
  var self = this;
  service.create(req.body, function (err, user) {
    if( err ) {
      var view_data = {
        memento: {
          name: req.body.name,
          email: req.body.email
        },
        error_messages: {},
        csrf_token: req.csrfToken(),
        next_url: self.config.routes.app
      };

      if( err.errors ) {
        for(var field in err.errors) {
          view_data.error_messages[field] = err.errors[field].message;
        }
      }

      res.render('account/new', view_data);
    } else {
      AccountControllerStatic.send_email.call(this, req, res, next);
    }
  });
};

/**
 * Send Email
 */
AccountControllerStatic.send_email = function (req, res, next) {
  var self = this;
  service.send_email(req.body, function (err, user) {
    if( err ) {
      var view_data = {
        memento: {
          email: req.body.email
        },
        error_message: err.message,
        csrf_token: req.csrfToken(),
        next_url: self.config.routes.app
      };

      return res.render('account/email_sent', view_data);
    }

    return res.render('account/email_sent', user);
  });
};

/**
 * Confirms email
 */
AccountControllerStatic.confirm_email = function (req, res, next) {
  var self = this;
  service.confirm_email(req.query, function (err, user) {
    if( err ) { return res.render('account/error/confirm_email'); }
    return res.render('account/confirmed_email');
  });
};

/**
 * Displays "forgot password" page
 */
AccountControllerStatic.forgot_password_view = function (req, res, next) {
  res.render('account/forgot_password', {
    csrf_token: req.csrfToken()
  });
};

/**
 * Sends an email to reset the password
 */
AccountControllerStatic.send_reset_password_email = function (req, res, next) {
  var self = this;
  service.send_reset_password_email(req.body, function (err, user) {
    if( err ) {
      var view_data = {
        memento: {
          email: req.body.email
        },
        error_message: err.message,
        csrf_token: req.csrfToken(),
        next_url: self.config.routes.app
      };

      return res.render('account/error/send_reset_password_email', view_data);
    }

    return res.render('account/reset_password_email_sent', user);
  });
};

/**
 * Displays "reset password" page
 */
AccountControllerStatic.reset_password_view = function (req, res, next) {
  var self = this;
  service.verify_reset_password(req.query, function (err, user) {
    if( err ) { return res.render('account/error/bad_reset_password_token'); }

    res.render('account/reset_password', {
      email: req.query.email,
      token: req.query.token,
      csrf_token: req.csrfToken()
    });
  });
};

/**
 * Resets password
 */
AccountControllerStatic.reset_password = function (req, res, next) {
  var self = this;
  service.reset_password(req.body, function (err, user) {
    if( err ) { return res.render('account/error/reset_password'); }
    return res.render('account/reset_password_success');
  });
};


function AccountController (routes, passport, oauth2server) {
  this.config = {
    routes: routes,
    passport: passport,
    oauth2server: oauth2server
  };

  for(var method in AccountControllerStatic) {
    this[method] = [AccountControllerStatic[method].bind(this)];
  }
}

module.exports = AccountController;

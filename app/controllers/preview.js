/*jslint vars:true, node:true */
"use strict";

var PreviewControllerStatic = {};

PreviewControllerStatic.index = function (req, res, next) {
  res.render('preview/index', {
    links: this.config.routes.preview
  });
};

PreviewControllerStatic.login = function (req, res, next) {
  res.render('session/login');
};

PreviewControllerStatic.logout = function (req, res, next) {
  res.render('session/logout');
};

PreviewControllerStatic.signup = function (req, res, next) {
  res.render('account/new', {
    routes: this.config.routes
  });
};

PreviewControllerStatic.signup_email_sent = function (req, res, next) {
  res.render('account/email_sent');
};

PreviewControllerStatic.confirmed_email = function (req, res, next) {
  res.render('account/confirmed_email');
};

PreviewControllerStatic.confirm_email_error = function (req, res, next) {
  res.render('account/error/confirm_email');
};

PreviewControllerStatic.forgot_password = function (req, res, next) {
  res.render('account/forgot_password');
};

PreviewControllerStatic.forgot_password_email_sent = function (req, res, next) {
  res.render('account/reset_password_email_sent');
};

PreviewControllerStatic.forgot_password_email_error = function (req, res, next) {
  res.render('account/error/send_reset_password_email');
};

PreviewControllerStatic.reset_password = function (req, res, next) {
  res.render('account/reset_password', {
    email: 'test@email.com'
  });
};

PreviewControllerStatic.reset_password_bad_token = function (req, res, next) {
  res.render('account/error/bad_reset_password_token');
};

PreviewControllerStatic.reset_password_sucess = function (req, res, next) {
  res.render('account/reset_password_success');
};

PreviewControllerStatic.not_found = function (req, res, next) {
  res.render('404');
};

PreviewControllerStatic.unexpected_error = function (req, res, next) {
  res.render('500');
};

PreviewControllerStatic.allow_plugin = function (req, res, next) {
  res.render('session/allowplugin', {
    plugin: {
      name: 'Redbooth Plugin'
    },
    scopes: ['user', 'project']
  });
};


function PreviewController (routes, passport, oauth2server) {
  this.config = {
    routes: routes,
    passport: passport,
    oauth2server: oauth2server
  };

  for(var method in PreviewControllerStatic) {
    this[method] = [PreviewControllerStatic[method].bind(this)];
  }
}

module.exports = PreviewController;

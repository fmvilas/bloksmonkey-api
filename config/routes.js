/*jslint vars:true, unparam:true, node:true */
"use strict";

module.exports = function(app, passport, oauth2server){
  var express = require('express'),
      routes = require('./route_table'),
      UserController = require('../app/controllers/user'),
      ProjectController = require('../app/controllers/project'),
      FileController = require('../app/controllers/file'),
      AccountController = require('../app/controllers/account'),
      SessionController = require('../app/controllers/session'),
      PreviewController = require('../app/controllers/preview'),
      api = express.Router();

  // Account routes
  var account = new AccountController(routes, passport, oauth2server);
  app.get(routes.account.new, account.new);
  app.post(routes.account.new, account.create);
  app.post(routes.account.send_email, account.send_email);
  app.get(routes.account.confirm_email, account.confirm_email);
  app.get(routes.account.forgot_password, account.forgot_password_view);
  app.post(routes.account.forgot_password, account.send_reset_password_email);
  app.get(routes.account.reset_password, account.reset_password_view);
  app.post(routes.account.reset_password, account.reset_password);

  // Session routes
  var session = new SessionController(routes, passport, oauth2server);
  app.get(routes.session.login, session.new);
  app.post(routes.session.login, session.create);
  app.get(routes.session.logout, session.remove);
  app.post(routes.session.logout, session.destroy);

  // Preview routes
  var preview = new PreviewController(routes, passport, oauth2server);
  app.get(routes.preview.index, preview.index);
  app.get(routes.preview.login, preview.login);
  app.get(routes.preview.logout, preview.logout);
  app.get(routes.preview.signup, preview.signup);
  app.get(routes.preview.signup_email_sent, preview.signup_email_sent);
  app.get(routes.preview.confirmed_email, preview.confirmed_email);
  app.get(routes.preview.confirm_email_error, preview.confirm_email_error);
  app.get(routes.preview.forgot_password, preview.forgot_password);
  app.get(routes.preview.forgot_password_email_sent, preview.forgot_password_email_sent);
  app.get(routes.preview.forgot_password_email_error, preview.forgot_password_email_error);
  app.get(routes.preview.reset_password, preview.reset_password);
  app.get(routes.preview.reset_password_bad_token, preview.reset_password_bad_token);
  app.get(routes.preview.reset_password_sucess, preview.reset_password_sucess);
  app.get(routes.preview.not_found, preview.not_found);
  app.get(routes.preview.unexpected_error, preview.unexpected_error);
  app.get(routes.preview.allow_plugin, preview.allow_plugin);

  // User routes
  var user = new UserController(routes, passport, oauth2server);
  api.get(routes.user.single, user.show);
  api.patch(routes.user.single, user.update);

  // Project routes
  var project = new ProjectController(routes, passport, oauth2server);
  api.get(routes.project.collection, project.list);
  api.get(routes.project.single, project.show);
  api.post(routes.project.collection, project.create);
  api.patch(routes.project.single, project.update);
  api.delete(routes.project.single, project.remove);

  // File routes
  var file = new FileController(routes, passport, oauth2server);
  api.get(routes.file.content, file.show_content);
  api.get(routes.file.single, file.show);
  api.get(routes.file.collection, file.list);
  api.post(routes.file.content, file.create_with_content);
  api.patch(routes.file.single, file.update);
  api.post(routes.file.collection, file.create);
  api.put(routes.file.content, file.update_content);
  api.delete(routes.file.single, file.remove);


  // OAuth2 routes
  var oauth2 = require('../app/controllers/oauth2')(routes, passport, oauth2server);
  api.get(routes.oauth2.authorize, oauth2.authorize);
  api.post(routes.oauth2.decision, oauth2.decision);
  api.post(routes.oauth2.token, oauth2.token);

  app.use(routes.root, api);

  return routes;
};

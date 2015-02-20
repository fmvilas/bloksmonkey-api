/*jslint vars:true, unparam:true, node:true */
"use strict";

module.exports = function(app, passport, oauth2server){
  var express = require('express'),
      routes = require('./route_table'),
      api = express.Router();

  // Session routes
  var session = require('../app/controllers/session')(routes, passport, oauth2server);
  api.get(routes.session.login, session.login);
  api.post(routes.session.login, session.logon);
  api.post(routes.session.logout, session.logout);

  // User routes
  var user = require('../app/controllers/user')(routes, passport, oauth2server);
  api.get(routes.user.single, user.show);
  api.patch(routes.user.single, user.update);

  // Project routes
  var project = require('../app/controllers/project')(routes, passport, oauth2server);
  api.get(routes.project.collection, project.list);
  api.get(routes.project.single, project.show);
  api.post(routes.project.collection, project.create);
  api.patch(routes.project.single, project.update);
  api.delete(routes.project.single, project.remove);


  // OAuth2 routes
  var oauth2 = require('../app/controllers/oauth2')(routes, passport, oauth2server);
  api.get(routes.oauth2.authorize, oauth2.authorize);
  api.post(routes.oauth2.decision, oauth2.decision);
  api.post(routes.oauth2.token, oauth2.token);

  app.use(routes.root, api);

  return routes;
};

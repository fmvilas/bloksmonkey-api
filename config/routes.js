/*jslint vars:true, unparam:true, node:true */
"use strict";

module.exports = function(app, passport, oauth2server){
  var express = require('express'),
      routes = require('./route_table'),
      UserController = require('../app/controllers/user'),
      ProjectController = require('../app/controllers/project'),
      FileController = require('../app/controllers/file'),
      api = express.Router();

  // Session routes
  var session = require('../app/controllers/session')(routes, passport, oauth2server);
  api.get(routes.session.login, session.login);
  api.post(routes.session.login, session.logon);
  api.post(routes.session.logout, session.logout);

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

  app.use(function(req, res) {
    res.status(404).render('404');
  });

  return routes;
};

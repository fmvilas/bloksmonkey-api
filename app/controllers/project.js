/*jslint vars:true, node:true */
"use strict";

var ProjectService = require('../services/project/project'),
    mongoose = require('mongoose'),
    service = new ProjectService(mongoose.connection),
    _ = require('underscore'),
    withErrorResponse = require('../mixins/withErrorResponse'),
    hasScope = require('./middlewares/hasScope'),
    ProjectControllerStatic;

ProjectControllerStatic = {};

_.extend(ProjectControllerStatic, withErrorResponse);

/**
 * Sends a list of projects.
 * GET /api/v1/projects
 */
ProjectControllerStatic.list = function (req, res, next) {
  var self = this;
  service.list(_.extend(req.query, { user_id: req.user.id }), function(err, projects) {
    if( err ) { return self.respondWithError(err, res); }
    return res.json(projects);
  });
};

/**
 * Sends the project.
 * GET /api/v1/projects/:id
 */
ProjectControllerStatic.show = function (req, res, next) {
  var self = this;
  service.find(_.extend(req.query, req.params, { user_id: req.user.id }), function(err, project) {
    if( err ) { return self.respondWithError(err, res); }
    return res.json(project);
  });
};

/**
 * Updates a project and sends it.
 * PATCH /api/v1/projects/:id
 */
ProjectControllerStatic.update = function (req, res, next) {
  var self = this;
  service.update(_.extend(req.params, { user_id: req.user.id }), req.body, function(err, project) {
    if( err ) { return self.respondWithError(err, res); }
    return res.json(project);
  });
};

/**
 * Creates a project and sends it.
 * POST /api/v1/projects
 */
ProjectControllerStatic.create = function (req, res, next) {
  var self = this;
  service.create(req.body, function(err, project) {
    if( err ) { return self.respondWithError(err, res); }
    return res.json(project);
  });
};

/**
 * Deletes a project.
 * DELETE /api/v1/projects/:id
 */
ProjectControllerStatic.remove = function (req, res, next) {
  var self = this;
  service.remove(_.extend(req.params, { user_id: req.user.id }), function(err, project) {
    if( err ) { return self.respondWithError(err, res); }
    return res.json(project);
  });
};

function ProjectController(routes, passport, oauth2server) {
  this.config = {
    routes: routes,
    passport: passport,
    oauth2server: oauth2server
  };

  this.list = [
    this.config.passport.authenticate('bearer', { session: false }),
    hasScope(['project_read', 'project']),
    ProjectControllerStatic.list.bind(ProjectControllerStatic)
  ];

  this.show = [
    this.config.passport.authenticate('bearer', { session: false }),
    hasScope(['project_read', 'project']),
    ProjectControllerStatic.show.bind(ProjectControllerStatic)
  ];

  this.create = [
    this.config.passport.authenticate('bearer', { session: false }),
    hasScope(['project']),
    ProjectControllerStatic.create.bind(ProjectControllerStatic)
  ];

  this.update = [
    this.config.passport.authenticate('bearer', { session: false }),
    hasScope(['project']),
    ProjectControllerStatic.update.bind(ProjectControllerStatic)
  ];

  this.remove = [
    this.config.passport.authenticate('bearer', { session: false }),
    hasScope(['project']),
    ProjectControllerStatic.remove.bind(ProjectControllerStatic)
  ];
}

module.exports = ProjectController;

/*jslint vars:true, node:true */
"use strict";

var FileService = require('../services/file/file'),
    mongoose = require('mongoose'),
    checkHasScope = require('../helpers/auth').checkHasScope,
    service = new FileService({ db: mongoose.connection }),
    _ = require('underscore'),
    withErrorResponse = require('./mixins/withErrorResponse');

var FileControllerStatic = {};

_.extend(FileControllerStatic, withErrorResponse);

/**
 * Sends a list of files.
 * GET /api/v1/projects/:project_id/files
 */
FileControllerStatic.list = function (req, res, next) {
  var self = this;
  service.list(req.query, function(err, files) {
    if( err ) { return self.respondWithError(err, res); }
    return res.json(files);
  });
};

/**
 * Sends the file.
 * GET /api/v1/projects/:project_id/files/:name
 */
FileControllerStatic.show = function (req, res, next) {
  var self = this;
  service.find(_.extend(req.query, req.params), function(err, file) {
    if( err ) { return self.respondWithError(err, res); }
    return res.json(file);
  });
};

/**
 * Sends the raw content for a file.
 * GET /api/v1/projects/:project_id/files/:name/content
 */
FileControllerStatic.show_content = function (req, res, next) {
  var self = this;
  service.content(_.extend(req.query, req.params), function(err, file) {
    if( err ) { return self.respondWithError(err, res); }

    file.stream.on('error', function(err, response) {
      if( err.statusCode === 404 ) { return self.respondWithError({ status: err.statusCode, message: 'File does not exist.'}, res ); }
      return self.respondWithError({ status: err.statusCode || 500, message: 'Unexpected Error.'}, res );
    });

    return file.stream.pipe(res);
  });
};

/**
 * Updates a file and sends it.
 * PATCH /api/v1/projects/:project_id/files/:name
 */
FileControllerStatic.update = function (req, res, next) {
  var self = this;
  service.update(
    _.extend(req.query, req.params, { user_id: req.user.id }),
    req.body,
    function(err, file) {
      if( err ) { return self.respondWithError(err, res); }
      return res.json(file);
    });
};

/**
 * Updates a file content.
 * PUT /api/v1/projects/:project_id/files/:name/content
 */
FileControllerStatic.update_content = function (req, res, next) {
  var self = this;
  service.update_content(
    _.extend(req.query, req.params),
    req.body,
    function(err, file) {
      if( err ) { return self.respondWithError(err, res); }
      return res.json(file);
    });
};

/**
 * Creates an empty file.
 * POST /api/v1/projects/:project_id/files?name=:name
 */
FileControllerStatic.create = function (req, res, next) {
  var self = this;
  service.create(_.extend(req.body, req.params, { user_id: req.user.id }), function(err, file) {
    if( err ) { return self.respondWithError(err, res); }
    return res.status(201).json(file);
  });
};

/**
 * Creates a file and initializes it with a content.
 * POST /api/v1/projects/:project_id/files/:name/content
 */
FileControllerStatic.create_with_content = function (req, res, next) {
  var self = this;
  service.create_with_content(
    _.extend(req.query, req.params, { user_id: req.user.id }),
    req.body,
    function(err, file) {
      if( err ) { return self.respondWithError(err, res); }
      return res.status(201).json(file);
    });
};

/**
 * Deletes a file.
 * DELETE /api/v1/projects/:project_id/files/:name
 */
FileControllerStatic.remove = function (req, res, next) {
  var self = this;
  service.remove(
    _.extend(req.query, req.params),
    function(err, file) {
      if( err ) { return self.respondWithError(err, res); }
      return res.json(file);
    });
};

function FileController(routes, passport, oauth2server) {
  this.config = {
    routes: routes,
    passport: passport,
    oauth2server: oauth2server
  };

  this.list = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project_read', 'project']),
    FileControllerStatic.list.bind(FileControllerStatic)
  ];

  this.show = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project_read', 'project']),
    FileControllerStatic.show.bind(FileControllerStatic)
  ];

  this.show_content = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project_read', 'project']),
    FileControllerStatic.show_content.bind(FileControllerStatic)
  ];

  this.create = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project']),
    FileControllerStatic.create.bind(FileControllerStatic)
  ];

  this.create_with_content = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project']),
    FileControllerStatic.create_with_content.bind(FileControllerStatic)
  ];

  this.update = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project']),
    FileControllerStatic.update.bind(FileControllerStatic)
  ];

  this.update_content = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project']),
    FileControllerStatic.update_content.bind(FileControllerStatic)
  ];

  this.remove = [
    this.config.passport.authenticate('bearer', { session: false }),
    checkHasScope(['project']),
    FileControllerStatic.remove.bind(FileControllerStatic)
  ];
}

module.exports = FileController;

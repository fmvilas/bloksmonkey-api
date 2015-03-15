/*jslint vars:true, node:true */
"use strict";

var FileService = require('../services/file/file'),
    mongoose = require('mongoose'),
    checkHasScope = require('../helpers/auth').checkHasScope,
    service = new FileService(mongoose.connection),
    _ = require('underscore'),
    fs = require('fs');


function respondWithError(err, res) {
  var res_info = {
    status: err.status,
    message: err.message
  };

  if( err.errors ) { res_info.errors = err.errors; }
  if( err.warnings ) { res_info.warnings = err.warnings; }

  res.status(err.status).json(res_info);
}


module.exports = function(routes, passport, oauth2server) {

  /**
   * Sends a list of files.
   * GET /api/v1/projects/:project_id/files
   */
  var list = function (req, res, next) {
    try {
      service.list(req.query, function(err, files) {
        return res.json(files);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  /**
   * Sends the file.
   * GET /api/v1/projects/:project_id/files/:name
   */
  var show = function (req, res, next) {
    try {
      service.find(_.extend(req.query, req.params), function(file) {
        return res.json(file);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  /**
   * Sends the raw content for a file.
   * GET /api/v1/projects/:project_id/files/:name/content
   */
  var show_content = function (req, res, next) {
    service.content(_.extend(req.query, req.params), function(err, file) {
      if( err ) { return respondWithError(err, res); }

      file.stream.on('error', function(err, response) {
        if( err.statusCode === 404 ) { return respondWithError({ status: err.statusCode, message: 'File does not exist.'}, res ); }

        return respondWithError({ status: err.statusCode || 500, message: 'Unexpected Error.'}, res );
      });

      return file.stream.pipe(res);
    });
  };

  /**
   * Creates an empty file.
   * POST /api/v1/projects/:project_id/files?name=:name
   */
  var create = function (req, res, next) {
    service.create(_.extend(req.body, req.params, { user_id: req.user.id }), function(err, file) {
      if( err ) { return respondWithError(err, res); }

      return res.status(201).json(file);
    });
  };

  /**
   * Creates a file and initializes it with a content.
   * POST /api/v1/projects/:project_id/files/:name/content
   */
  var create_with_content = function (req, res, next) {
    service.create_with_content(
      _.extend(req.query, req.params, { user_id: req.user.id }),
      req.body,
      function(err, file) {
        if( err ) { return respondWithError(err, res); }

        return res.status(201).json(file);
      });
  };

  /**
   * Updates a file and sends it.
   * PATCH /api/v1/projects/:project_id/files/:name
   */
  var update = function (req, res, next) {
    service.update(
      _.extend(req.query, req.params, { user_id: req.user.id }),
      req.body,
      function(err, file) {
        if( err ) { return respondWithError(err, res); }

        return res.json(file);
      });
  };

  /**
   * Updates a file content.
   * PUT /api/v1/projects/:project_id/files/:name/content
   */
  var update_content = function (req, res, next) {
    service.update_content(
      _.extend(req.query, req.params),
      req.body,
      function(err, file) {
        if( err ) { return respondWithError(err, res); }

        return res.json(file);
      });
  };

  /**
   * Deletes a file.
   * DELETE /api/v1/projects/:project_id/files/:name
   */
  var remove = function (req, res, next) {
    service.remove(
      _.extend(req.query, req.params),
      function(err, file) {
        if( err ) { return respondWithError(err, res); }

        return res.json(file);
      });
  };

  return {
    list: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files_read', 'project_files']),
      list
    ],
    show: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files_read', 'project_files']),
      show
    ],
    show_content: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files_read', 'project_files']),
      show_content
    ],
    create: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files']),
      create
    ],
    create_with_content: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files']),
      create_with_content
    ],
    update: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files']),
      update
    ],
    update_content: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files']),
      update_content
    ],
    remove: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_files']),
      remove
    ]
  };
};

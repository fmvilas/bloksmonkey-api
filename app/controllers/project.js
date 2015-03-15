/*jslint vars:true, node:true */
"use strict";

var ProjectService = require('../services/project/project'),
    mongoose = require('mongoose'),
    checkHasScope = require('../helpers/auth').checkHasScope,
    service = new ProjectService(mongoose.connection),
    _ = require('underscore');


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
   * Sends a list of projects.
   * GET /api/v1/projects
   */
  var list = function (req, res, next) {
    try {
      //TODO: default user_id is logged in user and merge with req.query.
      //Remember that in this case, req.query.user_id should take precedence over session user.
      //But, if user is different than logged in, this should only retrieve public projects.
      /*var params = {
        user_id: req.session.user_id
      };*/
      service.list(req.query, function(projects) {
        return res.json(projects);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  /**
   * Sends the project.
   * GET /api/v1/projects/:id
   */
  var show = function (req, res, next) {
    try {
      service.find(_.extend(req.query, req.params), function(project) {
        return res.json(project);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  /**
   * Updates a project and sends it.
   * PATCH /api/v1/projects/:id
   */
  var update = function (req, res, next) {
    try {
      service.update(req.params, req.body, function(project) {
        return res.json(project);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  /**
   * Creates a project and sends it.
   * POST /api/v1/projects
   */
  var create = function (req, res, next) {
    try {
      service.create(req.body, function(project) {
        return res.json(project);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  /**
   * Deletes a project.
   * DELETE /api/v1/projects/:id
   */
  var remove = function (req, res, next) {
    try {
      service.remove(req.params, function(project) {
        return res.json(project);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  return {
    list: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_read', 'project']),
      list
    ],
    show: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project_read', 'project']),
      show
    ],
    create: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project']),
      create
    ],
    update: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project']),
      update
    ],
    remove: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['project']),
      remove
    ]
  };
};

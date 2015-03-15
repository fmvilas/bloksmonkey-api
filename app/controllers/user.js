/*jslint vars:true, node:true */
"use strict";

var UserService = require('../services/user/user'),
    mongoose = require('mongoose'),
    checkHasScope = require('../helpers/auth').checkHasScope,
    service = new UserService(mongoose.connection);


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
   * Sends the user.
   * GET /api/v1/users/:id
   */
  var show = function (req, res, next) {
    try {
      service.find(req.params, function(user) {
        return res.json(user);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  /**
   * Updates a user and sends it.
   * PATCH /api/v1/users/:id
   */
  var update = function (req, res, next) {
    try {
      service.update(req.params, req.body, function(user) {
        return res.json(user);
      });
    } catch(e) {
      return respondWithError(e, res);
    }
  };

  return {
    show: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['user_info', 'user']),
      show
    ],
    update: [
      passport.authenticate('bearer', { session: false }),
      checkHasScope(['user']),
      update
    ]
  };
};

/*jslint vars:true, node:true */
"use strict";

var UserService = require('../services/user/user'),
    mongoose = require('mongoose'),
    service = new UserService(mongoose.connection),
    _ = require('underscore'),
    withErrorResponse = require('../mixins/withErrorResponse'),
    hasScope = require('./middlewares/hasScope'),
    UserControllerStatic;

UserControllerStatic = {};

_.extend(UserControllerStatic, withErrorResponse);

/**
 * Sends the user.
 * GET /api/v1/users/:id
 */
UserControllerStatic.show = function (req, res, next) {
  var self = this;
  service.find(req.params, function(err, user) {
    if( err ) return self.respondWithError(err, res);
    return res.json(user);
  });
};

/**
 * Updates a user and sends it.
 * PATCH /api/v1/users/:id
 */
UserControllerStatic.update = function (req, res, next) {
  var self = this;
  service.update(req.params, req.body, function(err, user) {
    if( err ) return self.respondWithError(err, res);
    return res.json(user);
  });
};

function UserController (routes, passport, oauth2server) {
  this.config = {
    routes: routes,
    passport: passport,
    oauth2server: oauth2server
  };

  this.show = [
    this.config.passport.authenticate('bearer', { session: false }),
    hasScope(['user_info', 'user']),
    UserControllerStatic.show.bind(UserControllerStatic)
  ];

  this.update = [
    this.config.passport.authenticate('bearer', { session: false }),
    hasScope(['user']),
    UserControllerStatic.update.bind(UserControllerStatic)
  ];
}

module.exports = UserController;

/*jslint vars:true, unparam:true, node:true */
"use strict";

var valid_scopes = require('../../../config/oauth2_scopes');

module.exports = function validateScopes (req, res, next) {
  var has_error = false,
      scopes,
      i;

  if( req.body.scope.match(/[^a-z_\s]+/) ) { has_error = true; }
  scopes = req.body.scope.split(' ');

  for(i = 0; i < scopes.length && has_error === false; i++) {
    if( valid_scopes.indexOf(scopes[i]) === -1 ) { has_error = true; }
  }

  if( has_error ) {
    var err = new Error('Invalid parameter value: scope.');
    err.status = 400;
    err.code = 'invalid_request';

    return next(err);
  }

  return next();
};

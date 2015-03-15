/*jslint vars:true, unparam:true, node:true */
"use strict";

var routes = require('../../config/route_table');

module.exports = {
  ensureLoggedIn: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.redirect(routes.root + routes.session.login + '?next='+encodeURIComponent(req.url));
    }
  },

  validateScopes: function(req, res, next) {
    var has_error = false,
        valid_scopes = ['user', 'project', 'delete_project'],
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
  },

  checkHasScope: function(scopes) {
    return function(req, res, next) {
      var regex,
          has_scope = false;

      for(var i = 0; i < scopes.length && !has_scope; i++) {
        regex = new RegExp('(^'+scopes[i]+'[\\s$])|(\\s'+scopes[i]+'\\s)|(\\s'+scopes[i]+'$)');
        has_scope = req.authInfo && req.authInfo.scope && req.authInfo.scope.match(regex);
      }

      if( !has_scope ) {
        var err = new Error('Missing required scope/s <'+scopes.join(', ')+'>.');
        err.status = 403;
        err.code = 'forbidden_request';
        return next(err);
      }

      return next();
    };
  }
};

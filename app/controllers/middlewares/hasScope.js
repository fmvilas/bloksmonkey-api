/*jslint vars:true, unparam:true, node:true */
"use strict";

function hasScope (scopes) {
  return function(req, res, next) {
    var regex,
        has_scope = false,
        i;

    for(i = 0; i < scopes.length && !has_scope; i++) {
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

module.exports = hasScope;

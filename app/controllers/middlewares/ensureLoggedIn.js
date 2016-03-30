/*jslint vars:true, unparam:true, node:true */
"use strict";

var routes = require('../../../config/route_table');

module.exports = function ensureLoggedIn (req, res, next) {
  if (req.isAuthenticated()) return next();

  return res.redirect(routes.root + routes.session.login + '?next='+encodeURIComponent(req.baseUrl + req.url));
};

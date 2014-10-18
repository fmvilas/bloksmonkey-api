/*jslint vars:true, unparam:true, node:true */
"use strict";

module.exports = function(app, passport, oauth2server){
	var routes = require('./route_table');

	// User routes
	var user = require('../app/controllers/user')(routes, passport, oauth2server);
	app.get(routes.user.login, user.login);
	app.post(routes.user.login, user.logon);
	app.get(routes.user.logout, user.logout);
	app.get(routes.user.item, user.show);


	// OAuth2 routes
	var oauth2 = require('../app/controllers/oauth2')(routes, passport, oauth2server);
	app.get(routes.oauth2.authorize, oauth2.authorize);
	app.post(routes.oauth2.decision, oauth2.decision);
	app.post(routes.oauth2.token, oauth2.token);

	return routes;
};

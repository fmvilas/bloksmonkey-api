/*jslint vars:true, unparam:true, node:true */
"use strict";

var express = require('express'),
	passport = require('passport'),
	MemoryStore = express.session.MemoryStore;

module.exports = function(app, config) {
	app.configure(function () {
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		app.use(express.compress());
		app.use(express.static(config.root + '/public'));
		app.set('port', config.port);
		app.set('views', config.root + '/app/views');
		app.set('view engine', 'jade');
		app.locals.pretty = true;
		app.locals.errors = {};
		app.locals.message = {};
		app.locals.layout = false;
		app.locals.routes = require('./route_table');
		app.use(express.favicon(config.root + '/public/favicon.png'));
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(express.cookieParser());
		app.use(express.methodOverride());
		app.use(express.session({store: new MemoryStore({reapInterval: 5 * 60 * 1000}), secret: 'abracadabra'}));
		app.use(passport.initialize());
		app.use(app.router);
		app.use(function(req, res, next) {
			res.setHeader("Access-Control-Allow-Origin", "*");
			return next();
		});
		app.use(function(req, res) {
			res.status(404).render('404', { title: '404' });
		});
	});
};

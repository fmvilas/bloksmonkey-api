/*jslint vars:true, node:true */
"use strict";

var Static = {},
	User = require('../models/user'),
	json_tpl = require('json-tpl'),
	tpl;

Static.error500 = function(err, res) {
	res.status(500).json({
		status: 500,
		message: err.message
	});
};

module.exports = function(routes, passport, oauth2server) {
	var show = function (req, res, next) {
		tpl = require('../templates/json/user');

		User.findById(req.params.id, function(err, user) {
			if (err) { return Static.error500(err, res); }

			res.json(json_tpl.parse(tpl.show, user));
		});
	};

	var create = function (req, res, next) {
		var new_user;

		tpl = require('../templates/json/user');
		new_user = json_tpl.parse(tpl.create, req.body);

		User.create(new_user, function(err, user) {
			if (err) { return Static.error500(err, res); }

			res.json(json_tpl.parse(tpl.show, user));
		});
	};

	return {
		show: [
			//passport.authenticate('bearer', { session: false }),
			show
		],
		/* TODO: ATTENTION! Do not expose create user to the API */
		create: [
			//passport.authenticate('bearer', { session: false }),
			create
		]
	};
};

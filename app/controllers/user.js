/*jslint vars:true, node:true */
"use strict";

var Static = {},
	User = require('../models/user'),
	json_tpl = require('templo'),
	tpl;


Static.error403 = function(err, res) {
	res.status(403).json({
		status: 403,
		message: err.message
	});
};

Static.error404 = function(req, res) {
	res.status(404).json({
		status: 404,
		message: "Can't find resource with id " + req.params.id + "."
	});
};

Static.error500 = function(err, res) {
	res.status(500).json({
		status: 500,
		message: err.message
	});
};

module.exports = function(routes, passport, oauth2server) {

	/**
	 * Sends the user.
	 * GET /api/v1/users/:id
	 */
	var show = function (req, res, next) {
		tpl = require('../templates/json/user');

		User.findById(req.params.id, function(err, user) {
			if (err) { return Static.error500(err, res); }

			res.json(json_tpl.parse(tpl.show, user));
		});
	};

	/**
	 * Updates a user and sends it.
	 * PATCH /api/v1/users/:id
	 */
	var update = function (req, res, next) {
		tpl = require('../templates/json/user');

		if( req.body.id || req.body.email ) {
			return Static.error403(new Error('Forbidden. "id" and "email" are protected attributes.'), res);
		}

		User.findOneAndUpdate({ _id: req.params.id }, req.body, function(err, user) {
			if (err) { return Static.error500(err, res); }
			if (!user) { return Static.error404(req, res); }

			res.json(json_tpl.parse(tpl.show, user));
		});
	};

	/**
	 * Creates a user and sends it.
	 * POST /api/v1/users
	 */
	var create = function (req, res, next) {
		var new_user;

		tpl = require('../templates/json/user');

		try {
			new_user = json_tpl.parse(tpl.create, req.body);
		} catch(e) {
			return res.status(422).json({
				status: 422,
				message: e.message
			});
		}

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
		],
		update: [
			//passport.authenticate('bearer', { session: false }),
			update
		]
	};
};

/*jslint vars:true, node:true */
"use strict";

var User = require('../models/user');

module.exports = function(routes, passport, oauth2server) {
	var dbHelpers = require('../helpers/db');

	return {
		login: function(req, res, next) {
			var next_url = req.query.next || '/';

			if (req.isAuthenticated()) {
				res.redirect(next_url);
			}

			// render the page and pass in any flash data if it exists
			res.render('user/login', {
				title: 'Login',
				next_url: next_url,
				message: req.flash('loginMessage')
			});
		},

		logon: function(req, res, next) {
			passport.authenticate('local', function(err, user, info) {
				if (err) { return next(err); }
				if (!user) { return res.redirect('/login'); }

				req.logIn(user, function(err) {
					if (err) { return next(err); }
					return res.redirect(decodeURIComponent(req.body.next) || '/');
				});
			})(req, res, next);
		},

		logout: function(req, res, next) {
			var next_url = req.query.next || '/';

			req.logout();
			res.redirect(next_url);
		},

		show: [
			passport.authenticate('bearer', { session: false }),
			function(req, res, next) {
				res.json({ id: req.user.id, name: req.user.name });
			}
		]
	};
};

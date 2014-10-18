/*jslint vars:true, unparam:true, node:true */
"use strict";

module.exports = {
	ensureLoggedIn: function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			return res.redirect('/login?next='+encodeURIComponent(req.url));
		}
	},

	csrf: function(req, res, next) {
		res.locals.csrf_token = req.csrfToken();
		next();
	}
};

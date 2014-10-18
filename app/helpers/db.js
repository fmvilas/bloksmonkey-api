/*jslint vars:true, node:true */
"use strict";

var isObjectID = function(subject) {
	return subject.match(/^[0-9a-fA-F]{24}$/);
};

var loadUser = function(req, res, next) {
	var User = require('../models/user');

	// id === 0 means it referes to the current logged user
	if( req.params.id === '0' && req.session.user && req.session.user.id ) {
		req.params.id = req.session.user.id;
		console.dir(req.session.user.id);
	}

	if( isObjectID(req.params.id) ) {
		User.findById(req.params.id, function (err, user) {
			if( err ) { return next(err); }

			req.user = user;
			next();
		});
	} else {
		res.json(400, { error: 'User ID is not valid!' });
	}
};



module.exports = {
	isObjectID: isObjectID,
	loadUser: loadUser
};
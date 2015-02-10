var mongoose = require('mongoose'),
	config = require('./config'),
	db = mongoose.createConnection(config.db_uri, config.db_options),
	async = require('async'),
	projects = require('./seed/projects'),
	users = require('./seed/users'),
	UserSchema = require('../app/models/user'),
	ProjectSchema = require('../app/models/project'),
	Project,
	User;



function createModel(Model, data, callback) {
	Model.create(data, function(err, model) {
		if( err ) { return callback(err); }
		callback(null, model);
	});
}

function seedUsers(callback) {
	async.series([
		function(cb) { createModel(User, users[0], cb); },
		function(cb) { createModel(User, users[1], cb); }
	], function(err, results) {
		callback(err, results);
	});
}

function seedProjects(callback) {
	async.series([
		function(cb) { createModel(Project, projects[0], cb); },
		function(cb) { createModel(Project, projects[1], cb); },
		function(cb) { createModel(Project, projects[2], cb); },
		function(cb) { createModel(Project, projects[3], cb); },
		function(cb) { createModel(Project, projects[4], cb); }
	], function(err, results) {
		callback(err, results);
	});
}

function seed(callback) {
	async.series([
		function(cb) { seedUsers(cb); },
		function(cb) { seedProjects(cb); }
	], function(err, results) {
		callback(err, results);
	});
}

db.on('connected', function() {
	User = db.model('User');
	Project = db.model('Project');

	async.series([
		// Remove all users
		function(callback) {
			User.remove(function(err) {
				if( err ) { return callback(err); }
				callback(null);
			});
		},

		// Remove all projects
		function(callback) {
			Project.remove(function(err) {
				if( err ) { return callback(err); }
				callback(null);
			});
		},

		// Seed database
		function(callback) {
			seed(function(err, results) {
				if( err ) { return callback(err); }
				callback(err, results);
			});
		}
	], function() {
		mongoose.disconnect();
	});
});

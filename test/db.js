var mongoose = require('mongoose'),
	config = require('../config/config'),
	db;

module.exports = {
	connect: function(callback) {
		db = mongoose.createConnection(config.db_uri, config.db_options);

		db.on('connected', function() {
			callback(db);
		});
	}
};

/*jslint vars:true, node:true */
"use strict";

var mongoose = require('mongoose'),
	config = require('../config/config'),
	db;

mongoose.connect(config.db);

db = mongoose.connection;

db.on('error', function () {
	throw new Error('unable to connect to database at ' + config.db);
});
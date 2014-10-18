/*jslint vars:true, node:true */
"use strict";

var express = require('express'),
    app = express(),
    morgan = require('morgan'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport;

var mongoose = require('mongoose');
var oauth2server;
var config = require('./config/config');

/* CONNECT TO DATABASE */
mongoose.connect(config.db);
var db = mongoose.connection;

db.on('error', function () {
	throw new Error('Unable to connect to database at ' + config.db);
});

/* SETUP MODELS */
require('./app/models/user');
require('./app/models/client');
require('./app/models/authorization_code');
require('./app/models/access_token');

/* SETUP OAUTH2 SERVER */
oauth2server = require('./config/oauth2server');

/* SETUP PASSPORT */
passport = require('./config/passport');

/* SETUP EXPRESS SERVER */
if( config.env !== 'production' ) {
	app.use(morgan(config.env)); // Log every request to the console
}

app.use(express.static('./public'));
app.set('views', './app/views');
app.set('view engine', 'jade');

app.locals.routes = require('./config/route_table');

app.use(cookieParser()); // Read cookies (needed for auth)
app.use(bodyParser()); // Get information from html forms

app.set('view engine', 'jade'); // Set up jade for templating

// Required for passport
app.use(session({ secret: 'fasdfasdfasdffasdfasdfasdf' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

/* SETUP ROUTES */
/* Load our routes and pass in our app, fully configured passport and oauth2server */
require('./config/routes.js')(app, passport, oauth2server);


/* HERE COMES THE LORD */
app.listen(config.port);
console.log('Server listening on port ' + config.port);

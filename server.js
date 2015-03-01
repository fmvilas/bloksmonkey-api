/*jslint vars:true, node:true */
"use strict";

var express = require('express'),
    app = express(),
    morgan = require('morgan'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    csrf = require('csurf')(),
    passport;

var mongoose = require('mongoose');
var oauth2server;
var config = require('./config/config');

/* CONNECT TO DATABASE */
mongoose.connect(config.db_uri, config.db_options);
var db = mongoose.connection;

db.on('error', function () {
  throw new Error('Unable to connect to database at ' + config.db);
});

/* SETUP MODELS */
require('./app/models/user');
require('./app/models/project');
require('./app/models/client');
require('./app/models/authorization_code');
require('./app/models/access_token');

/* SETUP OAUTH2 SERVER */
oauth2server = require('./config/oauth2server');

/* SETUP PASSPORT */
passport = require('./config/passport');

/* SETUP EXPRESS SERVER */
if( config.env !== 'production' ) {
  app.use(morgan('dev')); // Log every request to the console
}

app.use(express.static('./public'));
app.set('views', './app/views');
app.set('view engine', 'jade');

app.locals.routes = require('./config/route_table');

app.use(cookieParser()); // Read cookies (needed for auth)
app.use(bodyParser.json()); // Get information from json requests
app.use(bodyParser.urlencoded({ // Get information from urlencoded requests
  extended: true
}));

app.set('view engine', 'jade'); // Set up jade for templating

// Required for passport
app.use(session({
  secret: 'fasdfasdfasdffasdfasdfasdf', // session secret
  resave: true, // forces session to be saved even when unmodified
  saveUninitialized: true // forces a session that is "uninitialized" to be saved to the store.
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function(req, res, next) { // CSRF Token protection
  var routes = app.locals.routes,
      protected_routes = [
        routes.root + routes.session.login,
        routes.root + routes.session.logout,
        routes.root + routes.oauth2.authorize,
        routes.root + routes.oauth2.decision
      ];

  if( protected_routes.indexOf(req.path) === -1 ) {
    next();
  } else {
    csrf(req, res, function() {
      var token = req.csrfToken();
      res.cookie('XSRF-TOKEN', token);
      next();
    });
  }
});

/* SETUP ROUTES */
/* Load our routes and pass in our app, fully configured passport and oauth2server */
require('./config/routes.js')(app, passport, oauth2server);

/* HERE COMES THE LORD */
var server = app.listen(config.port);
console.log('Server listening on port ' + config.port);

module.exports = server;

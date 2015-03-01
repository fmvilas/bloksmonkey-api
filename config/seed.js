var mongoose = require('mongoose'),
    config = require('./config'),
    db = mongoose.createConnection(config.db_uri, config.db_options),
    async = require('async'),
    projects = require('./seed/projects'),
    files = require('./seed/files'),
    users = require('./seed/users'),
    clients = require('./seed/clients'),
    access_tokens = require('./seed/access_tokens'),
    UserSchema = require('../app/models/user'),
    ProjectSchema = require('../app/models/project'),
    FileSchema = require('../app/models/file'),
    AccessTokenSchema = require('../app/models/access_token'),
    ClientSchema = require('../app/models/client'),
    Project,
    File,
    User,
    AccessToken,
    Client;

function emptyDatabase(callback) {
  async.parallel([
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
    // Remove all files
    function(callback) {
      File.remove(function(err) {
        if( err ) { return callback(err); }
        callback(null);
      });
    },
    // Remove all access tokens
    function(callback) {
      AccessToken.remove(function(err) {
        if( err ) { return callback(err); }
        callback(null);
      });
    },
    // Remove all clients
    function(callback) {
      Client.remove(function(err) {
        if( err ) { return callback(err); }
        callback(null);
      });
    }
  ], function(err, results) {
    callback(err, results);
  });
}

function seedUsers(callback) {
  User.create(users, function(err, users) {
    callback(err, users);
  });
}

function seedProjects(callback) {
  Project.create(projects, function(err, projects) {
    callback(err, projects);
  });
}

function seedFiles(callback) {
  File.create(files, function(err, files) {
    callback(err, files);
  });
}

function seedClients(callback) {
  Client.create(clients, function(err, clients) {
    callback(err, clients);
  });
}

function seedAccessTokens(callback) {
  AccessToken.create(access_tokens, function(err, access_tokens) {
    callback(err, access_tokens);
  });
}

function seed(callback) {
  async.parallel([
    function(cb) { seedUsers(cb); },
    function(cb) { seedProjects(cb); },
    function(cb) { seedFiles(cb); },
    function(cb) { seedClients(cb); },
    function(cb) { seedAccessTokens(cb); }
  ], function(err, results) {
    callback(err, results);
  });
}

db.on('connected', function() {
  User = db.model('User');
  Project = db.model('Project');
  File = db.model('File');
  AccessToken = db.model('AccessToken');
  Client = db.model('Client');

  async.series([
    function(callback) {
      emptyDatabase(function(err, results) {
        if( err ) { return callback(err); }
        callback(err, results);
      });
    },

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

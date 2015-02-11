#!/usr/local/bin/node

var execSync = require('child_process').execSync,
    path = require('path'),
    walk = require('walk');

function exclude(curpath) {
  var paths = ['db.js', 'oauth2.js', 'test.js', 'templates'];

  return paths.some(function(path) {
    var relative = curpath.substr(__dirname.length);
    return relative.match(path);
  });
}

function runAll() {
  var walker;

  console.log('\nRunning tests:\n');

  walker = walk.walk(__dirname);

  walker.on("file", function(root, fileStats, next) {
    if( !exclude(path.join(root, fileStats.name)) ) {
      console.log('· ' + (path.join(root, fileStats.name)).substr(__dirname.length));
      execSync('node ' + path.normalize(__dirname + '/../config/seed.js'));
      execSync('mocha ' + path.join(root, fileStats.name));
    }
    next();
  });

  walker.on("end", function () {
    console.log("\nAll tests done!");
  });
}

(function () {
  "use strict";

  if( process.argv.length > 2 ) {
    execSync('node ' + path.normalize(__dirname + '/../config/seed.js'));
    execSync('mocha ' + path.normalize(process.argv[2]));
  } else {
    runAll();
  }

}());

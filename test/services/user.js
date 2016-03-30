var UserService = require('../../app/services/user/user'),
    should = require('chai').should(),
    database = require('../db'),
    _ = require('underscore'),
    db,
    service;

describe('UserService', function() {

  before(function(done) {
    database.connect(function(connection) {
      db = connection;
      service = new UserService(connection);
      done();
    });
  });

  describe('#find', function() {

    it('should retrieve user information for a valid <id>', function(done) {
      service.find({ id: '51964caa9c253bdbb1d00fb4' }, function(err, user) {
        user.should.be.an('object');
        user.should.have.keys(['id', 'email', 'name', 'avatar_url', 'preferences', 'created_at', 'updated_at']);
        user.id.should.be.eql('51964caa9c253bdbb1d00fb4');
        user.email.should.be.eql('jon@bloksmonkey.io');
        user.name.should.be.eql('Jon Nieve');
        user.avatar_url.should.be.empty();
        user.preferences.should.be.an('object');
        user.preferences.email_notifications.should.be.true();
        user.created_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        user.updated_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        done();
      });
    });
  });

  describe('#update', function() {

    it('should update project information and then return it', function(done) {
      var params = { id: '51964caa9c253bdbb1d00fb4' },
          data = {
            name: 'Jon Travolta',
            avatar_url: 'http://www.jontravolta.com/avatar.jpg'
          };

      service.update(params, data, function(err, user) {
        user.should.be.an('object');
        user.should.have.keys(['id', 'email', 'name', 'avatar_url', 'preferences', 'created_at', 'updated_at']);
        user.id.should.be.eql('51964caa9c253bdbb1d00fb4');
        user.email.should.be.eql('jon@bloksmonkey.io');
        user.name.should.be.eql(data.name);
        user.avatar_url.should.be.eql(data.avatar_url);
        user.preferences.should.be.an('object');
        user.preferences.email_notifications.should.be.true();
        user.created_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        user.updated_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        done();
      });
    });
  });

});

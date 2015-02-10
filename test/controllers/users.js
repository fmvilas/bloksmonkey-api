/*jslint node:true */
/*global describe, it, before*/
var mongoose = require('mongoose'),
    assert = require('assert'),
    should = require('chai').should(),
    config = require('../../config/config'),
    request = require('supertest'),
    host = 'http://localhost:' + config.port,
    single_user_endpoint = '/api/v1/users/51964caa9c253bdbb1d00fb4',
    users_endpoint = '/api/v1/users';

describe('User API', function() {

  before(function(done) {
    request = request(host);
    done();
  });

  describe('GET /api/v1/users/:id', function() {
    it('should retrieve user information', function(done) {
      request.get(single_user_endpoint)
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.id.should.be.eql('51964caa9c253bdbb1d00fb4');
        json.email.should.be.eql('jon@bloksmonkey.io');
        json.name.should.be.eql("Jon Nieve");
        json.avatar_url.should.be.empty();
        json.preferences.should.be.an('object');
        json.preferences.email_notifications.should.be.true();
        json.created_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        json.updated_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
      })
      .end(done);
    });
  });

  describe('PATCH /api/v1/users/:id', function() {
    it('should update user information', function(done) {
      request.patch(single_user_endpoint)
      .send({ name: "My modified user name", avatar_url: 'http://www.jontravolta.com/avatar.jpg' })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.id.should.be.eql('51964caa9c253bdbb1d00fb4');
        json.email.should.be.eql('jon@bloksmonkey.io');
        json.name.should.be.eql("My modified user name");
        json.avatar_url.should.be.eql('http://www.jontravolta.com/avatar.jpg');
        json.preferences.should.be.an('object');
        json.preferences.email_notifications.should.be.true();
        json.created_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        json.updated_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
      })
      .end(done);
    });

    it('should not update protected attributes', function(done) {
      request.patch(single_user_endpoint)
      .send({ id: "51964caa9c253bdbb1d00fb4" })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.id.should.be.eql("51964caa9c253bdbb1d00fb4");
      })
      .end(done);
    });
  });
});

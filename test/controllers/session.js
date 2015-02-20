/*jslint node:true */
/*global describe, it, before, unescape*/
var mongoose = require('mongoose'),
    assert = require('assert'),
    should = require('chai').should(),
    expect = require('chai').expect,
    config = require('../../config/config'),
    routes = require('../../config/route_table'),
    request = require('superagent'),
    agent = request.agent(),
    host = 'http://localhost:' + config.port,
    login_route = host + routes.root + routes.session.login,
    logout_route = host + routes.root + routes.session.logout,
    csrf_token,
    connect_sid;

describe('Session API', function() {

  before(function(done) {
    agent.get(login_route).end(function(err, res) {
      csrf_token = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
      connect_sid = /connect\.sid=(.*?);/.exec(res.headers['set-cookie'])[1];
      done();
    });
  });

  describe('POST /api/v1/login', function() {
    it('should perform user login', function(done) {
      agent.post(login_route)
        .type('form')
        .send({ email: 'jon@bloksmonkey.io' })
        .send({ password: '1234' })
        .send({ _csrf: csrf_token })
        .end(function(err, res) {
          expect(err).to.be.null();
          res.redirects[0].should.be.eql(host + routes.app);
          done();
        });
    });
  });

  describe('POST /api/v1/logout', function() {
    it('should perform user logout', function(done) {
      agent.post(logout_route)
        .type('form')
        .send({ _csrf: csrf_token })
        .end(function(err, res) {
          expect(err).to.be.null();
          res.redirects[0].should.be.eql(login_route);
          done();
        });
    });
  });

});

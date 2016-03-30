/*jslint node:true */
/*global describe, it, before, unescape*/
var mongoose = require('mongoose'),
    assert = require('assert'),
    should = require('chai').should(),
    expect = require('chai').expect,
    config = require('../../config/config'),
    routes = require('../../config/route_table'),
    url = require('url'),
    request = require('superagent'),
    agent = request.agent(),
    host = 'http://localhost:' + config.port,
    authorize_route = host + routes.root + routes.oauth2.authorize,
    decision_route = host + routes.root + routes.oauth2.decision,
    login_route = host + routes.root + routes.session.login,
    access_token_route = host + routes.root + routes.oauth2.token,
    client_id = '54de2af99fbafddbf40e822b',
    client_secret = '$2a$10$.OpHOFU9YsMtuBlyOxNI7uwJ7lwV.0AeD5LwNLRzE3HooKsim2pLe',
    redirect_uri = 'http://bloksmonkey.com/app/authorized',
    transaction_id,
    scope,
    code,
    csrf_token;

describe('OAuth2 API', function() {

  before(function(done) {
    agent.get(login_route).end(function(err, res) {
      if( err ) { console.dir(err); done(err); }
      csrf_token = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
      done();
    });
  });

  describe('Login', function() {
    before(function(done) {
      agent.post(login_route)
        .type('form')
        .send({ email: 'jon@bloksmonkey.io' })
        .send({ password: '1234' })
        .send({ _csrf: csrf_token })
        .end(function(err, res) {
          if( err ) { console.dir(err); done(err); }
          done();
        });
    });

    describe('Request auth code', function(done) {
      before(function(done) {
        agent.get(authorize_route)
          .query({ response_type: 'code' })
          .query({ client_id: client_id })
          .query({ redirect_uri: redirect_uri })
          .end(function(err, res) {
            if( err ) { console.dir(err); done(err); }
            transaction_id = /name="transaction_id" value="(.*?)"/.exec(res.text)[1];
            scope = 'user project project_files';
            done();
          });
      });

      describe('Authorize and return code', function(done) {
        before(function(done) {
          agent.post(decision_route)
            .type('form')
            .send({ transaction_id: transaction_id })
            .send({ scope: scope })
            .send({ _csrf: csrf_token })
            .send({ allow: 'Allow' })
            .end(function(err, res) {
              if( err ) { console.dir(err); done(err); }
              code = url.parse(res.redirects[0], true).query.code;
              done();
            });
        });

        it('should exchange code for an bearer access token', function(done) {
          agent.post(access_token_route)
            .type('form')
            .send({ client_id: client_id })
            .send({ code: code })
            .send({ client_secret: client_secret })
            .send({ redirect_uri: redirect_uri })
            .send({ grant_type: 'authorization_code' })
            .end(function(err, res) {
              if( err ) { console.dir(err); done(err); }
              var json = res.body;
              json.should.be.an('object');
              json.access_token.should.be.a('string');
              json.scope.should.be.a('string');
              json.token_type.should.be.eql('Bearer');
              done();
            });
        });

      });
    });
  });

});

/*jslint node:true */
/*global describe, it, before*/
var mongoose = require('mongoose'),
    assert = require('assert'),
    should = require('chai').should(),
    config = require('../../config/config'),
    request = require('supertest'),
    host = 'http://localhost:' + config.port,
    single_project_endpoint = '/api/v1/projects/54cfcc0244b6fd7034198f20',
    projects_endpoint = '/api/v1/projects',
    token = require('../../config/seed/access_tokens')[0].oauth_token;

describe('Project API', function() {

  before(function(done) {
    request = request(host);
    done();
  });

  describe('GET /api/v1/projects', function() {
    it('should retrieve project list', function(done) {
      request.get(projects_endpoint)
      .query({ access_token: token })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.length.should.be.eql(4);
      })
      .end(done);
    });
  });

  describe('GET /api/v1/projects/:id', function() {
    it('should retrieve project information', function(done) {
      request.get(single_project_endpoint)
      .query({ access_token: token })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.id.should.be.eql("54cfcc0244b6fd7034198f20");
        json.name.should.be.eql("My Awesome Project");
        json.description.should.be.eql("My description");
        json.visibility.should.be.eql("public");
        json.owner_id.should.be.eql("51964caa9c253bdbb1d00fb4");
      })
      .end(done);
    });
  });

  describe('PATCH /api/v1/projects/:id', function() {
    it('should update project information', function(done) {
      request.patch(single_project_endpoint)
      .query({ access_token: token })
      .send({ name: "My modified project name" })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.id.should.be.eql("54cfcc0244b6fd7034198f20");
        json.name.should.be.eql("My modified project name");
        json.description.should.be.eql("My description");
        json.visibility.should.be.eql("public");
        json.owner_id.should.be.eql("51964caa9c253bdbb1d00fb4");
      })
      .end(done);
    });

    it('should not update protected attributes', function(done) {
      request.patch(single_project_endpoint)
      .query({ access_token: token })
      .send({ id: "54cfcc0244b6fd7034198f21" })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.id.should.be.eql("54cfcc0244b6fd7034198f20");
      })
      .end(done);
    });
  });

  describe('POST /api/v1/projects', function() {
    it('should create a new project and retrieve it', function(done) {
      request.post(projects_endpoint)
      .query({ access_token: token })
      .send({
        name: "A created project",
        description: "A created description",
        visibility: "private",
        owner_id: "51964caa9c253bdbb1d00fb4"
      })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.name.should.be.eql("A created project");
        json.description.should.be.eql("A created description");
        json.visibility.should.be.eql("private");
        json.owner_id.should.be.eql("51964caa9c253bdbb1d00fb4");
      })
      .end(done);
    });

  });

  describe('DELETE /api/v1/projects/:id', function() {
    it('should remove a project and respond with status object', function(done) {
      request.delete(single_project_endpoint)
      .query({ access_token: token })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.status.should.be.eql(200);
        json.message.should.be.eql("Project deleted succesfully");
      })
      .end(done);
    });

  });
});

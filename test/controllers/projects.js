/*jslint node:true */
/*global describe, it, before*/
var mongoose = require('mongoose'),
    ProjectSchema = require('../../app/models/project'),
    assert = require('assert'),
    should = require('chai').should(),
    config = require('../../config/config'),
    request = require('supertest'),
    host = 'http://localhost:' + config.port,
    single_project_endpoint = '/api/v1/projects/54cfcc0244b6fd7034198f20',
    projects_endpoint = '/api/v1/projects';

describe('Project API', function() {

  before(function(done) {
    request = request(host);
    done();
  });

  describe('GET /api/v1/projects', function() {
    it('should retrieve project list', function(done) {
      request.get(projects_endpoint)
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.length.should.be.eql(5);
      })
      .end(done);
    });
  });

  describe('GET /api/v1/projects/:id', function() {
    it('should retrieve project information', function(done) {
      request.get(single_project_endpoint)
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
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.status.should.be.eql(200);
        json.message.should.be.eql("Project deleted succesfully");
      })
      .end(done);
    });

  });


    /*describe('PATCH /api/v1/projects/:id', function() {
        it('should update project name', function(done) {
            var payload = {
                    name: 'My Awesome Project'
                },
                payloadString = JSON.stringify(payload),
                callback = function(res) {
                    var data = '';
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {
                        data += chunk;
                    });

                    res.on('end', function() {
                        var json = JSON.parse(data);

                        assert.strictEqual(json.id, '5196534c9c253bdbb1d00fb6');
                        assert.strictEqual(json.name, payload.name);

                        done();
                    });
                };

            http_options.method = 'PATCH';
            http_options.headers['Content-Length'] = payloadString.length;

            var req = http.request(http_options, callback);

            req.on('error', function(e) {
                console.log('Got error: ' + e.message);
            });

            req.write(payloadString);

            req.end();
        });

        it('should not allow updating protected attributes', function(done) {
            var payload = JSON.stringify({
                    id: '5196534c9c253bdbb1d00fb6',
                    created_at: Date.now()
                }),
                callback = function(res) {
                    assert.strictEqual(res.statusCode, 403);
                    done();
                };

            http_options.method = 'PATCH';
            http_options.headers['Content-Length'] = payload.length;

            var req = http.request(http_options, callback);

            req.on('error', function(e) {
                console.log('Got error: ' + e.message);
            });

            req.write(payload);

            req.end();
        });

    });


    describe('POST /api/v1/projects', function() {
        it('should create a new project with just the required information', function(done) {
            var payload = {
                    name: Date.now() + ' test project',
                    owner_id: '51964caa9c253bdbb1d00fb4'
                },
                payloadString = JSON.stringify(payload),
                callback = function(res) {
                    var data = '';
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {
                        data += chunk;
                    });

                    res.on('end', function() {
                        var json = JSON.parse(data);

                        assert.strictEqual(res.statusCode, 200);
                        assert.strictEqual(json.name, payload.name);
                        assert.strictEqual(json.owner_id, payload.owner_id);

                        done();
                    });
                };

            http_options.method = 'POST';
            http_options.path = projects_endpoint;
            http_options.headers['Content-Length'] = payloadString.length;

            var req = http.request(http_options, callback);

            req.on('error', function(e) {
                console.log('Got error: ' + e.message);
            });

            req.write(payloadString);

            req.end();
        });

        it('should respond with a 422 (Unprocessable Entity) status', function(done) {
            var payload = JSON.stringify({
                    name: 'Failed Test Project'
                }),
                callback = function(res) {
                    assert.strictEqual(res.statusCode, 422);
                    done();
                };

            http_options.method = 'POST';
            http_options.path = projects_endpoint;
            http_options.headers['Content-Length'] = payload.length;

            var req = http.request(http_options, callback);

            req.on('error', function(e) {
                console.log('Got error: ' + e.message);
            });

            req.write(payload);

            req.end();
        });
});*/

});

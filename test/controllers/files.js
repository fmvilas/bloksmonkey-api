/*jslint node:true */
/*global describe, it, before*/
var mongoose = require('mongoose'),
    assert = require('assert'),
    should = require('chai').should(),
    config = require('../../config/config'),
    request = require('supertest'),
    host = 'http://localhost:' + config.port,
    single_file_endpoint = '/api/v1/projects/54cfcc0244b6fd7034198f20/files/index.html',
    content_endpoint = '/api/v1/projects/54cfcc0244b6fd7034198f20/files/index.html/content',
    files_endpoint = '/api/v1/projects/54cfcc0244b6fd7034198f20/files',
    token = require('../../config/seed/access_tokens')[0].oauth_token;

describe('File API', function() {

  before(function(done) {
    request = request(host);
    done();
  });

  describe('GET /api/v1/projects/:id/files', function() {
    it('should retrieve file list', function(done) {
      request.get(files_endpoint)
      .query({ access_token: token })
      .query({ project_id: '54cfcc0244b6fd7034198f20' })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.length.should.be.eql(2);
      })
      .end(done);
    });
  });

  describe('GET /api/v1/projects/:id/files/:name/content', function() {
    it('should retrieve file raw content', function(done) {
      request.get(content_endpoint)
      .query({ access_token: token })
      .query({ project_id: '54cfcc0244b6fd7034198f20' })
      .expect(200)
      .expect(function(res) {
        res.text.should.be.a('string');
        res.text.length.should.be.gt(0);
      })
      .end(done);
    });

    it('should return an error if file does not exist', function(done) {
      request.get(single_file_endpoint+'aaaaaa/content')
      .query({ access_token: token })
      .query({ project_id: '54cfcc0244b6fd7034198f20' })
      .expect(404)
      .expect(function(res) {
        var json = res.body;
        json.status.should.be.eql(404);
        json.message.should.be.eql('Error 404: File not found.');
      })
      .end(done);
    });
  });

  describe('POST /api/v1/projects/:project_id/files', function() {
    it('should create a file', function(done) {
      request.post(files_endpoint)
      .send({ name: 'test_without_content.txt' })
      .query({ access_token: token })
      .expect(201)
      .expect(function(res) {
        var json = res.body;
        json.name.should.be.eql('test_without_content.txt');
        json.path.should.be.eql('/');
        json.full_path.should.be.eql('/test_without_content.txt');
        json.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        json.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        json.size.should.be.eql(0);
        json.type.should.be.eql('file');
        json.mime.should.be.eql('text/plain');
      })
      .end(done);
    });
  });

  describe('POST /api/v1/projects/:project_id/files/:name/content', function() {
    it('should create a file with initial content', function(done) {
      request.post(files_endpoint + '/test_with_content.txt/content')
      .type('application/octet-stream')
      .send('Lorem fistrum pupita te voy a borrar el cerito ese que llega amatomaa por la gloria de mi madre está la cosa muy malar ese pedazo de no puedor no puedor me cago en tus muelas. Se calle ustée a peich a gramenawer está la cosa muy malar te voy a borrar el cerito apetecan te voy a borrar el cerito se calle ustée ese pedazo de al ataquerl. Llevame al sircoo diodeno amatomaa condemor.')
      .query({ access_token: token })
      .expect(201)
      .expect(function(res) {
        var json = res.body;
        json.name.should.be.eql('test_with_content.txt');
        json.path.should.be.eql('/');
        json.full_path.should.be.eql('/test_with_content.txt');
        json.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        json.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        json.size.should.be.eql(386);
        json.type.should.be.eql('file');
        json.mime.should.be.eql('text/plain');
      })
      .end(done);
    });

    it('should create a file with initial content and path', function(done) {
      request.post(files_endpoint + '/generated.js/content?path=/test/')
      .type('application/octet-stream')
      .send("function hello_test() { return 'Hello test!'; }")
      .query({ access_token: token })
      .expect(201)
      .expect(function(res) {
        var json = res.body;
        json.name.should.be.eql('generated.js');
        json.path.should.be.eql('/test/');
        json.full_path.should.be.eql('/test/generated.js');
        json.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        json.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        json.size.should.be.eql(47);
        json.type.should.be.eql('file');
        json.mime.should.be.eql('application/javascript');
      })
      .end(done);
    });
  });

  describe('PATCH /api/v1/projects/:project_id/files/:name', function() {
    it('should update file information', function(done) {
      request.patch(files_endpoint + '/test_without_content.txt')
      .send({
        name: 'test_with_updated_name_and_content.css',
        path: '/test/'
      })
      .query({ access_token: token })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.name.should.be.eql('test_with_updated_name_and_content.css');
        json.path.should.be.eql('/test/');
        json.full_path.should.be.eql('/test/test_with_updated_name_and_content.css');
        json.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        json.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        json.size.should.be.eql(0);
        json.type.should.be.eql('file');
        json.mime.should.be.eql('text/css');
      })
      .end(done);
    });
  });

  describe('PUT /api/v1/projects/:project_id/files/:name/content', function() {
    it('should update file content', function(done) {
      request.put(files_endpoint + '/test_with_updated_name_and_content.css/content?path=/test/')
      .type('application/octet-stream')
      .send('Lorem fistrum pupita te voy a borrar el cerito ese que llega amatomaa por la gloria de mi madre está la cosa muy malar ese pedazo de no puedor no puedor me cago en tus muelas. Se calle ustée a peich a gramenawer está la cosa muy malar te voy a borrar el cerito apetecan te voy a borrar el cerito se calle ustée ese pedazo de al ataquerl. Llevame al sircoo diodeno amatomaa condemor.')
      .query({ access_token: token })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.name.should.be.eql('test_with_updated_name_and_content.css');
        json.path.should.be.eql('/test/');
        json.full_path.should.be.eql('/test/test_with_updated_name_and_content.css');
        json.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        json.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        json.size.should.be.eql(386);
        json.type.should.be.eql('file');
        json.mime.should.be.eql('text/css');
      })
      .end(done);
    });
  });

  describe('DELETE /api/v1/projects/:project_id/files/:name', function() {
    it('should delete a file', function(done) {
      request.delete(files_endpoint + '/test_with_content.txt')
      .query({ access_token: token })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.status.should.be.eql(200);
        json.message.should.be.eql("File deleted succesfully");
      })
      .end(done);
    });

    it('should delete a directory', function(done) {
      request.delete(files_endpoint + '/test/')
      .query({ access_token: token })
      .expect(200)
      .expect(function(res) {
        var json = res.body;
        json.status.should.be.eql(200);
        json.message.should.be.eql("Files deleted succesfully");
      })
      .end(done);
    });

    it('should return an error if directory does not exist', function(done) {
      request.delete(files_endpoint + '/failtest/')
      .query({ access_token: token })
      .expect(404)
      .expect(function(res) {
        var json = res.body;
        json.status.should.be.eql(404);
        json.message.should.be.eql("File not found.");
      })
      .end(done);
    });
  });
});

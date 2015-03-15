var FileService = require('../../app/services/file/file'),
    should = require('chai').should(),
    database = require('../db'),
    _ = require('underscore'),
    db,
    service,
    all_fields;

describe('FileService', function() {

  before(function(done) {
    database.connect(function(connection) {
      db = connection;
      service = new FileService(connection);
      done();
    });
  });

  describe('#list', function() {
    before(function() {
      all_fields = ["name", "path", "full_path", "user_id", "project_id",
                        "size", "type", "mime", "created_at", "updated_at"];
    });

    it('should retrieve a list of files', function(done) {
      service.list({
        project_id: '54cfcc0244b6fd7034198f20'
      }, function(err, files) {
        if( err ) { return done(err); }

        files.should.be.an('array');
        files.length.should.be.eql(2);
        _.each(files, function(file) {
          file.should.be.an('object');
          file.should.have.keys(all_fields);
        });
        done();
      });
    });

    it('should retrieve a list of files including hidden', function(done) {
      service.list({
        project_id: '54cfcc0244b6fd7034198f20',
        hidden: true
      }, function(err, files) {
        if( err ) { console.dir(err); return done(err); }

        files.should.be.an('array');
        files.length.should.be.eql(3);
        _.each(files, function(file) {
          file.should.be.an('object');
          file.should.have.keys(all_fields);
        });
        done();
      });
    });

    it('should retrieve a list of files but limiting the fields', function(done) {
      service.list({
        project_id: '54cfcc0244b6fd7034198f20',
        fields: 'name path type'
      }, function(err, files) {
        if( err ) { console.dir(err); return done(err); }

        files.should.be.an('array');
        files.length.should.be.eql(2);
        _.each(files, function(file) {
          file.should.be.an('object');
          file.should.have.keys(['name', 'path', 'type']);
        });
        done();
      });
    });

    it('should not allow empty fields string', function(done) {
      service.list({
        project_id: '54cfcc0244b6fd7034198f20',
        fields: ''
      }, function(err) {
        err.status.should.be.eql(422);
        err.name.should.be.eql('FileServiceError');
        err.message.should.be.a('string');
        err.errors.should.be.an('object');
        done();
      });
    });
  });

  describe('#find', function() {
    it('should retrieve information for a file', function(done) {
      service.find({
        name: 'index.html',
        project_id: '54cfcc0244b6fd7034198f20'
      }, function(err, file) {
        if( err ) { console.dir(err); return done(err); }

        file.should.be.an('object');
        file.should.have.keys(['name', 'path', 'full_path', 'user_id', 'project_id',
                               'size', 'type', 'mime', 'created_at', 'updated_at']);
        file.name.should.be.eql('index.html');
        file.path.should.be.eql('/');
        file.full_path.should.be.eql('/index.html');
        file.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        file.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        file.size.should.be.eql(98);
        file.type.should.be.eql('file');
        file.mime.should.be.eql('text/html');
        file.created_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        file.updated_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        done();
      });
    });
  });

  describe('#content', function() {
    it('should retrieve raw content of a file', function(done) {
      service.content({
        name: 'index.html',
        project_id: '54cfcc0244b6fd7034198f20'
      }, function(err, file) {
        if( err ) { console.dir(err); return done(err); }

        file.should.be.an('object');
        file.toString.should.be.a('function');
        file.toString().should.be.a('string');
        done();
      });
    });
  });

  describe('#create', function() {
    it('should create a file', function(done) {
      service.create({
        name: 'test.txt',
        project_id: '54cfcc0244b6fd7034198f20',
        user_id: '51964caa9c253bdbb1d00fb4'
      }, function(err, file) {
        if( err ) { console.dir(err); return done(err); }

        file.name.should.be.eql('test.txt');
        file.path.should.be.eql('/');
        file.full_path.should.be.eql('/test.txt');
        file.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        file.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        file.size.should.be.eql(0);
        file.type.should.be.eql('file');
        file.mime.should.be.eql('text/plain');
        file.created_at.should.be.a('string');
        file.updated_at.should.be.a('string');
        done();
      });
    });

    it('should respond with an error when file already exists', function(done) {
      var content = new Buffer('Hello world!', 'binary').toString('base64');

      service.create({
        name: 'test.txt',
        project_id: '54cfcc0244b6fd7034198f20',
        user_id: '51964caa9c253bdbb1d00fb4',
        content: content
      }, function(err, file) {
        err.status.should.be.eql(422);
        err.name.should.be.eql('FileServiceError');
        err.message.should.be.eql('File already exists.');
        err.err.should.be.eql('FILE_ALREADY_EXISTS');
        done();
      });
    });

    it('should create a directory', function(done) {
      service.create({
        name: 'test_dir',
        project_id: '54cfcc0244b6fd7034198f20',
        user_id: '51964caa9c253bdbb1d00fb4',
        type: 'dir'
      }, function(err, file) {
        if( err ) { console.dir(err); return done(err); }

        file.name.should.be.eql('test_dir');
        file.path.should.be.eql('/');
        file.full_path.should.be.eql('/test_dir');
        file.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        file.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        file.size.should.be.eql(0);
        file.type.should.be.eql('dir');
        file.mime.should.be.eql('text/directory');
        file.created_at.should.be.a('string');
        file.updated_at.should.be.a('string');
        done();
      });
    });
  });

  describe('#create_with_content', function() {
    it('should create a file with content', function(done) {
      var content = 'Hello world!';

      service.create_with_content({
        name: 'test_with_content.txt',
        project_id: '54cfcc0244b6fd7034198f20',
        user_id: '51964caa9c253bdbb1d00fb4'
      }, content, function(err, file) {
        if( err ) { console.dir(err); return done(err); }

        file.name.should.be.eql('test_with_content.txt');
        file.path.should.be.eql('/');
        file.full_path.should.be.eql('/test_with_content.txt');
        file.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        file.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        file.size.should.be.eql(content.length);
        file.type.should.be.eql('file');
        file.mime.should.be.eql('text/plain');
        file.created_at.should.be.a('string');
        file.updated_at.should.be.a('string');
        done();
      });
    });
  });

  describe('#update', function() {
    it('should update a file', function(done) {
      service.update({
        name: 'test.txt',
        project_id: '54cfcc0244b6fd7034198f20'
      }, {
        name: 'test_updated.jpg'
      }, function(err, file) {
        if( err ) { console.dir(err); return done(err); }

        file.name.should.be.eql('test_updated.jpg');
        file.path.should.be.eql('/');
        file.full_path.should.be.eql('/test_updated.jpg');
        file.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        file.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        file.type.should.be.eql('file');
        file.mime.should.be.eql('image/jpeg');
        file.created_at.should.be.a('string');
        file.updated_at.should.be.a('string');
        done();
      });
    });
  });

  describe('#update_content', function() {
    it('should update a file content', function(done) {
      var content = 'Hello wonderful world!';

      service.update_content({
        name: 'test_with_content.txt',
        project_id: '54cfcc0244b6fd7034198f20',
        user_id: '51964caa9c253bdbb1d00fb4'
      }, content, function(err, file) {
        if( err ) { console.dir(err); return done(err); }

        file.name.should.be.eql('test_with_content.txt');
        file.path.should.be.eql('/');
        file.full_path.should.be.eql('/test_with_content.txt');
        file.user_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        file.project_id.should.be.eql('54cfcc0244b6fd7034198f20');
        file.size.should.be.eql(content.length);
        file.type.should.be.eql('file');
        file.mime.should.be.eql('text/plain');
        file.created_at.should.be.a('string');
        file.updated_at.should.be.a('string');
        done();
      });
    });
  });

  describe('#remove', function() {
    it('should remove a file', function(done) {
      service.remove({
        name: 'test_updated.jpg',
        project_id: '54cfcc0244b6fd7034198f20'
      }, function(err, res) {
        if( err ) { console.dir(err); return done(err); }

        res.status.should.be.eql(200);
        res.message.should.be.eql('File deleted succesfully');
        done();
      });
    });

    it('should remove a file', function(done) {
      service.remove({
        name: 'test_with_content.txt',
        project_id: '54cfcc0244b6fd7034198f20'
      }, function(err, res) {
        if( err ) { console.dir(err); return done(err); }

        res.status.should.be.eql(200);
        res.message.should.be.eql('File deleted succesfully');
        done();
      });
    });

    it('should respond with an error when file not exists', function(done) {
      service.remove({
        name: 'test-not-exist.txt',
        project_id: '54cfcc0244b6fd7034198f20'
      }, function(err, res) {
        err.status.should.be.eql(404);
        err.name.should.be.eql('FileServiceError');
        err.message.should.be.eql('File not found.');
        err.err.should.be.eql('FILE_NOT_EXISTS');
        done();
      });
    });

    it('should remove a directory', function(done) {
      service.remove({
        name: 'test_dir',
        project_id: '54cfcc0244b6fd7034198f20'
      }, function(err, res) {
        if( err ) { console.dir(err); return done(err); }

        res.status.should.be.eql(200);
        res.message.should.be.eql('File deleted succesfully');
        done();
      });
    });
  });

});

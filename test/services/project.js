var ProjectService = require('../../app/services/project/project'),
  should = require('chai').should(),
  database = require('../db'),
  _ = require('underscore'),
  db,
  service;

describe('ProjectService', function() {

  before(function(done) {
    database.connect(function(connection) {
      db = connection;
      service = new ProjectService(connection);
      done();
    });
  });

  describe('#list', function() {

    it('should retrieve a list of projects', function(done) {
      service.list({}, function(projects) {
        projects.should.be.an('array');
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    it('should retrieve a list of projects for a user', function(done) {
      service.list({ user_id: '51964caa9c253bdbb1d00fb4' }, function(projects) {
        projects.should.be.an('array');
        projects.length.should.be.eql(4);
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    it('should retrieve a list of projects where user is owner', function(done) {
      service.list({
        user_id: '51964caa9c253bdbb1d00fb4',
        user_role: 'owner'
      }, function(projects) {
        projects.should.be.an('array');
        projects.length.should.be.eql(3);
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    it('should retrieve a list of projects where user is member', function(done) {
      service.list({
        user_id: '51964caa9c253bdbb1d00fb4',
        user_role: 'member'
      }, function(projects) {
        projects.should.be.an('array');
        projects.length.should.be.eql(1);
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    it('should retrieve a list of public projects where user is owner', function(done) {
      service.list({
        user_id: '51964caa9c253bdbb1d00fb4',
        user_role: 'owner',
        visibility: 'public'
      }, function(projects) {
        projects.should.be.an('array');
        projects.length.should.be.eql(2);
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    it('should retrieve a list of public projects where user is member', function(done) {
      service.list({
        user_id: '51964caa9c253bdbb1d00fb4',
        user_role: 'member',
        visibility: 'public'
      }, function(projects) {
        projects.should.be.an('array');
        projects.length.should.be.eql(1);
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    it('should retrieve a list of private projects where user is owner', function(done) {
      service.list({
        user_id: '54cfcc0244b6fd7034198f1f',
        user_role: 'owner',
        visibility: 'private'
      }, function(projects) {
        projects.should.be.an('array');
        projects.length.should.be.eql(1);
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    it('should retrieve a list of private projects where user is member', function(done) {
      service.list({
        user_id: '54cfcc0244b6fd7034198f1f',
        user_role: 'member',
        visibility: 'private'
      }, function(projects) {
        projects.should.be.an('array');
        projects.length.should.be.eql(1);
        _.each(projects, function(project) {
          project.should.be.an('object');
          project.should.have.keys(['id', 'name', 'description', 'visibility',
                                    'owner_id', 'members', 'created_at', 'updated_at']);
        });
        done();
      });
    });

    // TODO: Test exceptions when project doesn't exist or id is not specified
  });

  describe('#find', function() {

    it('should retrieve project information for a valid <id>', function(done) {
      service.find({ id: '54cfcc0244b6fd7034198f20' }, function(project) {
        project.should.be.an('object');
        project.should.have.keys(['id', 'name', 'description', 'visibility',
                                  'owner_id', 'members', 'created_at', 'updated_at']);
        project.id.should.be.eql('54cfcc0244b6fd7034198f20');
        project.name.should.be.eql('My Awesome Project');
        project.description.should.be.eql('My description');
        project.owner_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        project.members.should.be.an('array');
        project.visibility.should.be.eql('public');
        project.created_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        project.updated_at.should.be.eql('Fri Nov 07 2014 17:04:06 GMT+0100 (CET)');
        done();
      });
    });
  });

  describe('#update', function() {

    it('should update project information and then return it', function(done) {
      var params = { id: '54cfcc0244b6fd7034198f20' },
        data = {
          name: 'Super testing project!',
          description: 'Just to test it',
          visibility: 'private'
        };

      service.update(params, data, function(project) {
        project.should.be.an('object');
        project.should.have.keys(['id', 'name', 'description', 'visibility',
                                  'owner_id', 'members', 'created_at', 'updated_at']);
        project.id.should.be.eql('54cfcc0244b6fd7034198f20');
        project.name.should.be.eql(data.name);
        project.description.should.be.eql(data.description);
        project.owner_id.should.be.eql('51964caa9c253bdbb1d00fb4');
        project.members.should.be.an('array');
        project.visibility.should.be.eql(data.visibility);
        done();
      });
    });

    it('should update project owner', function(done) {
      var params = { id: '54cfcc0244b6fd7034198f20' },
        data = {
          owner_id: '54cfcc0244b6fd7034198f1f'
        };

      service.update(params, data, function(project) {
        project.should.be.an('object');
        project.should.have.keys(['id', 'name', 'description', 'visibility',
                                  'owner_id', 'members', 'created_at', 'updated_at']);
        project.owner_id.should.be.eql(data.owner_id);
        done();
      });
    });
  });

  describe('#create', function() {

    it('should create a project and then return it', function(done) {
      var data = {
        name: 'Newly created project',
        description: 'New project description',
        owner_id: '51964caa9c253bdbb1d00fb4'
      };

      service.create(data, function(project) {
        project.should.be.an('object');
        project.should.have.keys(['id', 'name', 'description', 'visibility',
                                  'owner_id', 'members', 'created_at', 'updated_at']);
        project.name.should.be.eql(data.name);
        project.description.should.be.eql(data.description);
        project.owner_id.should.be.eql(data.owner_id);
        project.members.should.be.an('array');
        project.visibility.should.be.eql('public');
        done();
      });
    });

    it('should create a project with members and then return it', function(done) {
      var data = {
        name: 'Newly created project',
        description: 'New project description',
        owner_id: '51964caa9c253bdbb1d00fb4',
        members: ['54cfcc0244b6fd7034198f1f']
      };

      service.create(data, function(project) {
        project.should.be.an('object');
        project.should.have.keys(['id', 'name', 'description', 'visibility',
                                  'owner_id', 'members', 'created_at', 'updated_at']);
        project.name.should.be.eql(data.name);
        project.description.should.be.eql(data.description);
        project.owner_id.should.be.eql(data.owner_id);
        project.members.should.be.an('array');
        project.members[0].toString().should.be.eql('54cfcc0244b6fd7034198f1f');
        project.visibility.should.be.eql('public');
        done();
      });
    });
  });

  describe('#remove', function() {
    it('should remove a project', function(done) {
      service.remove({ id: '54cfcc0244b6fd7034198f20' }, function(response) {
        response.should.be.an('object');
        response.should.have.keys(['status', 'message']);
        response.status.should.be.eql(200);
        response.message.should.be.eql('Project deleted succesfully');
        done();
      });
    });
  });

});

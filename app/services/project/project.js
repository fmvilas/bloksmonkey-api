var ProjectSchema = require('../../models/project'),
    templates = require('./templates/project'),
    _ = require('underscore'),
    BaseService = require('../base');


function ProjectService(db) {
  this.model = db.model('Project');
}
ProjectService.prototype = Object.create(BaseService.prototype);
ProjectService.prototype.constructor = ProjectService;


ProjectService.prototype.list = function(params, callback) {
  var query,
      self = this;

  try {
    params = self.validate_params(templates.list_params, params, self.ProjectServiceError);
  } catch(e) {
    return callback(e, null);
  }

  query = self.model.find();

  if( params.user_id ) {
    switch(params.user_role) {
      case 'member':
        query = query.where('members').in([params.user_id]);
      break;
      case 'owner':
        query = query.where('owner_id').equals(params.user_id);
      break;
      default:
        query = query.or([
          { members: { $in: [params.user_id] } },
          { owner_id: params.user_id }
        ]);
    }

    if( params.visibility ) {
      query = query.where('visibility').equals(params.visibility);
    }
  } else {
    query = query.where('visibility').equals('public');
  }

  query.exec(function(err, projects) {
    if( err ) { throw new self.ProjectServiceError({ status: 500 }); }

    var output = [];
    _.each(projects, function(project) {
      output.push(self.parse_response(templates.show, project));
    });

    callback(null, output);
  });
};

ProjectService.prototype.find = function(params, callback) {
  var query,
      self = this;

  try {
    params = self.validate_params(templates.show_params, params, self.ProjectServiceError);
    query = self.validate_params(templates.show_filter_params, params, self.ProjectServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOne(query, function(err, project) {
    if( err ) { return callback( new self.ProjectServiceError({ status: 500 }), null ); }
    if( !project ) { return callback( new self.ProjectServiceError({ status: 404 }), null ); }
    if( !project.has_member(params.user_id) ) {
      return callback( new self.ProjectServiceError({ status: 403 }), null );
    }

    callback( null, self.parse_response(templates.show, project) );
  });
};

ProjectService.prototype.create = function(data, callback) {
  var self = this;

  try {
    data = self.validate_params(templates.create, data, self.ProjectServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.create(data, function(err, project) {
    if( err ) { return callback( new self.ProjectServiceError({ status: 500 }), null ); }

    callback( null, self.parse_response(templates.show, project) );
  });
};

ProjectService.prototype.update = function(params, data, callback) {
  var query,
      self = this;

  try {
    params = self.validate_params(templates.update_params, params, self.ProjectServiceError);
    data = self.validate_params(templates.update, data, self.ProjectServiceError);
    query = self.validate_params(templates.update_filter_params, params, self.ProjectServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOne(query, function(err, project) {
    if( err ) { return callback( new self.ProjectServiceError({ status: 500 }), null ); }
    if( !project ) { return callback( new self.ProjectServiceError({ status: 404 }), null ); }
    if( !project.has_member(params.user_id) ) {
      return callback( new self.ProjectServiceError({ status: 403 }), null );
    }

    self.model.findOneAndUpdate(query, data, function(err, project) {
      if( err ) { return callback( new self.ProjectServiceError({ status: 500 }), null ); }
      if( !project ) { return callback( new self.ProjectServiceError({ status: 404 }), null ); }

      callback( null, self.parse_response(templates.show, project) );
    });
  });
};

ProjectService.prototype.remove = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.remove_params, params, self.ProjectServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findById(params._id, function(err, project) {
    if( err ) { return callback( new self.ProjectServiceError({ status: 500 }), null ); }
    if( !project ) { return callback( new self.ProjectServiceError({ status: 404 }), null ); }
    if( !project.has_owner(params.user_id) ) {
      return callback( new self.ProjectServiceError({ status: 403 }), null );
    }

    self.model.remove({ _id: params._id }, function(err) {
      if( err ) { return callback( new self.ProjectServiceError({ status: 500 }), null ); }

      callback( null, self.parse_response(templates.remove_response, {
        status: 200,
        message: 'Project deleted succesfully'
      }) );
    });
  });
};

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
ProjectService.prototype.ProjectServiceError = function(options) {
  options = _.defaults(options, {
    subject: 'project'
  });

  this.name = 'ProjectServiceError';
  BaseService.ServiceError.call(this, options);
};
ProjectService.prototype.ProjectServiceError.prototype = Object.create(Error.prototype);
ProjectService.prototype.ProjectServiceError.prototype.constructor = ProjectService.prototype.ProjectServiceError;

module.exports = ProjectService;

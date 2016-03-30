var UserSchema = require('../../models/user'),
    templates = require('./templates/user'),
    _ = require('underscore'),
    BaseService = require('../base');


function UserService(db) {
  this.model = db.model('User');
}
UserService.prototype = Object.create(BaseService.prototype);
UserService.prototype.constructor = UserService;

UserService.prototype.find = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.show_params, params, self.UserServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOne(params, function(err, user) {
    if( err ) { return callback( new self.UserServiceError({ status: 500 }), null ); }
    if( !user ) { return callback( new self.UserServiceError({ status: 404 }), null ); }

    callback( null, self.parse_response(templates.show, user) );
  });
};

UserService.prototype.update = function(params, data, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.update_params, params, self.UserServiceError);
    data = self.validate_params(templates.update, data, self.UserServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOneAndUpdate(params, data, function(err, user) {
    if( err ) { return callback( new self.UserServiceError({ status: 500 }), null ); }
    if( !user ) { return callback( new self.UserServiceError({ status: 404 }), null ); }

    callback( null, self.parse_response(templates.show, user) );
  });
};

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
UserService.prototype.UserServiceError = function(options) {
  options = _.defaults(options, {
    subject: 'user'
  });

  this.name = 'UserServiceError';
  BaseService.ServiceError.call(this, options);
};
UserService.prototype.UserServiceError.prototype = Object.create(Error.prototype);
UserService.prototype.UserServiceError.prototype.constructor = UserService.prototype.UserServiceError;

module.exports = UserService;

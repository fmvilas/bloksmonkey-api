var UserSchema = require('../../models/user'),
    templo = require('templo'),
    templates = require('./templates/user'),
    _ = require('underscore');

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
function UserServiceError(options) {
  options = options || {};
  this.status = options.status || 500;
  this.name = 'UserServiceError';

  if( options.message ) {
    this.message = options.message;
  } else {
    switch(this.status) {
      case 404:
        this.message = 'User not found';
        break;
      case 422:
        this.message = 'Unprocessable entity.';
        break;
      case 500:
      default:
        this.message = 'Unexpected Error';
        break;
    }

    this.message = 'Error ' + this.status + ': ' + this.message + '.';
  }

  if( options.warnings ) { this.warnings = options.warnings; }
  if( options.errors ) { this.errors = options.errors; }
}
UserServiceError.prototype = Object.create(Error.prototype);
UserServiceError.prototype.constructor = UserServiceError;

/**
 * Validates the params complies the rules of the specified template and returns
 * the resulting data. If not, it throws a UserServiceError error.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {Object} params - The params you want to validate.
 * @throws {UserServiceError} - Throws the error if params is not valid.
 * @returns {Object} The validated data.
 */
function validateParams(template, params) {
  var result = templo.render(template, params);

  if( result.status !== 'ok' ) {
    throw new UserServiceError({
      status: 422,
      errors: result.errors,
      warnings: result.warnings
    });
  }

  return result.output;
}

/**
 * Validates the data complies the rules of the specified template and returns
 * the resulting data. If not, it throws a UserServiceError error.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {Project} data - The data you want to validate.
 * @throws {UserServiceError} - Throws the error if data is not valid.
 * @returns {Object} The validated data.
 */
function parseResponse(template, data) {
  var result = templo.render(template, data.toJSON ? data.toJSON() : data);

  if( result.status !== 'ok' ) {
    throw new UserServiceError({
      status: 500,
      errors: result.errors,
      warnings: result.warnings
    });
  }

  return result.output;
}

// PUBLIC INTERFACE

module.exports = function(db) {
  var User = db.model('User');

  return {
    find: function(params, callback) {
      params = validateParams(templates.show_params, params);

      User.findOne(params, function(err, user) {
        if( err ) { throw new UserServiceError({ status: 500 }); }
        if( !user ) { throw new UserServiceError({ status: 404 }); }

        callback( parseResponse(templates.show, user) );
      });
    },

    update: function(params, data, callback) {
      params = validateParams(templates.update_params, params);
      data = validateParams(templates.update, data);

      User.findOneAndUpdate(params, data, function(err, user) {
        if( err ) { throw new UserServiceError({ status: 500 }); }
        if( !user ) { throw new UserServiceError({ status: 404 }); }

        callback( parseResponse(templates.show, user) );
      });
    },

    UserServiceError: UserServiceError
  };
};

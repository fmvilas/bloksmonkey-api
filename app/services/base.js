var templo = require('templo'),
    capitalize = require('underscore.string/capitalize');


/**
 * Constructor
 */
function BaseService() {}

/**
 * Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
BaseService.ServiceError = function(options) {
  options = options || {};
  this.status = options.status || 500;
  this.name = this.name || 'ServiceError';

  if( options.message ) {
    this.message = options.message;
  } else {
    switch(this.status) {
      case 403:
      this.message = 'You don\'t have permission to perform this action';
      break;
      case 404:
      this.message = capitalize(options.subject || 'resource') + ' not found';
      break;
      case 422:
      this.message = 'Unprocessable entity';
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
};
BaseService.ServiceError.prototype = Object.create(Error.prototype);
BaseService.ServiceError.prototype.constructor = BaseService.ServiceError;

/**
 * Validates the params complies the rules of the specified template and returns
 * the resulting data. If not, it throws a ServiceError error.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {Object} params - The params you want to validate.
 * @param {Error} [CustomServiceError] - A custom error object.
 * @returns {Object|ServiceError} The validated data.
 */
BaseService.prototype.validate_params = function(template, params, CustomServiceError) {
  var result = templo.render(template, params);

  CustomServiceError = CustomServiceError || ServiceError;

  if( result.status !== 'ok' ) {
    return new CustomServiceError({
      status: 422,
      errors: result.errors,
      warnings: result.warnings
    });
  }

  return result.output;
};

/**
 * Validates the data complies the rules of the specified template and returns
 * the resulting data. If not, it returns an empty object.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {Project} data - The data you want to validate.
 * @returns {Object} The validated data.
 */
BaseService.prototype.parse_response = function(template, data) {
  var result = templo.render(template, data.toJSON ? data.toJSON() : data);

  return result.output || {};
};


module.exports = BaseService;

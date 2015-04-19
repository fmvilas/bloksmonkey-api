var templates = require('./templates/session'),
    _ = require('underscore'),
    BaseService = require('../base');


function SessionService(config) {
  this.config = config;
}
SessionService.prototype = Object.create(BaseService.prototype);
SessionService.prototype.constructor = SessionService;

SessionService.prototype.create = function(data, opts, callback) {
  var self = this;

  return self.config.passport.authenticate('local', function(err, user, info) {
    if (err) { return callback( new self.SessionServiceError({ status: 500 }), null ); }
    if (!user) { return callback( new self.SessionServiceError({ status: 404 }), null ); }

    try {
      data = self.validate_params(templates.create_params, data, self.SessionServiceError);
    } catch(e) {
      return callback(e, null);
    }

    opts.login(user, function(err) {
      if (err) { console.dir(err);return callback( new self.SessionServiceError({ status: 500 }), null ); }
      return callback(null, opts.next_url ? decodeURIComponent(opts.next_url) : self.config.routes.app);
    });
  });
};

SessionService.prototype.destroy = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.send_email_params, params, self.SessionServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOne(params, function(err, user) {
    if( err ) { return callback( new self.SessionServiceError({ status: 500 }), null ); }
    if( !user ) { return callback( new self.SessionServiceError({ status: 403 }), null ); }

    console.log('Email sent with token: ' + user.signup_token);
    callback(null, user);
  });
};

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
SessionService.prototype.SessionServiceError = function(options) {
  options = _.defaults(options, {
    subject: 'user'
  });

  this.name = 'SessionServiceError';
  BaseService.ServiceError.call(this, options);
};
SessionService.prototype.SessionServiceError.prototype = Object.create(Error.prototype);
SessionService.prototype.SessionServiceError.prototype.constructor = SessionService.prototype.SessionServiceError;

module.exports = SessionService;

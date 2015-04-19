var UserSchema = require('../../models/user'),
    templates = require('./templates/account'),
    _ = require('underscore'),
    BaseService = require('../base');


function AccountService(db) {
  this.model = db.model('User');
}
AccountService.prototype = Object.create(BaseService.prototype);
AccountService.prototype.constructor = AccountService;

AccountService.prototype.create = function(data, callback) {
  var self = this;

  try {
    data = self.validate_params(templates.create_params, data, self.AccountServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.create(data, function(err, user) {
    if( err ) { return callback( new self.AccountServiceError({ status: 500 }), null ); }

    callback(null, user);
  });
};

AccountService.prototype.send_email = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.send_email_params, params, self.AccountServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOne(params, function(err, user) {
    if( err ) { return callback( new self.AccountServiceError({ status: 500 }), null ); }
    if( !user ) { return callback( new self.AccountServiceError({ status: 403 }), null ); }

    console.log('Email sent with token: ' + user.signup_token);
    callback(null, user);
  });
};

AccountService.prototype.confirm_email = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.confirm_email_params, params, self.AccountServiceError);
  } catch(e) {
    console.dir(e);
    return callback(e, null);
  }

  self.model.findOneAndUpdate(params, { is_confirmed: true }, function(err, user) {
    if( err ) { console.dir(err);return callback( new self.AccountServiceError({ status: 500 }), null ); }
    if( !user ) { console.dir(err);return callback( new self.AccountServiceError({ status: 403 }), null ); }

    console.log('User with email ' + user.email + ' has been confirmed.');
    callback(null, user);
  });
};

AccountService.prototype.send_reset_password_email = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.send_reset_password_email, params, self.AccountServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOneAndGenerateResetPasswordToken(params, function(err, user) {
    if( err ) { return callback( new self.AccountServiceError({ status: 500 }), null ); }
    if( !user ) { return callback( new self.AccountServiceError({ status: 403 }), null ); }

    console.log('Reset password email sent with token: ' + user.reset_password_token);
    callback(null, user);
  });
};

AccountService.prototype.reset_password = function(params, callback) {
  var self = this,
      data;

  try {
    data = self.validate_params(templates.reset_password_data, params, self.AccountServiceError);
    params = self.validate_params(templates.reset_password_query_params, params, self.AccountServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOne(params, function(err, user) {
    if( err ) { return callback( new self.AccountServiceError({ status: 500 }), null ); }
    if( !user ) { return callback( new self.AccountServiceError({ status: 403 }), null ); }

    user.password = data.password;

    user.save(function(err, user) {
      if( err ) { return callback( new self.AccountServiceError({ status: 500 }), null ); }
      callback(null, user);
    });
  });
};

AccountService.prototype.verify_reset_password = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.reset_password_query_params, params, self.AccountServiceError);
  } catch(e) {
    return callback(e, null);
  }

  self.model.findOne(params, function(err, user) {
    if( err ) { return callback( new self.AccountServiceError({ status: 500 }), null ); }
    if( !user ) { return callback( new self.AccountServiceError({ status: 403 }), null ); }

    callback(null, user);
  });
};

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
AccountService.prototype.AccountServiceError = function(options) {
  options = _.defaults(options, {
    subject: 'user'
  });

  this.name = 'AccountServiceError';
  BaseService.ServiceError.call(this, options);
};
AccountService.prototype.AccountServiceError.prototype = Object.create(Error.prototype);
AccountService.prototype.AccountServiceError.prototype.constructor = AccountService.prototype.AccountServiceError;

module.exports = AccountService;

var is = require('is_js');

function validateEmail(email, context) {
  var is_valid = is.email(email);

  return is_valid || {
    errors: {
      email: {
        message: email === '' ? 'Email can\'t be empty.' : '"' + email + '" is not a valid email.'
      }
    }
  };
}

function validatePassword(password, context) {
  var is_valid = is.string(password) && password.length > 0;

  return is_valid || {
    errors: {
      password: {
        message: 'Password can\'t be empty.'
      }
    }
  };
}

var create_params = {
  email:       { type: 'string', required: true, validate_with: validateEmail },
  password:    { type: 'string', required: true, validate_with: validatePassword }
};

module.exports = {
  create_params: create_params
};

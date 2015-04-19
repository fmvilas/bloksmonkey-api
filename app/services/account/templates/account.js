var is = require('is_js');

function validateName(name, context) {
  var is_valid = is.string(name) && name.match(/^[^_!?0-9¡¿"#\$%&\(\)\*\+\,\.\/\:\;\<\>\=\@\\\[\]\^\{\}\|]{2,}$/ig);

  return is_valid || {
    errors: {
      name: {
        message: name === '' ? 'Name can\'t be empty.' : '"' + name + '" is not a valid name.'
      }
    }
  };
}

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
  var is_valid = is.string(password) && password.match(/[\w]{8,}/g) && !password.match(/[\s]+/g);

  return is_valid || {
    errors: {
      password: {
        message: 'The provided password is not valid.<br>Password should, at least, be 8 characters length, contain letters and numbers and not contain spaces.'
      }
    }
  };
}

function validateToken(token, context) {
  var is_valid = is.string(token) && token.match(/^[a-z0-9]{96}$/g);

  return is_valid || {
    errors: {
      token: {
        message: 'The provided token is not valid.'
      }
    }
  };
}

module.exports = {};

module.exports.create_params = {
  name:        { type: 'string', required: true, validate_with: validateName },
  email:       { type: 'string', required: true, validate_with: validateEmail },
  password:    { type: 'string', required: true, validate_with: validatePassword }
};

module.exports.send_email_params = {
  email:       { type: 'string', required: true, validate_with: validateEmail }
};

module.exports.confirm_email_params = {
  email:        { type: 'string', required: true, validate_with: validateEmail },
  signup_token: { type: 'string', required: true, validate_with: validateToken }
};

module.exports.send_reset_password_email = {
  email:       { type: 'string', required: true, validate_with: validateEmail }
};

module.exports.reset_password_query_params = {
  email:                { type: 'string', required: true, validate_with: validateEmail },
  reset_password_token: { type: 'string', required: true, alias: 'token', validate_with: validateToken }
};

module.exports.reset_password_data = {
  password:  { type: 'string', required: true, validate_with: validatePassword }
};

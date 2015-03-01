var _ = require('underscore');

function validateName(name, context) {
  return (name.indexOf('/') === -1) || {
    errors: {
      type: {
        message: '<name> is not valid.'
      }
    }
  };
}

function validateType(type, context) {
  return (type === undefined || type === 'file' || type === 'dir') || {
    errors: {
      type: {
        message: '<type> must be either "file" or "dir".'
      }
    }
  };
}

function validateContent(content, context) {
  return (context.type === 'dir' ? content === '' : true ) || {
    errors: {
      content: {
        message: 'Directories does not allow <content>.'
      }
    }
  };
}

function validatePath(path, context) {
  if( path && !path.match(/^\//) ) {
    return {
      errors: {
        path: {
          message: '<path> must start by "/".'
        }
      }
    };
  }

  if( path && path.match(/\.\./) ) {
    return {
      errors: {
        path: {
          message: '<path> can\'t contain "..".'
        }
      }
    };
  }

  return true;
}

function validateFields(fields, context) {
  var arr_fields,
      valid = true,
      allowed_fields = ["name", "path", "full_path", "user_id", "project_id",
                        "size", "type", "mime", "created_at", "updated_at"];

  if( typeof fields === 'string' ) {
    arr_fields = fields.split(' ');

    if( !arr_fields.length ) {
      valid = false;
    } else {
      valid = _.every(arr_fields, function(field) {
        return allowed_fields.indexOf(field) > -1;
      });
    }
  }

  if( !valid ) {
    return {
      errors: {
        fields: {
          message: '<fields> must be a space-separated list. Available fields are: "' +
                   allowed_fields.join('", "') + '".'
        }
      }
    };
  }

  return true;
}


var list_params = {
  project_id:  { type: 'string', required: true },
  path:        { type: 'string', default: '/' },
  hidden:      { type: 'boolean', default: false },
  fields:      { type: 'string', default: 'name path full_path user_id project_id size type mime created_at updated_at', validate_with: validateFields }
};

var show_stats = {
  name:        { type: 'string', required: true },
  path:        { type: 'string', required: true },
  full_path:   { type: 'string', required: true },
  user_id:     { type: 'string', required: true },
  project_id:  { type: 'string', required: true },
  size:        { type: 'number', required: true },
  type:        { type: 'string', required: true },
  mime:        { type: 'string', required: true },
  created_at:  { type: 'string', required: true },
  updated_at:  { type: 'string', required: true }
};

var show_all = _.extend({
  content:     { type: 'string', required: true }
}, show_stats);

var show_params = {
  name:        { type: 'string', required: true },
  project_id:  { type: 'string', required: true },
  path:        { type: 'string', default: '/' }
};

var create = {
  name:        { type: 'string', required: true, validate_with: validateName },
  project_id:  { type: 'string', required: true },
  user_id:     { type: 'string', required: true },
  path:        { type: 'string', default: '/', validate_with: validatePath },
  encoding:    { type: 'string', default: 'base64' },
  content:     { type: 'string', default: '', validate_with: validateContent },
  type:        { type: 'string', default: 'file', validate_with: validateType },
  mime:        { type: 'string', default: 'text/plain' }
};

var update_params = {
  name:        { type: 'string', required: true },
  project_id:  { type: 'string', required: true },
  path:        { type: 'string', default: '/', validate_with: validatePath }
};

var update = {
  name:        { type: 'string', validate_with: validateName },
  path:        { type: 'string', validate_with: validatePath },
  content:     { type: 'string', validate_with: validateContent },
  type:        { type: 'string', validate_with: validateType },
  mime:        { type: 'string' }
};

var remove_params = {
  name:        { type: 'string', required: true },
  project_id:  { type: 'string', required: true },
  path:        { type: 'string', default: '/' }
};


module.exports = {
  list_params: list_params,
  show_stats: show_stats,
  show_all: show_all,
  show_params: show_params,
  create: create,
  update_params: update_params,
  update: update,
  remove_params: remove_params
};

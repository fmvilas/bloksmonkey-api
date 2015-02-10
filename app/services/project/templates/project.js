function validateVisibility(visibility, context) {
  var is_valid = visibility === undefined || visibility === 'public' || visibility === 'private';

  return is_valid || {
    errors: {
      visibility: {
        message: 'If specified, <visibility> must be either "public" or "private".'
      }
    }
  };
}

function validateUserRole(user_role, context) {
  var is_valid = user_role === 'owner' || user_role === 'member';
  is_valid = user_role === undefined || (is_valid && context.data.user_id !== undefined);

  return is_valid || {
    errors: {
      user_role: {
        message: 'If specified, <user_role> must be either "owner" or "member" and '+
                   'requires the presence of <user_id>.'
      }
    }
  };
}

var show = {
  id:          { type: 'string', alias: '_id', required: true },
  name:        { type: 'string', required: true },
  description: { type: 'string', required: true },
  visibility:  { type: 'string', required: true },
  owner_id:    { type: 'string', required: true },
  members:     { type: 'array', default: [] },
  created_at:  { type: 'string', required: true },
  updated_at:  { type: 'string', required: true }
};

var show_params = {
  _id:        { type: 'string', alias: 'id', required: true }
};

var list_params = {
  user_id:     { type: 'string' },
  user_role:   { type: 'string', validate_with: validateUserRole },
  visibility:  { type: 'string', validate_with: validateVisibility }
};

var update = {
  name:        { type: 'string' },
  description: { type: 'string' },
  visibility:  { type: 'string' },
  owner_id:    { type: 'string' },
  members:     { type: 'array'  }
};

var update_params = {
  _id:        { type: 'string', alias: 'id', required: true }
};

var create = {
  name:        { type: 'string', required: true },
  description: { type: 'string', default: '' },
  visibility:  { type: 'string', default: 'public' },
  owner_id:    { type: 'string', required: true },
  members:     { type: 'array' },
  created_at:  { type: 'string', read_only: true, default: 'timestamp' },
  updated_at:  { type: 'string', read_only: true, default: 'timestamp' }
};

var remove_params = {
  _id:        { type: 'string', alias: 'id', required: true }
};

var remove_response = {
  status:     { type: 'number', required: true },
  message:    { type: 'string', required: true }
};

module.exports = {
  show: show,
  show_params: show_params,
  list_params: list_params,
  update: update,
  update_params: update_params,
  create: create,
  remove_params: remove_params,
  remove_response: remove_response
};

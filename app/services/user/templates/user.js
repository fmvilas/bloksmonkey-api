var show = {
  id:          { type: 'string', alias: '_id', required: true },
  email:       { type: 'string', required: true },
  name:        { type: 'string', required: true },
  avatar_url:  { type: 'string', required: true },
  preferences: { type: 'object', default: {} },
  created_at:  { type: 'string', required: true },
  updated_at:  { type: 'string', required: true }
};

var show_params = {
  _id:         { type: 'string', alias: 'id', required: true }
};

var update = {
  name:        { type: 'string' },
  avatar_url:  { type: 'string' }
};

var update_params = {
  _id:         { type: 'string', alias: 'id', required: true }
};

module.exports = {
  show: show,
  show_params: show_params,
  update: update,
  update_params: update_params
};

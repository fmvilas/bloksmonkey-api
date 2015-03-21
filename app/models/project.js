var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  visibility: { type: String, default: 'public' },
  owner_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  members: { type: [Schema.Types.ObjectId], default: [] },
  created_at: { type: Date },
  updated_at: { type: Date, default: Date.now }
});

/**
 * Checks if project owner id is the specified one.
 *
 * @param [ObjectId|String] user_id
 * @returns [Boolean] Wether project owner id is the specified one or not.
 */
ProjectSchema.methods.has_owner = function(user_id) {
  user_id = user_id+'';
  return this.owner_id.toString() === user_id;
};

/**
 * Checks if the user with the provided id is either a member or the owner.
 *
 * @param [ObjectId|String] user_id
 * @returns [Boolean] Wether the user with the provided id is a member or owner.
 */
ProjectSchema.methods.has_member = function(user_id) {
  return this.has_owner(user_id) && this.members.indexOf(user_id) === -1;
};

module.exports = mongoose.model('Project', ProjectSchema);

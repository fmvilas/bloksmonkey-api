var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FileSchema = new Schema({
  name: { type: String, required: true },
  path: { type: String, default: '/' },
  content: { type: String, default: '' },
  project_id: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  size: { type: Number, default: 0 },
  type: { type: String, required: true },
  mime: { type: String, default: 'text/plain' },
  created_at: { type: Date },
  updated_at: { type: Date, default: Date.now }
});

FileSchema.index({ project_id: 1, path: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('File', FileSchema);

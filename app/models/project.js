var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ProjectSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String, default: '' },
	visibility: { type: String, default: 'public' },
	owner_id: { type: Schema.Types.ObjectId, required: true },
	members: { type: [Schema.Types.ObjectId], default: [] },
	created_at: { type: Date },
	updated_at: { type: Date }
});

module.exports = mongoose.model('Project', ProjectSchema);

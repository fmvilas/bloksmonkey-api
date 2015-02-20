var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AccessTokenSchema = new mongoose.Schema({
    oauth_token: { type: String },
    user_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
    client_id: { type: mongoose.Schema.ObjectId, ref: 'Plugin' },
    expires: { type: Date },
    scope: { type: String }
});

AccessTokenSchema.index({ user_id: 1, client_id: 1 }, { unique: true });

exports.AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

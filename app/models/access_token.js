var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AccessTokenSchema = new mongoose.Schema({
    oauth_token: { type: String },
    user_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
    client_id: { type: mongoose.Schema.ObjectId, ref: 'Plugin' },
    expires: { type: Number },
    scope: { type: String }
});

exports.AccessToken = mongoose.model('AccessToken', AccessTokenSchema);
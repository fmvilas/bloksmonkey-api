var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AuthorizationCodeSchema = new mongoose.Schema({
    code: { type: String },
    client_id: { type: mongoose.Schema.ObjectId, ref: 'Plugin' },
    user_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
    redirect_uri: { type: String },
    scope: { type: String }
});

AuthorizationCodeSchema.index({ user_id: 1, client_id: 1 }, { unique: true });

exports.AuthorizationCode = mongoose.model('AuthorizationCode', AuthorizationCodeSchema);

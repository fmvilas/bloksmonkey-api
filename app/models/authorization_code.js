var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AuthorizationCodeSchema = new mongoose.Schema({
    code: { type: String },
    client_id: { type: mongoose.Schema.ObjectId, ref: 'Plugin' },
    user_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
    redirect_uri: { type: String },
    scope: { type: String }
});

exports.AuthorizationCode = mongoose.model('AuthorizationCode', AuthorizationCodeSchema);

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    SALT_WORK_FACTOR = 10;

var UserPluginTokensSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    pluginId: { type: Schema.Types.ObjectId, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, index: { expires: 60 * 60 } } // Expires in 1 hour
});

UserPluginTokensSchema.pre('save', function(next) {
    var upt = this;

    // only hash the token if it has been modified (or is new)
    if (!upt.isModified('token')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the token using our new salt
        bcrypt.hash(upt.token, salt, null, function(err, hash) {
            if (err) return next(err);

            // override the cleartext token with the hashed one
            upt.token = hash;
            next();
        });
    });
});

UserPluginTokensSchema.methods.compareToken = function(candidateToken, cb) {
    bcrypt.compare(candidateToken, this.token, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('UserPluginToken', UserPluginTokensSchema);
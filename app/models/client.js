var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    SALT_WORK_FACTOR = 10;

var ClientSchema = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  secret: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  icon_uri: { type: String, default: '' },
  redirect_uri: { type: String, required: true },
  homepage_uri: { type: String, default: '' },
  description: { type: String, default: '' },
  scope: { type: String, default: '' },
  created_at: { type: Date },
  updated_at: { type: Date, default: Date.now }
});

ClientSchema.pre('save', function(next) {
  var client = this;

  // only hash the secret if it has been modified (or is new)
  if (!client.isModified('secret')) { return next(); }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) { return next(err); }

    // hash the secret using our new salt
    bcrypt.hash(client.secret, salt, null, function(err, hash) {
      if (err) { return next(err); }

      // override the cleartext secret with the hashed one
      client.password = hash;
      next();
    });
  });
});

ClientSchema.methods.compareSecret = function(candidateSecret, cb) {
  bcrypt.compare(candidateSecret, this.secret, function(err, isMatch) {
    if (err) { return cb(err); }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Client', ClientSchema);

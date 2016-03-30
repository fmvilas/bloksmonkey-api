var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    crypto = require('crypto'),
    SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar_url: { type: String, default: '' },
  github_login: { type: Boolean, default: false },
  preferences: { type: Object, default: {} },
  plugins: { type: [Schema.Types.ObjectId], default: [] },
  signup_token: { type: String },
  reset_password_token: { type: String },
  is_confirmed: { type: Boolean, default: false },
  created_at: { type: Date },
  updated_at: { type: Date }
});

UserSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.pre('save', function (next) {
  var user = this,
      now = Date.now();

  if( user.isNew ) {
    user.created_at = now;
    user.signup_token = crypto.randomBytes(48).toString('hex');
  }

  if( user.isModified() ) user.updated_at = now

  next();
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.statics.authenticate = function (email, password, next) {
  this.findOne({ email: email }, function (err, user) {
    if(err)
      return next(500, 'Internal service error');

    if( !user ) return next(403, 'E-mail or password invalid');

    if( user && user.comparePassword ) {
      user.comparePassword(password, function(err, isMatch) {
        if( err ) return next(500, 'Internal service error');

        if( !isMatch ) return next(403, 'E-mail or password invalid');

        return next(null, user);
      });
    }
  });
};

UserSchema.statics.findOneAndGenerateResetPasswordToken = function (query, callback) {
  var data = { reset_password_token: crypto.randomBytes(48).toString('hex') };
  this.findOneAndUpdate(query, data, function (err, user) {
    if( err ) return callback(err);
    callback(null, user);
  });
};

module.exports = mongoose.model('User', UserSchema);

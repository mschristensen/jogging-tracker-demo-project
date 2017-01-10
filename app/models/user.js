'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const Roles = {
  User: 1,
  UserManager: 2,
  Admin: 3
};

const userSchema = new Schema({
  name:  {
    first: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return v.length > 2;
        }
      }
    },
    last: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return v.length > 2;
        }
      }
    }
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        // Check whether a string is an email using regex and the RFC822 spec
        /* jshint ignore:start */
        return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(v);
        /* jshint ignore:end */
      }
    }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 2;
      }
    }
  },
  role: {
    type: Number,
    enum: (function() {
      // map the values of the keys in Roles to an array
      return Object.keys(Roles).map((key) => {
        return Roles[key];
      });
    })(),
    default: Roles.User
  }
});

userSchema.pre('save', function(next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

userSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

// ensure the schema of the supplied object is appropriate
userSchema.statics.transform = function(user) {
  user = user || {};
  let schema = {
    _id: null,
    name: {
      first: null,
      last: null
    },
    email: null,
    role: null
  };
  return _.pick(_.defaults(user, schema), _.keys(schema));
};

userSchema.statics.Roles = function() {
  return Roles;
};

let User = mongoose.model('User', userSchema);

module.exports = User;

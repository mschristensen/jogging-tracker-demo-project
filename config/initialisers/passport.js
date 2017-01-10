const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../../app/models/user.js');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = process.env.SECRET;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findById(jwt_payload._doc._id, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
};

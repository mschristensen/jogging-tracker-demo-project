'use strict';

const Response = require('../helpers/response.js');
const passport = require('passport');
const User = require('../models/user.js');

module.exports = function(opts, req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if(err) { return next(err); }
    if(!user) { return Response.Forbidden().send(res); }

    User.findOne({
      email: user.email
    }, function(err, user) {
      if(err) throw err;
      if(opts.allowedRoles.indexOf(user.role) === -1) {
        return Response.Forbidden({ allowedRoles: opts.allowedRoles }).send(res);
      }
      req.user = user;
      return next();
    });
  })(req, res, next);
};

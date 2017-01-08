'use strict';

const Response = require('../response.js');
const passport = require('passport');

module.exports = function(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if(err) { return next(err); }
    if(!user) { return Response.Forbidden().send(res); }
    return Response.OK().send(res);
  })(req, res, next);
};

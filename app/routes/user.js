'use strict';

var Response = require('../response.js');
var User = require('../models/user.js');

module.exports = function(router) {
  router.route('/')
  .get(function(req, res, next) {
    User.find({}, function(err, users) {
      Response.OK(users).send(res);
    });
  });
};

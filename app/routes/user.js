'use strict';

const Response = require('../response.js');
const User = require('../models/user.js');
const passport = require('passport');
const Strategy = require('passport-local');
const logger = require('winston');
const authenticate = require('../middleware/authenticate.js');
const UserController = require('../controllers/user.js');

module.exports = function(router) {
  router.route('/')
    .get(authenticate, function(req, res, next) {
      User.find({}, function(err, users) {
        return Response.OK(users).send(res);
      });
    })
    .post(function(req, res) {
      UserController.signup(req.body).then(function(response) {
        return response.send(res);
      }, function() {
        return Response.InternalServerError().send(res);
      });
    });

  router.route('/authenticate')
    .post(function(req, res) {
      UserController.login(req.body).then(function(response) {
        return response.send(res);
      }, function() {
        return Response.InternalServerError().send(res);
      });
    });
};

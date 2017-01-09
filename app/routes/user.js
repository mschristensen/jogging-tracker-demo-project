'use strict';

const Response = require('../helpers/response.js');
const logger = require('winston');
const authenticate = require('../middleware/authenticate.js');
const User = require('../models/user.js');
const UserController = require('../controllers/user.js');

module.exports = function(router) {
  router.route('/')
    .get(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      User.find({}, function(err, users) {
        for(let idx in users) {
          users[idx] = User.transform(users[idx], User.Roles().User);
        }
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

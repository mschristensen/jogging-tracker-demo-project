'use strict';

const Response = require('../helpers/response.js');
const logger = require('winston');
const authenticate = require('../middleware/authenticate.js');
const User = require('../models/user.js');
const UserController = require('../controllers/user.js');
const Util = require('../helpers/util.js');

module.exports = function(router) {
  router.route('/')
    .post(function(req, res) {
      let userData = {
        email: req.body.email,
        password: req.body.password
      };
      try {
        userData.name = JSON.parse(req.body.name);
      } catch(err) {
        return Response.InvalidArguments(['name']).send(res);
      }
      UserController.signup(userData).then(function(response) {
        return response.send(res);
      }, function() {
        return Response.InternalServerError().send(res);
      });
    })
    .get(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      UserController.read().then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error reading users', err);
        return Response.InternalServerError().send(res);
      });
    });

  router.route('/me')
    .get(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      UserController.read({ _id: req.user._id }).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error reading authenticated user', err);
        return Response.InternalServerError().send(res);
      });
    })
    .put(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      let userData = {};
      if(req.body.email) userData.email = req.body.email;
      if(req.body.role) userData.role = req.body.role;
      try {
        if(req.body.name) userData.name = JSON.parse(req.body.name);
      } catch(err) {
        return Response.InvalidArguments(['name']).send(res);
      }
      UserController.update({ _id: req.user._id }, userData).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error updating authenticated user', err);
        return Response.InternalServerError().send(res);
      });
    })
    .delete(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      UserController.delete({ _id: req.user._id }).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error deleting authenticated user', err);
        return Response.InternalServerError().send(res);
      });
    });

  router.route('/:id')
    .put(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      // User role can only update self
      if(!(Util.compareObjectIds(req.user._id, req.params.id)) && req.user.role === User.Roles().User) {
        return Response.Forbidden().send(res);
      }

      let userData = {};
      if(req.body.email) userData.email = req.body.email;
      if(req.body.role) userData.role = req.body.role;
      try {
        if(req.body.name) userData.name = JSON.parse(req.body.name);
      } catch(err) {
        return Response.InvalidArguments(['name']).send(res);
      }
      UserController.update({ _id: req.params.id }, userData).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error updating specified user', err);
        return Response.InternalServerError().send(res);
      });
    })
    .delete(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      // User role can only delete self
      if(!(Util.compareObjectIds(req.user._id, req.params.id)) && req.user.role === User.Roles().User) {
        return Response.Forbidden().send(res);
      }

      UserController.delete({ _id: req.params.id }).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error deleting specified user', err);
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

'use strict';

const Response = require('../helpers/response.js');
const logger = require('winston');
const authenticate = require('../middleware/authenticate.js');
const Jog = require('../models/jog.js');
const User = require('../models/user.js');
const JogController = require('../controllers/jog.js');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(router) {
  router.route('/')
    .get(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      let jogData = {};
      if(req.user.role === User.Roles().Admin && req.body.user_id) {
        // Admins can read any user's jogs, given by <user_id>
        jogData.user_id = new ObjectId(req.body.user_id);
      } else {
        // Otherwise read authenticated user's own jogs
        jogData.user_id = new ObjectId(req.user._id);
      }

      JogController.read(jogData).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error reading jogs', err);
        return Response.InternalServerError().send(res);
      });
    })
    .post(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res) {
      let jogData = {
        date: req.body.date,
        distance: req.body.distance,
        time: req.body.time
      };

      if(req.user.role === User.Roles().Admin && req.body.user_id) {
        // Admins can create on behalf of any user, given by <user_id>
        jogData.user_id = new ObjectId(req.body.user_id);
      } else {
        // Otherwise create on behalf of authenticated user
        jogData.user_id = new ObjectId(req.user._id);
      }

      JogController.create(jogData).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error creating new jog', err);
        return Response.InternalServerError().send(res);
      });
    });
};

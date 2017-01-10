'use strict';

const Response = require('../helpers/response.js');
const logger = require('winston');
const authenticate = require('../middleware/authenticate.js');
const Jog = require('../models/jog.js');
const User = require('../models/user.js');
const JogController = require('../controllers/jog.js');
const ObjectId = require('mongoose').Types.ObjectId;
const Util = require('../helpers/util.js');

module.exports = function(router) {
  router.route('/')
    .get(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      let jogData = {};
      if(req.query.user_id) {
        // Only Admins can read any user's jogs, given by <user_id>
        // Non-Admins can only query using their own id
        if(req.user.role === User.Roles().Admin) {
          try {
            jogData.user_id = new ObjectId(req.query.user_id);
          } catch(err) {
            return Response.MongooseError(err).send(res);
          }
        } else if(!(Util.compareObjectIds(req.user._id, req.query.user_id))) {
          return Response.Forbidden().send(res);
        }
      } else {
        // Otherwise read authenticated user's own jogs
        try {
          jogData.user_id = new ObjectId(req.user._id);
        } catch(err) {
          return Response.MongooseError(err).send(res);
        }
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

      if(req.body.user_id) {
        if(req.user.role === User.Roles().Admin) {
          try {
            // Admins can create on behalf of any user, given by <user_id>
            jogData.user_id = new ObjectId(req.body.user_id);
          } catch(err) {
            return Response.MongooseError(err).send(res);
          }
        } else {
          return Response.Forbidden().send(res);
        }
      } else {
        // Otherwise create on behalf of authenticated user
        try {
          jogData.user_id = new ObjectId(req.user._id);
        } catch(err) {
          return Response.MongooseError(err).send(res);
        }
      }

      JogController.create(jogData).then(function(response) {
        return response.send(res);
      }, function(err) {
        logger.error('error creating new jog', err);
        return Response.InternalServerError().send(res);
      });
    });

  router.route('/:id')
    .put(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      Jog.findOne({ _id: req.params.id }, function(err, jog) {
        if(err) return Response.MongooseError(err).send(res);
        if(!jog) return Response.NotFound().send(res);

        // Only Admins can update other user's jogs
        if(!(Util.compareObjectIds(req.user._id, jog.user_id)) && req.user.role !== User.Roles().Admin) {
          return Response.Forbidden().send(res);
        }

        let jogData = {};
        if(req.body.user_id) {
          try {
            jogData.user_id = new ObjectId(req.body.user_id);
          } catch(err) {
            return Response.MongooseError(err).send(res);
          }
        }
        if(req.body.date) jogData.date = req.body.date;
        if(req.body.distance) jogData.distance = req.body.distance;
        if(req.body.time) jogData.time = req.body.time;
        JogController.update({ _id: req.params.id }, jogData).then(function(response) {
          return response.send(res);
        }, function(err) {
          logger.error('error updating specified jog', err);
          return Response.InternalServerError().send(res);
        });
      });
    })
    .delete(function(req, res, next) {
      return authenticate({
        allowedRoles: [User.Roles().User, User.Roles().UserManager, User.Roles().Admin]
      }, req, res, next);
    }, function(req, res, next) {
      Jog.findOne({ _id: req.params.id }, function(err, jog) {
        if(err) return Response.MongooseError(err).send(res);
        if(!jog) return Response.NotFound().send(res);

        // Only Admins can delete other user's jogs
        if(!(Util.compareObjectIds(req.user._id, jog.user_id)) && req.user.role !== User.Roles().Admin) {
          return Response.Forbidden().send(res);
        }

        JogController.delete({ _id: req.params.id }).then(function(response) {
          return response.send(res);
        }, function(err) {
          logger.error('error deleting specified jog', err);
          return Response.InternalServerError().send(res);
        });
      });
    });
};

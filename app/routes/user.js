'use strict';

const Response = require('../response.js');
const User = require('../models/user.js');
const passport = require('passport');
const Strategy = require('passport-local');
const jwt = require('jsonwebtoken');
const logger = require('winston');

module.exports = function(router) {
  router.route('/')
    .get(passport.authenticate('jwt', { session: false }), function(req, res, next) {
      User.find({}, function(err, users) {
        return Response.OK(users).send(res);
      });
    })
    .post(function(req, res) {
      if(!req.body.email || !req.body.password) {
        return Response.BadRequest({ message: 'missing email or password' }).send(res);
      } else {
        User.findOne({
          email: req.body.email
        }, function(err, user) {
          if(err) throw err;

          if(user) {
            return Response.BadRequest({ message: 'user already exists' }).send(res);
          }

          try {
            let newUser = new User({
              email: req.body.email,
              password: req.body.password,
              name: JSON.parse(req.body.name)
            });
          } catch(err) {
            return Response.BadRequest({ message: "unable to parse some arguments" }).send(res);
          }

          newUser.save(function(err) {
            if (err) {
              if(err.name === 'ValidationError') {
                let invalids = [];
                for(let invalid in err.errors) {
                  invalids.push(invalid);
                }
                return Response.BadRequest({ InvalidArguments: invalids }).send(res);
              } else {
                logger.error('unable to save new user:', err);
                return Response.InternalServerError({ message: 'unable to save user' }).send(res);
              }
            }
            Response.OK().send(res);
          });
        });
      }
    });

  router.route('/authenticate')
    .post(function(req, res) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (err) throw err;

        if (!user) {
          return Response.NotFound().send(res);
        } else {
          user.comparePassword(req.body.password, function(err, isMatch) {
            if (isMatch && !err) {
              let token = jwt.sign(user, process.env.SECRET, {
                expiresIn: 86400  // 24 hours
              });
              return Response.OK({ token: 'JWT ' + token }).send(res);
            } else {
              return Response.Forbidden().send(res);
            }
          });
        }
      });
    });
};

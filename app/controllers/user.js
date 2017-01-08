'use strict';

const Response = require('../helpers/response.js');
const User = require('../models/user.js');
const logger = require('winston');
const jwt = require('jsonwebtoken');

let UserController = {};

UserController.signup = function(data) {
  return new Promise(function(resolve, reject) {
    if(!data.email || !data.password) {
      return resolve(Response.BadRequest({ message: 'missing email or password' }));
    }

    User.findOne({
      email: data.email
    }, function(err, user) {
      if(err) throw err;

      if(user) {
        return resolve(Response.BadRequest({ message: 'user already exists' }));
      }

      let newUser;
      try {
        newUser = new User({
          email: data.email,
          password: data.password,
          name: JSON.parse(data.name)
        });
      } catch(err) {
        return resolve(Response.BadRequest({ message: "unable to parse some arguments" }));
      }

      newUser.save(function(err) {
        if (err) {
          if(err.name === 'ValidationError') {
            let invalids = [];
            for(let invalid in err.errors) {
              invalids.push(invalid);
            }
            return resolve(Response.BadRequest({ InvalidArguments: invalids }));
          } else {
            logger.error('unable to save new user:', err);
            return resolve(Response.InternalServerError({ message: 'unable to save user' }));
          }
        }
        return resolve(Response.OK());
      });
    });
  });
};

UserController.login = function(data) {
  return new Promise(function(resolve, reject) {
    User.findOne({
      email: data.email
    }, function(err, user) {
      if (err) throw err;
      if (!user) return resolve(Response.NotFound());

      user.comparePassword(data.password, function(err, isMatch) {
        if(!isMatch || err) return resolve(Response.Forbidden());
        let token = jwt.sign(user, process.env.SECRET, {
          expiresIn: 86400  // 24 hours
        });
        return resolve(Response.OK({ token: 'JWT ' + token }));
      });
    });
  });
};

module.exports = UserController;

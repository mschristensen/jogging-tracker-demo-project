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
          return resolve(Response.MongooseError(err));
        }
        UserController.login(data).then(function(response) {
          return resolve(response);
        }, reject);
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

UserController.read = function(select) {
  return new Promise(function(resolve, reject) {
    select = select || {};
    User.find(select, function(err, users) {
      if(err) return reject(err);
      for(let idx in users) {
        users[idx] = User.transform(users[idx]);
      }
      return resolve(Response.OK(users));
    });
  });
};

UserController.update = function(select, data) {
  return new Promise(function(resolve, reject) {
    User.findOne(select, function(err, user) {
      for(let key in data) {
        user[key] = data[key];
      }
      user.save(function(err, updatedUser) {
        if(err) return resolve(Response.MongooseError(err));
        updatedUser = User.transform(updatedUser);
        return resolve(Response.OK(updatedUser));
      });
    });
  });
};

module.exports = UserController;

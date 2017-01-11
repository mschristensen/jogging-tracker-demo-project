'use strict';

const Response = require('../helpers/response.js');
const User = require('../models/user.js');
const Jog = require('../models/jog.js');
const logger = require('winston');
const jwt = require('jsonwebtoken');

let UserController = {};

UserController.signup = function(data) {
  return new Promise(function(resolve, reject) {
    if(!data.email || !data.password) {
      let invalids = [];
      if(!data.email) invalids.push('email');
      if(!data.password) invalids.push('password');
      return resolve(Response.InvalidArguments(invalids));
    }

    User.findOne({
      email: data.email
    }, function(err, user) {
      if(err) return resolve(Response.MongooseError(err));

      if(user) {
        return resolve(Response.BadRequest({ message: 'user already exists' }));
      }

      new User(data).save(function(err) {
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
      if(err) return resolve(Response.MongooseError(err));
      if(!user) return resolve(Response.NotFound());

      user.comparePassword(data.password, function(err, isMatch) {
        if(!isMatch || err) return resolve(Response.Forbidden());
        let token = jwt.sign(user, process.env.SECRET, {
          expiresIn: 60 * 60 * 12  // 12 hours
        });
        user = User.transform(user);
        return resolve(Response.OK({
          token: 'JWT ' + token,
          user: user
        }));
      });
    });
  });
};

UserController.read = function(select) {
  return new Promise(function(resolve, reject) {
    select = select || {};
    User.find(select, function(err, users) {
      if(err) return reject(err);
      if(users.length === 0) return resolve(Response.NotFound());
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
      if(err) return reject(err);
      if(!user) return resolve(Response.NotFound());
      for(let key in data) {
        user[key] = data[key];
      }
      user.save(function(err, updatedUser) {
        if(err) return resolve(Response.MongooseError(err));
        updatedUser = [User.transform(updatedUser)];
        return resolve(Response.OK(updatedUser));
      });
    });
  });
};

UserController.delete = function(select) {
  return new Promise(function(resolve, reject) {
    if(!select._id) return resolve(Response.InvalidArguments(['id']));

    User.findOneAndRemove(select, function(err, user) {
      if(err) return resolve(Response.MongooseError(err));
      if(!user) return resolve(Response.NotFound());

      // delete all jogs for this user
      Jog.remove({ user_id: select._id }, function(err) {
        if(err) return resolve(Response.MongooseError(err));
        return resolve(Response.OK());
      });
    });
  });
};

module.exports = UserController;

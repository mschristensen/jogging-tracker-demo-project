/* global before */
/* global describe */
'use strict';

const nconf = require('nconf');
const mongoose = require('mongoose');
const User = require('../app/models/user.js');

// Load env vars from .env file into process.env
require('dotenv').load();
nconf.use('memory');
nconf.argv();
nconf.env();

function createUserManager() {
  return new Promise(function(resolve, reject) {
    new User({
      email: 'usermanager@test.com',
      password: 'password',
      name: {
        first: 'UserManager',
        last: 'Test'
      },
      role: User.Roles().UserManager
    }).save(function(err) {
      if(err) return reject(err);
      return resolve();
    });
  });
}

function createAdmin() {
  return new Promise(function(resolve, reject) {
    new User({
      email: 'admin@test.com',
      password: 'password',
      name: {
        first: 'Admin',
        last: 'Test'
      },
      role: User.Roles().Admin
    }).save(function(err) {
      if(err) return reject(err);
      return resolve();
    });
  });
}

describe('API Test', () => {
  // before running tests, empty the database and create UserManager and Admin users
  before(function (done) {
    mongoose.connect(process.env.MONGOLAB_URI, function(err) {
      if(err) throw err;
      mongoose.connection.db.dropDatabase(function(err) {
        if(err) throw err;
        createUserManager().then(createAdmin).then(function() {
          return done();
        }).catch(function(err) {
          throw err;
        });
      });
    });
  });

  require('./user.js')();
  require('./jog.js')();
});

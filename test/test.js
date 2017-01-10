/* global before */
/* global beforeEach */
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

function connectToDB() {
  return new Promise(function(resolve, reject) {
    if(mongoose.connection.readyState !== 1) {  // if not connected...
      mongoose.connect(process.env.MONGOLAB_URI, function(err) {
        if(err) return reject(err);
        resolve();
      });
    } else {
      return resolve();
    }
  });
}

function initDB() {
  return new Promise(function(resolve, reject) {
    connectToDB().then(function() {
      mongoose.connection.db.dropDatabase(function(err) {
        if(err) return reject(err);
        createUserManager().then(createAdmin).then(function() {
          return resolve();
        }).catch(reject);
      });
    });
  });
}

function makeSuite(name, tests) {
  describe(name, function () {
    // before each test suite, empty the database and create UserManager and Admin users
    before(function(done) {
      initDB().then(done, function(err) {
        throw err;
      });
    });
    tests();
  });
}

describe('API Test', () => {
  //makeSuite('Users', require('./user.js'));
  makeSuite('Jogs', require('./jog.js'));
});

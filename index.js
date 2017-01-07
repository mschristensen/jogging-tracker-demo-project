'use strict';

var server = require('./config/initialisers/server');
var database = require('./config/initialisers/database');
var nconf = require('nconf');
var logger = require('winston');

// Load env vars from .env file into process.env
require('dotenv').load();

// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables from process.env
nconf.env();
// Load config file for the environment
require('./config/environments/' + nconf.get('NODE_ENV'));

logger.info('[APP] Starting server initialization');

// Start the server
module.exports = new Promise(function(resolve, reject) {
  database().then(server).then(function(app) {
    logger.info('[APP] initialized SUCCESSFULLY');
    resolve(app);
  }).catch(function(err) {
    logger.error('[APP] initialization failed', err);
    reject(err);
  });
});

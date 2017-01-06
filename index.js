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
database().then(server).catch(function(err) {
  if (err) {
    logger.error('[APP] initialization failed', err);
  } else {
    logger.info('[APP] initialized SUCCESSFULLY');
  }
});

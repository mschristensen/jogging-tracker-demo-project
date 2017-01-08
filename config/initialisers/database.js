'use strict';

const mongoose = require('mongoose');
const logger = require('winston');

module.exports = function() {
  return new Promise(function(resolve, reject) {

    mongoose.connect(process.env.MONGOLAB_URI, function(err) {
      if(err) {
        logger.error('[DATABASE] Unable to connect to database:', err);
        return reject();
      }
      logger.info('[DATABASE] Connected to database');
      resolve();
    });
  });
};

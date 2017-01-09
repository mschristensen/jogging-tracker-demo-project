'use strict';

const Response = require('../helpers/response.js');
const Jog = require('../models/jog.js');
const logger = require('winston');

let JogController = {};

JogController.create = function(data) {
  return new Promise(function(resolve, reject) {
    let newJog = new Jog(data);
    newJog.save(function(err) {
      if (err) {
        return resolve(Response.MongooseError(err));
      }
      return resolve(Response.OK());
    });
  });
};

JogController.read = function(data) {
  return new Promise(function(resolve, reject) {
    Jog.find(data).limit(20).exec(function(err, jogs) {
      if(err) {
        return resolve(Response.MongooseError(err));
      }
      for(let idx in jogs) {
        jogs[idx] = Jog.transform(jogs[idx]);
      }
      return resolve(Response.OK(jogs));
    });
  });
};

module.exports = JogController;

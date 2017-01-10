'use strict';

const Response = require('../helpers/response.js');
const Jog = require('../models/jog.js');
const logger = require('winston');

let JogController = {};

JogController.create = function(data) {
  return new Promise(function(resolve, reject) {
    let newJog = new Jog(data);
    newJog.save(function(err, jog) {
      if(err) {
        return resolve(Response.MongooseError(err));
      }
      jog = [Jog.transform(jog)];
      return resolve(Response.OK(jog));
    });
  });
};

JogController.read = function(data) {
  return new Promise(function(resolve, reject) {
    Jog.find(data).limit(20).exec(function(err, jogs) {
      if(err) {
        return resolve(Response.MongooseError(err));
      }
      if(jogs.length === 0) return resolve(Response.NotFound());
      for(let idx in jogs) {
        jogs[idx] = Jog.transform(jogs[idx]);
      }
      return resolve(Response.OK(jogs));
    });
  });
};

JogController.update = function(select, data) {
  return new Promise(function(resolve, reject) {
    Jog.findOne(select, function(err, jog) {
      if(err) return reject(err);
      if(!jog) return resolve(Response.NotFound());
      for(let key in data) {
        jog[key] = data[key];
      }
      jog.save(function(err, updatedJog) {
        if(err) return resolve(Response.MongooseError(err));
        updatedJog = [Jog.transform(updatedJog)];
        return resolve(Response.OK(updatedJog));
      });
    });
  });
};

JogController.delete = function(select) {
  return new Promise(function(resolve, reject) {
    Jog.findOneAndRemove(select, function(err, jog) {
      if(err) return resolve(Response.MongooseError(err));
      if(!jog) return resolve(Response.NotFound());
      return resolve(Response.OK());
    });
  });
};

module.exports = JogController;

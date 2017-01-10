'use strict';

const ObjectId = require('mongoose').Types.ObjectId;

let Util = {};

Util.compareObjectIds = function(a, b) {
  if(typeof a === 'object') {
    if(!(a instanceof ObjectId)) {
      throw 'Argument 1 invalid';
    }
  } else if(typeof a === 'string') {
    try {
      a = new ObjectId(a);
    } catch(err) {
      throw 'Argument 1 invalid';
    }
  } else {
    throw 'Argument 1 invalid';
  }

  if(typeof b === 'object') {
    if(!(b instanceof ObjectId)) {
      throw 'Argument 2 invalid';
    }
  } else if(typeof b === 'string') {
    try {
      b = new ObjectId(b);
    } catch(err) {
      throw 'Argument 2 invalid';
    }
  } else {
    throw 'Argument 2 invalid';
  }

  return a.equals(b);
};

module.exports = Util;

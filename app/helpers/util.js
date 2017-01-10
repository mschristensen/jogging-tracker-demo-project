'use strict';

const ObjectId = require('mongoose').Types.ObjectId;

let Util = {};

Util.compareObjectIds = function(a, b) {
  if(typeof a === 'object') {
    if(!(a instanceof ObjectId)) {
      throw new TypeError('argument 1 must be an ObjectId or a valid ID string');
    }
  } else if(typeof a === 'string') {
    try {
      a = new ObjectId(a);
    } catch(err) {
      throw new TypeError('argument 1 must be an ObjectId or a valid ID string');
    }
  } else {
    throw new TypeError('argument 1 must be an ObjectId or a valid ID string');
  }

  if(typeof b === 'object') {
    if(!(b instanceof ObjectId)) {
      throw new TypeError('argument 2 must be an ObjectId or a valid ID string');
    }
  } else if(typeof b === 'string') {
    try {
      b = new ObjectId(b);
    } catch(err) {
      throw new TypeError('argument 2 must be an ObjectId or a valid ID string');
    }
  } else {
    throw new TypeError('argument 2 must be an ObjectId or a valid ID string');
  }

  return a.equals(b);
};

module.exports = Util;

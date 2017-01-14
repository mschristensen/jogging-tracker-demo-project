'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const jogSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  distance: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v > 0;
      }
    }
  },
  time: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v > 0;
      }
    }
  }
});

// ensure the schema of the supplied object is appropriate
jogSchema.statics.transform = function(jog) {
  jog = jog || {};
  let schema = {
    _id: null,
    user_id: null,
    date: null,
    distance: null,
    time: null
  };
  return _.pick(_.defaults(jog, schema), _.keys(schema));
};

let Jog = mongoose.model('Jog', jogSchema);

module.exports = Jog;

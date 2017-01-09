'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jogSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  time: {
    type: Number,
    required: true
  }
});

let Jog = mongoose.model('Jog', jogSchema);

module.exports = Jog;

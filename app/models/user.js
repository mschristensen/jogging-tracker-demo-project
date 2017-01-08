'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name:  {
    first: String,
    last: String
  },
  email: String,
  password: String,
  role: String
});

let User = mongoose.model('User', userSchema);

module.exports = User;

/* jshint expr: true */
/* global before */
/* global describe */
/* global it */
'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const api = require('supertest')('http://localhost:3000/api');

module.exports = function() {
  // (login as User One)
  // create jog
  // fail to create valid jog
  // read jog
  // (login as User Two)
  // fail to read User One's jog
  // (login as Admin)
  // create own jog
  // create jog for User
  // read own jogs
  // read User's jogs
};

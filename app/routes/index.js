var changeCase = require('change-case');
var express = require('express');
var routes = require('require-dir')();  // requires all other files in this directory

module.exports = function(app) {
  'use strict';

  // Initialize all routes
  Object.keys(routes).forEach(function(routeName) {
    var router = express.Router();

    // Middleware:
    // router.use(someMiddleware);

    // Initialize the route
    require('./' + routeName)(router);

    // Tie the router to it's url path
    app.use('/' + changeCase.paramCase(routeName), router);
  });
};

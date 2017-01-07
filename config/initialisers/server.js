'use strict';

var express = require('express');
var config = require('nconf');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('winston');
var app;

module.exports = function() {
  return new Promise(function(resolve, reject) {
    app = express();

    // Security
    var helmet = require('helmet')
    app.use(helmet())

    app.use(morgan('common'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ type: '*/*' }));

    logger.info('[SERVER] Initializing routes');
    require('../../app/routes/index')(app);

    // Serve up the web app
    app.use('/', express.static(__dirname + '/../../public'));

    // Error handler
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: (app.get('env') === 'development' ? err : {})
      });
      next(err);
    });

    app.listen(config.get('PORT'));
    logger.info('[SERVER] Listening on port ' + config.get('PORT'));

    return resolve();
  });
};

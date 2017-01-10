'use strict';

const express = require('express');
const config = require('nconf');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('winston');
const passport = require('passport');
let app;

module.exports = function() {
  return new Promise(function(resolve, reject) {
    app = express();

    // Security
    let helmet = require('helmet');
    app.use(helmet());
    // Log HTTP requests when in production
    if(process.env.NODE_ENV === 'production') {
      app.use(morgan('common'));
    }
    // Parse request bodies
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ type: '*/*' }));
    // Auth
    app.use(passport.initialize());
    require('./passport.js')(passport);

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

    return resolve(app);
  });
};

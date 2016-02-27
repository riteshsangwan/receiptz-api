'use strict';

/**
 * A simple logger module to log all the incoming requests
 *
 * @author      ritesh
 * @version     1.0.0
 */

var logger = require('winston');

var middleware = function(req, res, next) {
  logger.info('Incoming request body [ ' + JSON.stringify(req.body) + ' ]');
  next();
};

module.exports = function() {
  return middleware;
};
'use strict';

/**
 * Main file for the module
 * @author      ritesh
 * @version     1.0.0
 */

/**
 * Module dependencies
 */
var logging = require('winston'),
  httpStatus = require('http-status');

var TEST_ENV = 'test';

/**
 * Constructor function
 */
function Responser(opts) {
  var options = opts || {};
  options.defaultStatusCode = options.defaultStatusCode ? options.defaultStatusCode: httpStatus.OK;
  this.options = options;
}

/**
 * Middleware function
 * This middleware is added after the controllers, this will serialize the data into JSON and respond to client
 *
 * @param   {Object}    req             express request instance
 * @param   {Object}    res             express response instance
 * @param   {Function}  next            next function(middleware) to call
 */
Responser.prototype.middleware = function() {
  var _self = this;
  return function(req, res, next) {
    if(!req.data) {
      if(next) {
        return next();
      } else {
        res.end();
      }
    }
    // log the response if environment is not test and debug is set to true
    if(process.env.NODE_ENV !== TEST_ENV && _self.options.debug) {
      logging.debug('Exiting from responser', req.data);
    }
    var statusCode = req.data.statusCode || _self.options.defaultStatusCode;
    if(req.data.content) {
      res.status(statusCode).json(req.data.content);
    } else {
      res.status(req.data.statusCode || httpStatus.NO_CONTENT).send();
    }
  };
};

// module exports
module.exports = Responser;
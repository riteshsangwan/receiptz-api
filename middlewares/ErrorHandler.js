'use strict';

/**
 * Main file for the module
 * @author      ritesh
 * @version     1.0.0
 */

/**
 * Module dependencies
 * @private
 */
var errors = require('common-errors');
var logging = require('winston');

var DEFAULT_NAME = 'ServerError',
  DEFAULT_MESSAGE = 'Internal server error';

/**
 * Constructor function
 */
function ErrorHandler(options) {
  this.options = options || {};
}

/**
 * This function will return the middleware function
 * This function is added to the express application as last middleware in the middleware stack.
 * This will log the error and will send the appropriate message to the client.
 */
ErrorHandler.prototype.middleware = function() {
  return function(err, req, res, next) {
    // if the error is not defined
    if(!err) {
      if(next) {
        return next();
      } else {
        return res.end();
      }
    }
    logging.error('Error while processing request', err);
    if(err instanceof Error) {
      var httpError = new errors.HttpStatusError(err);
      if(err.statusCode >= 500) {
        httpError.message = DEFAULT_MESSAGE;
      }
      res.status(httpError.statusCode).json({ message: httpError.message, name: err.name || DEFAULT_NAME });
    }
  };
};

// module exports
module.exports = ErrorHandler;
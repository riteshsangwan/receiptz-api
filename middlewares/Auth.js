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
var tokenStrategy = require('./lib/TokenStrategy'),
  _ = require('lodash'),
  keyStrategy = require('./lib/KeyStrategy');

function Auth(opts) {
  if(!opts || !opts.jwtSecret) {
    throw new Error('Jwt secret is required');
  }
  this.options = opts;
}

Auth.strategy = {
  token: 'token',
  apiKey: 'apiKey'
};

/**
 * Process function
 * This will read the config object and return middleware function,
 * the middleware function is added to each route to perform authentication and authorization
 *
 * @param   {Object}    req             config object
 */
Auth.prototype.process = function(config) {
  _.extend(config, this.options);
  if(config.strategy === Auth.strategy.token) {
    return tokenStrategy(config);
  } else if(config.strategy === Auth.strategy.apiKey) {
    return keyStrategy(config);
  } else {
    throw new Error('Unsupported authentication strategy');
  }
};

// export the constructor
module.exports = Auth;
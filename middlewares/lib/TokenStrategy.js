'use strict';

/**
 * Authentication based on token strategy
 * @author      ritesh
 * @version     1.0.0
 */

var jwt = require('jwt-simple'),
  errors = require('common-errors'),
  moment = require('moment');

var authorizationTypes = {
  bearer: 'Bearer'
};

module.exports = function(config) {
  return function(req, res, next) {
    var authorizationHeader = req.get('Authorization');
    // authenticaiton logic
    if(authorizationHeader) {
      var splitted = authorizationHeader.split(' ');
      if(splitted.length !== 2 || splitted[0] !== authorizationTypes.bearer) {
        return next(new errors.AuthenticationRequiredError('Invalid authorization header'));
      }
      var token = splitted[1];
      req.auth = jwt.decode(token, config.jwtSecret);
      if(req.auth.expiration > moment().valueOf()) {
        return next();
      }
      next(new errors.AuthenticationRequiredError('Authorization token is expired'));
    } else {
      next(new errors.AuthenticationRequiredError('Missing authorization header'));
    }
  };
};
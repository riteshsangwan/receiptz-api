'use strict';

/**
 * This module exposes route handler methods for '/countries' ENDPOINT
 *
 * @author      ritesh
 * @version     1.0.0
 */

var countryService = require('../services/CountryService'),
  httpStatus = require('http-status');

/**
 * Get all countries list
 * Route handler for GET '/countries' endpoint
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.getAll = function(req, res, next) {
  countryService.getAll(function(err, countries) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: countries
    };
    next();
  });
};
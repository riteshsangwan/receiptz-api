'use strict';

/**
 * Organization controller
 * This controller honour the REST API contract for '/organizations' EXNPOINT
 *
 * @author      ritesh
 * @version     1.0.0
 */

var organizationService = require('../services/OrganizationService'),
  async = require('async'),
  httpStatus = require('http-status');

var constants = require('../constants');
var controllerHelper = require('./ControllerHelper');
var _ = require('lodash');

/**
 * Validate the given entity to be a valid organization schema data
 * @param  {Object}     entity          entity to validate
 * @param  {Function}   callback        entity to validate
 */
var _validateOrganization = function(entity, callback) {

  var picked = _.pick(entity, 'firstName', 'lastName', 'email', 'password', 'country', 'mobileNumber', 'name', 'streetAddress', 'city', 'state', 'tax', 'zipCode');

  var error = controllerHelper.checkString(picked.firstName, 'First Name') || controllerHelper.checkString(picked.lastName, 'Last Name') ||
                controllerHelper.checkEmail(picked.email, 'Email') || controllerHelper.checkString(picked.password, 'Password');

  error = error || controllerHelper.checkDefined(picked.country, 'Country') || controllerHelper.checkString(picked.mobileNumber, 'Mobile Number');
  // validate organization field
  error = error || controllerHelper.checkString(picked.name, 'name') || controllerHelper.checkString(picked.streetAddress, 'Street Address') ||
            controllerHelper.checkString(picked.city, 'city') || controllerHelper.checkString(picked.state, 'state') || controllerHelper.checkPositiveNumber(picked.tax, 'tax') || controllerHelper.checkString(picked.zipCode, 'Zip code');
  if(error) {
    return callback(error);
  }
  callback(null, picked);
};

/**
 * Route handler for POST '/organizations' endpoint
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.create = function(req, res, next) {
  async.waterfall([
    function(cb) {
      _validateOrganization(req.body, cb);
    },
    function(entity, cb) {
      var organization = _.pick(entity, 'name', 'streetAddress', 'city', 'state', 'country', 'tax', 'zipCode');
      var user = _.pick(entity, 'firstName', 'lastName', 'email', 'password', 'mobileNumber', 'country');
      user.type = constants.userTypes.BUSINESS_EMPLOYEE;
      organizationService.create(organization, user, cb);
    }
  ], function(err, content) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.CREATED,
      content: content
    };
    next();
  });
};
'use strict';

/**
 * Helper utility class for all the controllers
 * This class exports some common validation functions as well as filtering functions
 * @author      ritesh
 * @version     1.0
 */

/* Globals */
var _ = require('lodash'),
  httpStatus = require('http-status'),
  constants = require('../constants'),
  errors = require('common-errors');

var tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+$/;
/**
 * Validate that given value is a valid String
 *
 * @param  {String}           val      String to validate
 * @param  {String}           name     name of the string property
 * @return {Error/Undefined}           Error if val is not a valid String otherwise undefined
 */
exports.checkString = function(val, name) {
  if(!_.isString(val)) {
    return new errors.ValidationError(name + ' should be a valid string', httpStatus.BAD_REQUEST);
  }
};

/**
 * Validate that given value is a valid Date
 *
 * @param  {Date/String}           val      Date to validate
 * @param  {String}                name     name of the Date property
 * @return {Error/Undefined}                Error if val is not a valid String otherwise undefined
 */
exports.checkDate = function(val, name) {
  // string representation of date
  if(_.isString(val)) {
    var date = new Date(val);
    if(!_.isDate(date)) {
      return new errors.ValidationError(name + ' should be a valid String representation of Date', httpStatus.BAD_REQUEST);
    }
  } else {
    if(!_.isDate(val)) {
      return new errors.ValidationError(name + ' should be a valid Date', httpStatus.BAD_REQUEST);
    }
  }
};

/**
 * Validate that given value is a valid positive number
 *
 * @param  {Number}                val      Number to validate
 * @param  {String}                name     name of the Number property
 * @return {Error/Undefined}                Error if val is not a valid String otherwise undefined
 */
exports.checkPositiveNumber = function(val, name) {
  val = parseInt(val);
  if(!_.isNumber(val) || isNaN(val)) {
    return new errors.ValidationError(name + ' should be a valid number', httpStatus.BAD_REQUEST);
  } else if(val < 0) {
    return new errors.ValidationError(name + ' should be a valid positive number', httpStatus.BAD_REQUEST);
  }
};

/**
 * Validate that given obj is defined
 *
 * @param  {Object}                val      Object to validate
 * @param  {String}                name     name of the object
 * @return {Error/Undefined}                Error if val is not a valid String otherwise undefined
 */
exports.checkDefined = function(obj, name) {
  if(_.isUndefined(obj)) {
    return new errors.ValidationError(name + ' should be defined', httpStatus.BAD_REQUEST);
  }
};

/**
 * Validate that given email is valid email
 *
 * @param  {Object}                val      Object to validate
 * @param  {String}                name     name of the Email property
 * @return {Error/Undefined}                Error if val is not a valid String otherwise undefined
 */
exports.checkEmail = function(email, name) {
  var isValid = true;
  if(!email || email.length > 254) {
    isValid = false;
  } else if(!tester.test(email)) {
    isValid = false;
  }
  var parts = email.split('@');
  if(parts[0].length > 64) {
    isValid = false;
  }
  var domainParts = parts[1].split('.');
  if(domainParts.some(function(domainPart) { return domainPart.length > 63; })) {
    isValid = false;
  }
  if(!isValid) {
    return new errors.ValidationEmail(name + ' should a valid email');
  }
};

/**
 * Validate the val to be a valid device type
 * Valid device types are 'android' 'ios'
 *
 * @param  {Object}                val      value to validate
 * @param  {String}                name     name of the Device Type property
 * @return {Error/Undefined}                Error if val is not a valid String otherwise undefined
 */
exports.checkDeviceType = function(val, name) {
  if(!constants.deviceTypes[val]) {
    return new errors.ValidationError(name + ' is invalid device type');
  }
};
'use strict';

/**
 * Receipt controller
 * This controller honour the REST API contract for '/receipts' EXNPOINT
 *
 * @author      ritesh
 * @version     1.0.0
 */
var async = require('async');
var receiptService = require('../services/ReceiptService');
var httpStatus = require('http-status');
var controllerHelper = require('./ControllerHelper');

/**
 * Validate the given entity to be a valid receipt schema data
 * @param  {Object}     entity          entity to validate
 * @param  {Function}   callback        entity to validate
 */
var _validateReceipt = function(entity, callback) {
  var err = controllerHelper.checkString(entity.mobileNumber, 'Mobile Number') || controllerHelper.checkString(entity.type, 'type');
  callback(err, entity);
};

/**
 * Route handler for POST '/receipts' endpoint
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.create = function(req, res, next) {
  async.waterfall([
    function(cb) {
      _validateReceipt(req.body, cb);
    },
    function(entity, cb) {
      receiptService.create(entity, req.auth, cb);
    }
  ], function(err) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.CREATED
    };
    next();
  });
};

/**
 * Route handler for GET '/receipts' ENDPOINT
 * All the receipts will not be fetched only the receipts which belonged to current organization will be fetched
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.listByOrganization = function(req, res, next) {
  receiptService.listByOrganization(req.auth, function(err, data) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: data
    };
    next();
  });
};

/**
 * Route handler for GET '/me/receipts' ENDPOINT
 * Get all receipts for current loggedin user
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.listByUser = function(req, res, next) {
  receiptService.listByUser(req.auth, function(err, data) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: data
    };
    next();
  });
};

/**
 * Route handler for GET '/receipts/:id' ENDPOINT
 * Get all receipts for current loggedin user
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.get = function(req, res, next) {
  receiptService.findById(req.params.id, function(err, content) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: content
    };
    next();
  });
};
'use strict';

/**
 * This Service exposes the contract with the 'receipts' collection in the database
 *
 * @author      ritesh
 * @version     1.0.0
 */

var ReceiptSchema = require('../models/Receipt').ReceiptSchema,
  config = require('config'),
  errors = require('common-errors'),
  db = require('../datasource').getDb(config.MONGODB_URL),
  organizationService = require('./OrganizationService'),
  userService = require('./UserService'),
  Receipt = db.model('Receipt', ReceiptSchema),
  userTypes = require('../constants').userTypes,
  helper = require('./Helper');

var async = require('async'),
  _ = require('lodash');

/**
 * Expand the receipt object by populating the referenced entities
 * @param  {Object}       receipt         receipt to expand
 * @param  {Function}     callback        callback function
 */
var _expandReceipt = function(receipt, callback) {
  var transformed = helper.filterObject(receipt);
  async.waterfall([
    function(cb) {
      userService.findById(receipt.staffId, cb);
    },
    function(user, cb) {
      var transformedUser = helper.filterObject(user);
      _.extend(transformed, { staff: transformedUser });
      organizationService.findById(receipt.orgId, cb);
    },
    function(organization, cb) {
      var transformedOrganization = helper.filterObject(organization);
      _.extend(transformed, { organization: transformedOrganization });
      cb(null, transformed);
    }
  ], callback);
};

/**
 * Create a receipt.
 * The following operations are performed
 * 1. Authorize the user who is creating the receipt
 * 2. Publish the entity body to receiptNotification queue
 * 3. Publish the entity body to receiptPersist queue
 * The consumers will take the message from each queue and then process it.
 * Response to the client will be returned immediately after publishing to the queues
 *
 * @param  {Object}       entity            entity from client to create
 * @param  {[type]}       auth              authentication context for the current request
 * @param  {Function}     callback          callback function
 */
exports.create = function(entity, auth, callback) {
  async.waterfall([
    function(cb) {
      if(!auth.orgId || auth.type === userTypes.INDIVIDUAL) {
        cb(new errors.NotPermittedError('User is not allowed to perform this operation'));
      } else {
        cb();
      }
    },
    function(cb) {
      organizationService.findById(auth.orgId, cb);
    },
    function(organization, cb) {
      // find the user by mobile number
      userService.findByMobileNumber(entity.mobileNumber, function(err, user) {
        cb(err, organization, user);
      });
    },
    function(organization, user, cb) {
      // if the user is not found, than by default it will save the receipt with mobile number
      if(user) {
        entity.userId = user._id;
      }
      // a receipt should have tax details
      entity.tax = organization.tax;
      entity.orgId = auth.orgId;
      entity.staffId = auth.userId;
      // save the receipt
      Receipt.create(entity, function(err, saved) {
        cb(err, user, saved);
      });
    },
    function(user, saved, cb) {
      // send the notification to the user, if user is available in system
      if(user) {
        helper.sendNotification(user, saved, cb);
      } else {
        // do nothing
        cb();
      }
    }
  ], callback);
};

/**
 * List all the receipts for the given organization identified by the authentication context
 * @param  {Object}       auth            authentication context for the current request
 * @param  {Function}     callback        callback function
 */
exports.listByOrganization = function(auth, callback) {
  if(!auth.orgId || auth.type === userTypes.INDIVIDUAL) {
    return callback(new errors.NotPermittedError('User is not allowed to perform this operation'));
  }
  Receipt.find({ orgId: auth.orgId }, callback);
};

/**
 * List all the receipts for the current loggedin user
 * @param  {Object}       auth            authentication context for the current request
 * @param  {Function}     callback        callback function
 */
exports.listByUser = function(auth, callback) {
  async.waterfall([
    function(cb) {
      Receipt.find({userId: auth.userId}, cb);
    },
    function(receipts, cb) {
      async.map(receipts, _expandReceipt, cb);
    }
  ], callback);

};

/**
 * Get a receipt by id
 * @param  {String}       id              id of the receipt to get
 * @param  {Function}     callback        callback function
 */
exports.findById = function(id, callback) {
  Receipt.findById(id, function(err, receipt) {
    if(err) {
      callback(err);
    } else if(!receipt) {
      callback(new errors.NotFoundError('Receipt not found for given id'));
    } else {
      _expandReceipt(receipt, function(err, expanded) {
        callback(err, expanded);
      });
    }
  });
};
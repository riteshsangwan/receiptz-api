'use strict';

/**
 * This Service exposes the contract with the 'organizations' collection in the database
 *
 * @author      ritesh
 * @version     1.0.0
 */

var OrganizationSchema = require('../models/Organization').OrganizationSchema,
  ItemSchema = require('../models/Item').ItemSchema,
  config = require('config'),
  db = require('../datasource').getDb(config.MONGODB_URL),
  Item = db.model('Item', ItemSchema),
  Organization = db.model('Organization', OrganizationSchema);

var errors = require('common-errors');
var countryService = require('./CountryService');
var userService = require('./UserService');
var async = require('async');

/**
 * Create a organization.
 * The data will be persisted into the mongo DB before sending the response to client
 * @param  {Object}       entity            entity from client to create
 * @param  {[type]}       user              the user entity object, that is the admin of the organization
 * @param  {Function}     callback          callback function
 */
exports.create = function(entity, user, callback) {
  async.waterfall([
    function(cb) {
      countryService.validateCountry(entity.country, cb);
    },
    function(country, cb) {
      entity.country = country;
      Organization.create(entity, cb);
    },
    function(created, cb) {
      user.orgId = created._id;
      // create the user
      userService.register(user, function(err, user) {
        if(err) {
          // if error occured, delete already created organization
          created.remove(function(err) {
            cb(err, user);
          });
        } else {
          cb(null, user);
        }
      });
    }
  ], callback);
};

/**
 * Get a organization by id
 * @param  {String}       id              id of the organization to get
 * @param  {Function}     callback        callback function
 */
exports.findById = function(id, callback) {
  Organization.findById(id, function(err, organization) {
    if(err) {
      callback(err);
    } else if(!organization) {
      callback(new errors.NotFoundError('Organization not found for given id'));
    } else {
      callback(null, organization);
    }
  });
};

exports.getItems = function(auth, callback) {
  if(!auth.orgId) {
    return callback(new errors.NotPermittedError('User is not allowed to perform this operation'));
  }
  Item.find({ orgId: auth.orgId }, callback);
};

exports.getDashboard = function(auth, callback) {
  // dummy implementation
  callback(null, []);
};
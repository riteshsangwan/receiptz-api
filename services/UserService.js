'use strict';

/**
 * This Service exposes the contract with the 'users' collection in the database
 *
 * @author      ritesh
 * @version     1.0.0
 */

var UserSchema = require('../models/User').UserSchema,
  config = require('config'),
  db = require('../datasource').getDb(config.MONGODB_URL, config.POOL_SIZE),
  User = db.model('User', UserSchema);

var async = require('async'),
  jwt = require('jwt-simple'),
  moment = require('moment'),
  httpStatus = require('http-status'),
  _ = require('lodash'),
  helper = require('./Helper'),
  bcrypt = require('bcrypt-nodejs'),
  errors = require('common-errors');

var constants = require('../constants');
var countryService = require('./CountryService');

/**
 * Helper method to get the user by email address
 * @param  {String}       email           email of the user to find
 * @param  {Function}     callback        callback function
 */
var _findByEmail = function(email, callback) {
  var query = User.where({ email: email });
  query.findOne(callback);
};

/**
 * Register a user
 * @param  {Object}       data            data from client
 * @param  {Function}     callback        callback function
 */
exports.register = function(data, callback) {
  var timestamp = moment().valueOf();
  var entity = _.pick(data, 'firstName', 'lastName', 'email', 'password', 'deviceId', 'deviceType', 'type', 'mobileNumber', 'country');
  async.waterfall([
    function(cb) {
      countryService.validateCountry(entity.country, cb);
    },
    function(country, cb) {
      _.extend(entity.country, country);
      _findByEmail(entity.email, function(err, user) {
        if(err) {
          cb(err);
        } else if(user) {
          cb(new errors.ValidationError('Email is already registered', httpStatus.BAD_REQUEST));
        } else {
          cb();
        }
      });
    },
    function(cb) {
      // hash the user password
      helper.generateHash(entity.password, cb);
    },
    function(hash, cb) {
      _.extend(entity, {password: hash});
      helper.randomBytes(config.DEFAULT_TOKEN_LENGTH, cb);
    },
    function(token, cb) {
      var millis = timestamp + config.DEFAULT_TOKEN_EXPIRY;
      _.extend(entity, {verifyAccountToken: token, verifyAccountTokenExpiry: millis});
      User.create(entity, cb);
    },
    function(user, cb) {
      var message = JSON.stringify({verifyAccountTokenExpiry: user.verifyAccountTokenExpiry, link: config.VERIFY_ACCOUNT_LINK.replace(':token', user.verifyAccountToken)});
      helper.sendMessage(constants.EMAIL_TYPE.REGISTRATION, message, user.email, function(err) {
        cb(err, user);
      });
    }
  ], callback);
};

/**
 * Perform authentication.
 * @param  {Object}       credentials         credentials for login, must have username and password
 * @param  {Function}     callback            callback function
 */
exports.authenticate = function(credentials, callback) {
  async.waterfall([
    function(cb) {
      _findByEmail(credentials.email, cb);
    },
    function(user, cb) {
      if(!user) {
        return cb(new errors.NotFoundError('User not found for given email address'));
      } else {
        cb(null, user);
      }
    },
    function(user, cb) {
      bcrypt.compare(credentials.password, user.password, function(err, result) {
        if(err) {
          cb(err);
        } else if(result) {
          cb(null, user);
        } else {
          cb(new errors.HttpStatusError(httpStatus.UNAUTHORIZED, 'Invalid username or password'));
        }
      });
    },
    function(user, cb) {
      var millis = moment().valueOf() + config.TOKEN_EXPIRATION_IN_MILLIS;
      var token = jwt.encode({
        expiration: millis,
        type: user.type,
        userId: user._id,
        orgId: user.orgId,
      }, config.JWT_SECRET);
      cb(null, {token: token});
    }
  ], callback);
};

/**
 * Send forgot password link to email
 * @param  {String}       email           email of the user to find
 * @param  {Function}     callback        callback function
 */
exports.forgotPassword = function(email, callback) {
  async.waterfall([
    function(cb) {
      _findByEmail(email, cb);
    },
    function(user, cb) {
      if(!user) {
        return cb(new errors.NotFoundError('User not found with given email address'));
      }
      helper.randomBytes(config.DEFAULT_TOKEN_LENGTH, function(err, token) {
        cb(err, user, token);
      });
    },
    function(user, token, cb) {
      var millis = moment().valueOf() + config.DEFAULT_TOKEN_EXPIRY;
      _.extend(user, {resetPasswordTokenExpiry: millis, resetPasswordToken: token});
      user.save(cb);
    },
    function(user, cb) {
      var message = JSON.stringify({resetPasswordTokenExpiry: user.resetPasswordTokenExpiry, link: config.RESET_PASSWORD_LINK.replace(':token', user.resetPasswordToken)});
      helper.sendMessage(constants.EMAIL_TYPE.FORGOT_PASSWORD, message, user.email, function(err) {
        cb(err);
      });
    }
  ], callback);
};

/**
 * Update the user password
 *
 * @param  {Object}       credentials     entity object containing current password and new password to set
 * @param  {[type]}       authUser        current loggedin user context
 * @param  {Function}     callback        callback function
 */
exports.updatePassword = function(credentials, authUser, callback) {
  async.waterfall([
    function(cb) {
      User.findById(authUser.userId, cb);
    },
    function(user, cb) {
      if(!user) {
        // this should never happen
        return cb(new errors.ReferenceError('Something went wrong. Try again'));
      }
      bcrypt.compare(credentials.password, user.password, function(err, result) {
        if(err) {
          cb(err);
        } else if(result) {
          cb(null, user);
        } else {
          cb(new errors.HttpStatusError(httpStatus.UNAUTHORIZED, 'Invalid password'));
        }
      });
    },
    function(user, cb) {
      helper.generateHash(credentials.newPassword, function(err, hash) {
        cb(err, user, hash);
      });
    },
    function(user, hash, cb) {
      _.extend(user, {password: hash});
      user.save(cb);
    }
  ], callback);
};

/**
 * Update the user profile, only first name and last name can be updated using this method
 *
 * @param  {Object}       data            request data from client
 * @param  {[type]}       authUser        current loggedin user context
 * @param  {Function}     callback        callback function
 */
exports.updateProfile = function(data, authUser, callback) {
  var entity = _.pick(data, 'firstName', 'lastName');
  async.waterfall([
    function(cb) {
      User.findById(authUser.userId, cb);
    },
    function(user, cb) {
      if(!user) {
        // this should never happen
        return cb(new errors.ReferenceError('Something went wrong. Try again'));
      }
      _.extend(user, entity);
      user.save(cb);
    }
  ], callback);
};

/**
 * Update the user device
 *
 * @param  {Object}       data            request data from client
 * @param  {[type]}       authUser        current loggedin user context
 * @param  {Function}     callback        callback function
 */
exports.updateDevice = function(data, authUser, callback) {
  var device = _.pick(data, 'deviceId', 'deviceType');
  async.waterfall([
    function(cb) {
      User.findById(authUser.userId, cb);
    },
    function(user, cb) {
      if(!user) {
        // this should never happen
        return cb(new errors.ReferenceError('Something went wrong. Try again'));
      }
      _.extend(user, device);
      user.save(cb);
    }
  ], callback);
};

/**
 * Return current authenticated user profile
 *
 * @param  {[type]}       authUser        current loggedin user context
 * @param  {Function}     callback        callback function
 */
exports.me = function(authUser, callback) {
  User.findById(authUser.userId, callback);
};

/**
 * Reset forgotten password for the user
 *
 * @param  {Object}       entity          data sent from client
 * @param  {Function}     callback        callback function
 */
exports.resetForgottonPassword = function(entity, callback) {
  async.waterfall([
    function(cb) {
      User.findOne({resetPasswordToken: entity.token}, cb);
    },
    function(user, cb) {
      if(!user) {
        return cb(new errors.ValidationError('Invalid rest password token'));
      }
      var timestamp = moment().valueOf();
      if(timestamp >= user.resetPasswordTokenExpiry) {
        return cb(new errors.ValidationError('Reset password token is expired'));
      }
      _.extend(user, {resetPasswordTokenExpiry: undefined, resetPasswordToken: undefined});
      user.save(cb);
    }
  ], callback);
};

/**
 * Verify user account, this verifies the user's email
 *
 * @param  {String}       token           verify account token
 * @param  {Function}     callback        callback function
 */
exports.verifyAccount = function(token, callback) {
  async.waterfall([
    function(cb) {
      User.findOne({verifyAccountToken: token}, cb);
    },
    function(user, cb) {
      if(!user) {
        return cb(new errors.ValidationError('Invalid account verification token'));
      }
      var timestamp = moment().valueOf();
      if(timestamp >= user.verifyAccountTokenExpiry) {
        return cb(new errors.ValidationError('Account verification token is expired'));
      }
      _.extend(user, {verifyAccountToken: undefined, verifyAccountTokenExpiry: undefined});
      user.save(cb);
    }
  ], callback);
};

exports.findByMobileNumber = function(number, callback) {
  User.findOne({mobileNumber: number}, callback);
};

exports.findById = function(id, callback) {
  User.findById(id, callback);
};
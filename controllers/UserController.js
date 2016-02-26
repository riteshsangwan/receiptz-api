'use strict';

/**
 * UserController
 * This controller honour the REST API contract for '/users' EXNPOINT
 *
 * @author      ritesh
 * @version     1.0.0
 */

var controllerHelper = require('./ControllerHelper');
var httpStatus = require('http-status');
var userService = require('../services/UserService');

/**
 * Register a user in the system
 * Route handler for POST '/users' endpoint
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.register = function(req, res, next) {
  var entity = req.body;
  var error = controllerHelper.checkString(entity.firstName, 'First Name') || controllerHelper.checkString(entity.lastName, 'Last Name') ||
                controllerHelper.checkEmail(entity.email, 'Email') || controllerHelper.checkString(entity.password, 'Password');

  error = error || controllerHelper.checkDefined(entity.country, 'Country') || controllerHelper.checkString(entity.mobileNumber, 'Mobile Number');

  if(error) {
    return next(error);
  }
  userService.register(entity, function(err, user) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.CREATED,
      content: user
    };
    next();
  });
};

/**
 * Logs a user into the system
 * Route handler for POST '/users/login' endpoint
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.login = function(req, res, next) {
  var credentials = req.body;
  var error = controllerHelper.checkString(credentials.email, 'Email') || controllerHelper.checkString(credentials.password, 'Password');

  if(error) {
    return next(error);
  }

  userService.authenticate(credentials, function(err, token) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: token
    };
    next();
  });
};

/**
 * Send a password reset mail to user email address
 * Route handler for POST '/users/forgotPassword' endpoint
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.forgotPassword = function(req, res, next) {
  var data = req.body;
  var error = controllerHelper.checkString(data.email, 'Email');
  if(error) {
    return next(error);
  }
  userService.forgotPassword(data, function(err) {
    if(err) {
      return next(err);
    }
    next();
  });
};

/**
 * Update a password for a user
 * Route handler for POST '/users/updatePassword' endpoint
 * This route is secured
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.updatePassword = function(req, res, next) {
  var credentials = req.body;
  var error = controllerHelper.checkString(credentials.newPassword, 'New Password') || controllerHelper.checkString(credentials.password, 'Password');
  if(error) {
    return next(error);
  }
  userService.updatePassword(credentials, req.auth, function(err, user) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: user
    };
    next();
  });
};

/**
 * Update profile for current logged in user
 * Route handler for POST '/users/updateProfile' endpoint
 * This route is secured
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.updateProfile = function(req, res, next) {
  var entity = req.body, error;
  if(entity.firstName) {
    error = controllerHelper.checkString(entity.firstName, 'First Name');
  }
  if(entity.lastName) {
    error = error || controllerHelper.checkString(entity.lastName, 'Last Name');
  }
  if(error) {
    return next(error);
  }
  userService.updateProfile(entity, req.auth, function(err, profile) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: profile
    };
    next();
  });
};

/**
 * Update device token for current logged in user
 * Route handler for POST '/users/updateDeviceToken' endpoint
 * This route is secured
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.updateDevice = function(req, res, next) {
  var device = req.body;
  var error = controllerHelper.checkString(device.deviceId, 'Device ID') || controllerHelper.checkDeviceType(device.deviceType, 'Device Type');

  if(error) {
    return next(error);
  }

  userService.updateDevice(device, req.auth, function(err, user) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: user
    };
    next();
  });
};

/**
 * Get current user profile
 * Route handler for GET '/me' endpoint
 * This route is secured
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.me = function(req, res, next) {
  userService.me(req.auth, function(err, user) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK,
      content: user
    };
    next();
  });
};

/**
 * Reset the user's forgotten password
 * Route handler for POST '/resetForgottonPassword' endpoint
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.resetForgottonPassword = function(req, res, next) {
  var error = controllerHelper.checkString(req.body.password, 'Password') || controllerHelper.checkString(req.body.token, 'Reset Password Token');
  if(error) {
    return next(error);
  }
  userService.resetForgottonPassword(req.body, function(err) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK
    };
    next();
  });
};

/**
 * Verify a user's account
 * Route handler for POST '/verifyAccount' endpoint
 *
 * @param  {Object}     req       Express request instance
 * @param  {Object}     res       Express response instance
 * @param  {Function}   next      next function to call next middleware in chain
 */
exports.verifyAccount = function(req, res, next) {
  var token = req.query.token;
  var error = controllerHelper.checkString(token, 'Verification token');
  if(error) {
    return next(error);
  }
  userService.verifyAccount(token, function(err) {
    if(err) {
      return next(err);
    }
    req.data = {
      statusCode: httpStatus.OK
    };
    next();
  });
};
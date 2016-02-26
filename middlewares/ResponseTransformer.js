'use strict';

/**
 * Response transformer middleware
 * This middleware is added before sending the response to the client.
 * This will transform the response in following way
 * 2. Delete _id property and instead expose it on id property
 *
 * @author      ritesh
 * @version     1.0.0
 */

var _ = require('lodash'),
  async = require('async');

var _transform = function(obj) {
  var transformed;
  if(obj.toObject) {
    transformed = obj.toObject();
  } else {
    transformed = obj;
  }
  if(obj._id) {
    transformed.id = obj._id;
  }
  return _.omit(transformed, '_id', '__v', 'password', 'resetPasswordToken', 'verifyAccountToken', 'resetPasswordTokenExpiry', 'verifyAccountTokenExpiry');
};

var _doFilter = function(obj, callback) {
  var transformed = _transform(obj);
  callback(null, transformed);
};

var middleware = function(req, res, next) {
  if(req.data && req.data.content) {
    if(_.isArray(req.data.content)) {
      async.map(req.data.content, _doFilter, function(err, transformed) {
        delete req.data.content;
        req.data.content = transformed;
        next();
      });
    } else if(_.isObject(req.data.content)) {
      var transformed = _transform(req.data.content);
      delete req.data.content;
      req.data.content = transformed;
      next();
    } else {
      next();
    }
  } else {
    next();
  }
};

module.exports = function() {
  return middleware;
};
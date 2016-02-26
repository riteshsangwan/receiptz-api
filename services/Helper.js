'use strict';

/**
 * Utility helper class.
 *
 * @author      ritesh
 * @version     1.0.0
 */

var bcrypt = require('bcrypt-nodejs'),
  async = require('async'),
  crypto = require('crypto'),
  config = require('config');

var errors = require('common-errors');
var constants = require('../constants');
var httpStatus = require('http-status');
var path = require('path');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fse = require('fs-extra');

var transporter = nodemailer.createTransport(smtpTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  auth: {
    user: config.SMTP_USERNAME,
    pass: config.SMTP_PASSWORD
  }
}));

var from = config.FROM_EMAIL;
var jade = require('jade');

/**
 * Generate a hash of the given plainText string
 *
 * @param  {String}       plainText        plainText string
 * @param  {Function}     callback         callback function
 */
exports.generateHash = function(plainText, callback) {
  async.waterfall([
    function(cb) {
      bcrypt.genSalt(config.SALT_WORK_FACTOR, cb);
    },
    function(salt, cb) {
      bcrypt.hash(plainText, salt, null, cb);
    }
  ], callback);
};

/**
 * Generate random bytes of given length
 *
 * @param  {Number}       length           length in bytes
 * @param  {Function}     callback         callback function
 */
exports.randomBytes = function(length, callback) {
  crypto.randomBytes(length, function(err, buff) {
    if(err) {
      return callback(err);
    }
    callback(null, buff.toString('hex'));
  });
};


var _renderTemplate = function(templateName, context, callback) {
  var filePath = path.join(__dirname, '../templates/' + templateName + '.jade');
  fse.readFile(filePath, 'utf8', function(err, file) {
    if(err) {
      return callback(err);
    }
    var compiledTemplate = jade.compile(file, {filename: filePath});
    var html = compiledTemplate(context);
    callback(null, html);
  });
};

exports.sendMessage = function(type, message, to, callback) {
  var mailOptions = {
    from: from,
    to: to
  };
  if(type === constants.EMAIL_TYPE.REGISTRATION) {
    async.waterfall([
      function(cb) {
        _renderTemplate('register', message, cb);
      },
      function(html, cb) {
        mailOptions.html = html;
        mailOptions.subject = 'Welcome to ReceiptZ';
        transporter.sendMail(mailOptions, cb);
      }
    ], callback);
  } else if(type === constants.EMAIL_TYPE.FORGOT_PASSWORD) {
    async.waterfall([
      function(cb) {
        _renderTemplate('forgot-password', message, cb);
      },
      function(html, cb) {
        mailOptions.html = html;
        mailOptions.subject = 'Reset your password';
        transporter.sendMail(mailOptions, cb);
      }
    ], callback);
  } else {
    callback(new errors.ValidationError(type + ' is invalid', httpStatus.BAD_REQUEST));
  }
};
'use strict';

/**
 * Exports the application level constants
 *
 * @author      ritesh
 * @version     1.0.0
 */

/**
 * Device types supported by the platform
 * @type {Object}
 */
exports.deviceTypes = {
  ANDROID: 'ANDROID',
  IOS: 'IOS'
};

/**
 * User types available in the platform
 * @type {Object}
 */
exports.userTypes = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS_EMPLOYEE: 'BUSINESS_EMPLOYEE'
};

/**
 * Type of email to be sent
 * @type {Object}
 */
exports.EMAIL_TYPE = {
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  REGISTRATION: 'REGISTRATION'
};
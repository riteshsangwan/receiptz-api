'use strict';

/**
 * Router logic, this class will implement all the API routes login
 * i.e, mapping the routes to controller and add auth middleware if any route is secure.
 *
 * @author      ritesh
 * @version     1.0.0
 */

var express = require('express');
var Auth = require('./middlewares/Auth');
var userController = require('./controllers/UserController');
var countryController = require('./controllers/CountryController');
var config = require('config');
var auth = new Auth({jwtSecret: config.JWT_SECRET});
var tokenMiddleware = auth.process({strategy: Auth.strategy.token});

module.exports = function() {
  var options = {
    caseSensitive: true
  };

  // Instantiate an isolated express Router instance
  var router = express.Router(options);
  // users
  router.post('/users', userController.register);
  router.post('/users/login', userController.login);
  router.post('/users/forgotPassword', userController.forgotPassword);

  router.post('/users/updatePassword', tokenMiddleware, userController.updatePassword);
  router.post('/users/updateProfile', tokenMiddleware, userController.updateProfile);
  router.post('/users/updateDevice', tokenMiddleware, userController.updateDevice);
  router.get('/me', tokenMiddleware, userController.me);
  router.get('/countries', countryController.getAll);
  router.post('/resetForgottonPassword', userController.resetForgottonPassword);
  router.get('/verifyAccount', userController.verifyAccount);
  return router;
};
'use strict';

/**
 * Main application init file.
 * This will spin up an HTTP SERVER which will listen on connections on default configured port
 *
 * @author      ritesh
 * @version     1.0.0
 */

var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  router = require('./router'),
  ErrorHandler = require('./middlewares/ErrorHandler'),
  Responser = require('./middlewares/Responser'),
  logger = require('./logger'),
  responseTransformer = require('./middlewares/ResponseTransformer'),
  config = require('config');

var port = process.env.PORT || config.WEB_SERVER_PORT || 3100;

var errorHandler = new ErrorHandler();
var responser = new Responser();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(router());
app.use(responseTransformer());
app.use(responser.middleware());
app.use(errorHandler.middleware());
app.listen(port, function() {
  logger.info('Application started successfully', {name: config.NAME, port: port});
});
'use strict';

var Logger = require('youmeb-logger');

var log = module.exports = {};

log.boot = function (youmeb) {
  var config = youmeb.config.get('logger');
  var logger = Logger.create(config.level, config.dir, config.filename);

  log.__proto__ = logger;
};

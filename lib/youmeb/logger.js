'use strict';

var path = require('path');
var Logger = require('youmeb-logger');

var log = module.exports = {};

log.boot = function (youmeb) {
  var config = youmeb.config.get('logger');
  var logger = Logger.create(config.level, path.join(youmeb.root, config.dir), config.filename);

  log.__proto__ = logger;
};

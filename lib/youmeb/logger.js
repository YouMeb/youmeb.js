'use strict';

var Logger = require('youmeb-logger');

module.exports = function () {
  var config = this.config.get('logger');
  module.exports = Logger.create(config.level, config.dir, config.filename);
};

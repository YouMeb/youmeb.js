'use strict';

module.exports = function () {
  this.register('youmeb', this);
  this.register('injector', this.__injector);
  this.register('routes', this.__routes);
  this.register('errors', this.errors);
  this.register('app', this.app);
  this.register('prompt', require('prompt'));
  this.register('async', require('async'));
  this.register('generator', require('youmeb-generator'));
};

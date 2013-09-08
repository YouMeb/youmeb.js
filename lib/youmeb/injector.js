'use strict';

var path = require('path');
var borrow = require('borrow');
var utils = require('../utils');
var Injector = require('youmeb-injector');

module.exports = injector;

function injector() {
  var injector = this.__injector = new Injector();
  this.borrow(['register', 'invoke']).apply(injector).from(injector).thanks();
};

injector.boot = function (youmeb, done) {
  youmeb.__injector.initConfig(youmeb.config.get('packages') || {});
  youmeb.__injector.loadPackages(path.join(youmeb.root, 'node_modules'), function (err) {
    if (err) {
      return done(err);
    }
    youmeb.__injector.init(done);
  });
};

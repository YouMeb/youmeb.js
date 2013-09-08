'use strict';

var EventEmitter = require('youmeb-events');
var path = require('path');
var youmeb = module.exports = new EventEmitter();

function r(name, module) {
  if (name) {
    youmeb[name] = require(module === true ? name : path.join(__dirname, 'youmeb', name));
  }
  return r;
}

r()
  r('config')
  r('errors')
  r('logger')
  r('injector')
  r('express')
  r('routes')
  r('registerAll')
  r('boot');

'use strict';

var fs = require('fs');
var path = require('path');
var config = module.exports = {};

var data;

config.root = './config';

config.load = function (dir, file) {
  dir = dir || config.root;

  var files = fs.readdirSync(dir);

  if (!!~files.indexOf(file)) {
    data = require(path.join(dir, file));
  } else {
    data = {};
  }

  if (!!~files.indexOf('default.json')) {
    data.__proto__ = require(path.join(dir, 'default.json'));
    data.__proto__.__proto__ = require(path.join(__dirname, './config.json'));
  } else {
    data.__proto__ = require(path.join(__dirname, './config.json'));
  }

  return config;
};

config.get = function (key) {
  var keys = key.replace(/\\\./g, '\uffff').split('.');
  var len = keys.length;
  var _data = data;

  while (len) {
    len -= 1;
    key = keys.shift().replace(/\uffff/g, '.');
    if (!(key in _data)) {
      return;
    }
    _data = _data[key];
  }

  return typeof _data === 'object' ? Object.create(_data) : _data;
};

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
    data.__proto__.__proto__ = require(path.join(__dirname, '../config'));
  } else {
    data.__proto__ = require(path.join(__dirname, '../config'));
  }

  return config;
};

config.get = function (key) {
  // 以「.」來分隔 key，並處理「\.」的問題
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

  // 如果data 是 object 就建立一個新的 object，將資料放進 __proto__
  // 以防不小心改到 config 值
  return typeof _data === 'object' ? Object.create(_data) : _data;
};

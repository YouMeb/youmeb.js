'use strict';

var fs = require('fs');
var errorCodes = require('error-codes');
var errors = module.exports = {};

var data;

errors.format = function (format) {
  data = errorCodes(format);
  return errors;
};

errors.loadErrorConfigFile = function (file) {
  var fileData = fs.readFileSync(file, 'utf8');
  var lines = [];

  // 取得每一筆資料
  fileData
    .split('\n')
    .forEach(function (line) {
      line = line.trim();
      line = line.replace(/\s+/g, ' ').split(' ');
      if (!line[0]) {
        return;
      }
      lines.push({
        key: line[0],
        errno: line[1],
        message: line.slice(2).join(' ')
      });
    });

  // 資料按 key 排序
  // 避免 system.module.error 在 system.module 之前
  lines.sort(function (a, b) {
    return a.key > b.key ? 1 : -1;
  });

  // 塞 error !!!
  lines.forEach(function (line) {
    var e = data;
    var last;
    var keys;
    var count = 0;
    var level;

    keys = line.key
      .replace(/\\\./g, '\uffff')
      .split('.');

    last = keys.pop();

    keys.forEach(function (key) {
      key = key.replace(/\uffff/g, '.');
      if (!e.hasOwnProperty(key)) {
        throw new Error(key + 'Error is not defined.');
      }
      count += 1;
      e = e[key];
    });

    if (count + 1 > data.levels.length) {
      throw new Error('Level not found.');
    }

    level = data.levels[count];

    e['set' + level.key[0].toUpperCase() + level.key.substr(1)](last.replace(/\uffff/g, '.'), line.errno, line.message);
  });

  return errors;
};

// Example:
//   
//   errors.generate('System.module1.error1', 'message') // return SystemModule1Error1Error
errors.generate = function () {
  return data.generate.apply(data, arguments);
};

errors.available = function () {
  return data.available.apply(data, arguments);
};

// Example:
//
//   // format: {level:x}-{module:xxx}-{code:xx}
//   errors.getCodes('1-000-00') // return {level: '1', module: '000', code: '00'}
errors.getCodes = function () {
  return data.getCodes.apply(data, arguments);
};

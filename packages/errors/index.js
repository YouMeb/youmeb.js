'use strict';

var fs = require('fs');
var errors = require('error-codes');
var colors = require('colors');

module.exports = function ($youmeb) {
  var $errors = errors($youmeb.config.get('error.format'));

  $youmeb.on('help', function (command, data, done) {
    data.commands.push(['errors', '', 'Display error list']);
    done();
  });

  $youmeb.on('cli-errors', function (parser, args, done) {
    defineAllErrors($youmeb, $errors, function (err) {
      if (err) {
        return done(err);
      }
      var arr = $errors.getAllErrors();
      var len = {key: 0, code: 0, message: 0};
      arr.forEach(function (raw) {
        var i, l;
        for (i in len) {
          l = (raw[i] || '').length;
          if (l > len[i]) {
            len[i] = l;
          }
        }
      });
      console.log();
      arr.forEach(function (raw) {
        console.log('  %s  %s', space(raw.key, len.key).green, space(raw.code, len.code), space(raw.message, len.message));
      });
      console.log();
    });
  });

  this.on('init', function (config, done) {
    $youmeb.register('errors', $errors);
    defineAllErrors($youmeb, $errors, done);
  });

};

function defineAllErrors($youmeb, $errors, done) {
  getErrorsData($youmeb, function (err, data) {
    if (err) {
      return done(err);
    }
    data.forEach(function (raw) {
      $errors.define(raw[0], raw[1]);
    });
    done();
  });
}

function getErrorsData($youmeb, done) {
  var data = [];
  fs.readFile($youmeb.config.get('error.file'), 'utf8', function (err, content) {
    if (err) {
      return done(err);
    }
    content.split('\n').forEach(function (line) {
      line = line.trim();
      if (!line) {
        return;
      }
      var raw = line.split(/\s+/);
      data.push(raw);
    });
    done(null, data);
  });
}

function space(str, len) {
  var i = len - str.length;
  while (i > 0) {
    i -= 1;
    str += ' ';
  }
  return str;
}

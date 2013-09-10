'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var repl = require('repl');

module.exports = function ($youmeb) {

  // 加入 help 訊息
  $youmeb.on('help', function (command, data, done) {
    data.commands.push(['errors', '', 'Error codes']);
    done();
  });

  $youmeb.on('cli-errors', function (args, done) {

    var file = path.join($youmeb.root, $youmeb.config.get('error.file'));

    (fs.exists(file) ? function (start) {
      fs.readFile(file, 'utf8', start);
    } : function (start) {
      start(null, '');
    })(function (err, content) {
      if (err) {
        return done(err);
      }

      var errors = [];

      content
        .split('\n')
        .forEach(function (error) {
          error = error.trim().replace(/\s+/g, ' ').split(' ');
          if (!error[0]) {
            return;
          }
          errors.push({
            key: error[0],
            errno: error[1],
            message: error.slice(2).join(' ')
          });
        });
      
      var errorsToString = function () {
        var txtlen = {};
        var str = [];

        // 計算長度
        errors.forEach(function (error) {
          Object.keys(error).forEach(function (key) {
            var len = error[key].length;
            if ((txtlen[key] | 0) < len) {
              txtlen[key] = len;
            }
          });
        });
        
        // 排序
        errors.sort(function (a, b) {
          return a.key > b.key;
        });

        errors.forEach(function (error) {
          var keys = Object.keys(error);

          error = Object.create(error);

          keys.forEach(function (key) {
            var i = txtlen[key] - error[key].length;
            while (i--) {
              error[key] += ' ';
            }
          });

          str.push(util.format('%s  %s  %s', (error.key || '').green, error.errno || 0, error.message || ''));
        });

        return str.join('\n');
      };
      
      var print = function () {
        var lines = errorsToString().split(/\n/);

        if (!lines[0]) {
          return;
        }

        console.log();
        console.log('  Errors:');
        console.log();

        lines.forEach(function (line, i) {
          console.log('    %s  -  %s', (i + '').blue, line);
        });

        console.log();
      };

      var help = function () {
        console.log();
        console.log('  Functions:');
        console.log();
        console.log('    list()                         Display current errors');
        console.log('    define(key, errno, message)    Define an error');
        console.log('    save()                         Save change');
        console.log('    remove()                       Remove an error');
        console.log();
      };

      help();
      print();

      var ctx = repl.start({
        prompt: 'errors> ',
        input: process.stdin,
        output: process.stdout
      }).context;

      ctx.youmeb = $youmeb;
      ctx.errors = errors;

      ctx.ls = ctx.list = ctx.print = print;

      ctx.help = help;

      ctx.define = function (key, no, message) {
        errors.push({
          key: key,
          errno: no,
          message: message
        });
        ctx.save();
      };

      ctx.remove = function (index) {
        if (errors[index]) {
          errors.splice(index, 1);
          ctx.save();
        }
      };

      ctx.save = function () {
        fs.writeFile(file, errorsToString().replace(/\x1B\[\d+m/g, ''), function (err) {
          if (err) {
            console.log('  Error: '.red + 'save failed.');
          }
        });
      };
    });
  });
};

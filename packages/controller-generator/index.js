'use strict';

var fs = require('fs');
var path = require('path');
var colors = require('colors');

module.exports = function ($youmeb, $prompt, $generator) {

  // 加入 help 訊息
  $youmeb.on('help', function (command, data, done) {
    data.commands.push(['generate:controller', '', 'Generates a controller']);
    done();
  });
  
  // 監聽 cli-generate 事件
  // 如果第一個參數是 controller 就繼續執行
  $youmeb.on('cli-generate:controller', function (parser, args, done) {
    
    // 取得 controller 名稱、位置
    $prompt.get([
      {
        name: 'name',
        type: 'string',
        default: 'example.home'
      }
    ], function (err, result) {
      if (err) {
        return done(err);
      }
      var name;

      // 輸入: admin.example.home
      // 執行:
      //   1. 建立 [controllers folder]/admin/example
      //   2. 把資料寫入 home.js
      var ctrlpath = (function () {
        var re = [];
        var str = result.name;
        str = str
          .replace(/\\\./g, '\uffff')
          .split('.');
        name = str.pop();
        str.forEach(function (val) {
          re.push(val.replace(/\uffff/g, '.'));
        });
        return re.join('/');
      })();

      // 目錄位置
      var generator  = $generator.create();

      generator.source = path.join(__dirname, 'templates');
      generator.destination = path.join($youmeb.root, $youmeb.config.get('controllers'), ctrlpath);

      generator.on('create', function (file) {
        console.log('');
        console.log('  create '.yellow + file);
        console.log('');
      });

      generator.createFile('./controller.js', './' + name + '.js', {
        name: name
      }, done);
    });
  });
};

'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = function ($youmeb, $prompt, $cliox) {
  
  // 監聽 cli-generate 事件
  // 如果第一個參數是 controller 就繼續執行
  $youmeb.on('cli-generate', function (cliox, args, done) {
    if (args[0] !== 'controller') {
      return done();
    }
    
    // 取得 controller 名稱、位置
    $prompt.get([
      {
        name: 'name',
        type: 'string',
        default: 'example.home'
      }
    ], function (err, result) {
      if (err) {
        $cliox.log('{{ message }}', {message: 'Error: ' + err.message});
        return;
      }
      var indent = '';
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
      ctrlpath = path.join($youmeb.root, $youmeb.config.get('controllers'), ctrlpath);

      mkdirp(ctrlpath, function (err) {
        if (err) {
          return done(err);
        }

        var jsFileContent = ''
          + '\'use strict\'\n\n'
          + 'module.exports = function () {\n\n'
          + '  this.$({\n'
          + '    name: \'' + name + '\',\n'
          + '    path:  \'/' + name + '\'\n'
          + '  });\n\n'
          + '  this.index = {\n'
          + '    path: \'/\',\n'
          + '    handler: function ($youmeb) {\n'
          + '      this.response.send(\'Hello World !\');\n'
          + '      // this.next();\n'
          + '    }\n'
          + '  }\n\n'
          + '};';

        // controller 檔案位置
        ctrlpath = path.join(ctrlpath, name + '.js');

        fs.writeFile(ctrlpath, jsFileContent, function (err) {
          if (err) {
            return done(err);
          }
          console.log('\n  controller: ' + ctrlpath + '\n');
        });
      });
    });
  });
};

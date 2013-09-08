'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = function ($youmeb, $config, $prompt, $cliox) {
  $youmeb.on('cli-generate', function (cliox, args, done) {
    if (args[0] !== 'controller') {
      return done();
    }
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

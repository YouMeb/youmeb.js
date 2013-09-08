'use strict';

var path = require('path');
var youmeb = require('./youmeb');
var cli = module.exports = {};

// 啟動 server 可以指定位置
cli.server = function (app, done) {
  var root = path.resolve(process.cwd(), app._parser.args[0] || app.get('root'));
  youmeb.boot(root, app, done);
};

// 當沒有 command 的時候觸發 event
cli.notfound = function (command, app, done) {
  var root = path.resolve(process.cwd(), app.get('root'));

  youmeb.root = root;
  youmeb.config.load(path.join(root, 'config'), process.env.NODE_ENV || 'development');
  youmeb.errors.format(youmeb.config.get('error.format'));
  youmeb.errors.loadErrorConfigFile(youmeb.config.get('error.file'));
  youmeb.injector();
  youmeb.registerAll();
  youmeb.register('cliox', app);
  youmeb.__injector.loadPackages(path.join(__dirname, '../packages'), function (err) {
    if (err) {
      return done(err);
    }
    youmeb.injector.boot(youmeb, function (err) {
      if (err) {
        return done(err);
      }
      youmeb.emit('cli-' + command, app, app._parser.args, done);
    });
  });

  return true;
};

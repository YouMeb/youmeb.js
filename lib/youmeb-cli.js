'use strict';

var path = require('path');
var youmeb = require('./youmeb');
var cli = module.exports = {};

cli.youmeb = youmeb;

// 啟動 server 可以指定位置
cli.server = function (parser, args, done) {
  var root = path.resolve(process.cwd(), parser.get('root') || './');
  youmeb.boot(root, done);
};

// 當沒有 command 的時候觸發 event
cli.boot = function (done) {
  youmeb.root = process.cwd();
  youmeb.config.load(path.join(youmeb.root, 'config'), process.env.NODE_ENV || 'development');
  youmeb.injector();
  youmeb.express(); // 只建立 express
  youmeb.routes(); // 只建立 routes 沒有 scan 目錄
  youmeb.registerAll();
  youmeb.__injector.loadPackages(path.join(__dirname, '../packages'), function (err) {
    if (err) {
      return done(err);
    }
    youmeb.injector.boot(youmeb, done);
  });
};

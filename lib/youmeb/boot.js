'use strict';

var path = require('path');
var debug = require('debug');
var async = require('async');

module.exports = function (dir, done) {
  var pkg = this.package = require(path.join(dir, 'package.json'));
  var wrapper = require(path.join(dir, pkg.main));
  var that = this;

  this.root = dir;

  debug('start');

  // 載入設定
  debug(' - config');
  this.config.load(path.join(dir, 'config'), process.env.NODE_ENV || 'development');

  // 載入 error 設定
  debug(' - errors');
  this.errors.format(this.config.get('error.format'));
  this.errors.loadErrorConfigFile(path.join(this.root, this.config.get('error.file')));

  this.injector();
  this.logger.boot(this);

  async.series([
    // 使用者設定
    function (done) {
      debug(' - wrapper');
      wrapper.call(that, done);
    },
    function (done) {
      debug(' - register');
      that.registerAll();
      done();
    },
    // 從 node_modules 載入 youmeb 的 package
    function (done) {
      debug(' - injector');
      that.injector.boot(that, done);
    },
    // 定義 routes
    // 包括自動產生清單
    function (done) {
      debug('- routes');
      that.routes.boot(that, done);
    },
    function (done) {
      // 啟動 express
      debug(' - express');
      that.express.boot(that, done);
    }
  ], function (err) {
    debug('done');
    if (err) {
      that.logger.error('啟動失敗 ' + err.message);
    }
    console.log('http://' + that.config.get('host') + ((that.config.get('port') | 0) === 80 ? '' : ':' + that.config.get('port')) + '/');
    done(err);
  });
};

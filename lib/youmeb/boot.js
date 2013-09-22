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
      that.emit('preCallWrapper', function (err) {
        if (err) {
          return done(err);
        }
        wrapper.call(that, function (err) {
          if (err) {
            return done(err);
          }
          that.emit('posCallWrapper', done);
        });
      });
    },
    function (done) {
      debug(' - register');
      that.emit('preRegisterAll', function (err) {
        if (err) {
          return done(err);
        }
        that.registerAll();
        that.emit('posRegisterAll', done);
      });
    },
    // 從 node_modules 載入 youmeb 的 package
    function (done) {
      debug(' - injector');
      that.emit('preLoadUserPackages', function (err) {
        if (err) {
          return done(err);
        }
        that.injector.boot(that, function (err) {
          if (err) {
            return done(err);
          }
          that.emit('posLoadUserPackages', done);
        });
      });
    },
    // 定義 routes
    // 包括自動產生清單
    function (done) {
      debug('- routes');
      that.emit('preGenerateRoutes', function (err) {
        if (err) {
          return done(err);
        }
        that.routes.boot(that, function (err) {
          if (err) {
            return done(err);
          }
          that.emit('posGenerateRoutes', done);
        });
      });
    },
    function (done) {
      // 啟動 express
      debug(' - express');
      that.emit('preStartServer', function (err) {
        if (err) {
          return done(err);
        }
        that.express.boot(that, function (err) {
          if (err) {
            return done(err);
          }
          that.emit('posStartServer', done);
        });
      });
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

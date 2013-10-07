'use strict';

var path = require('path');
var borrow = require('borrow');
var EventEmitter = require('youmeb-events');
var Injector = require('youmeb-injector');
var generator = require('youmeb-generator');
var Logger = require('youmeb-logger');
var async = require('async');
var debug = require('debug');
var repl = require('repl');
var prompt = require('prompt');

module.exports = function (dir, done) {
  var youmeb = this;
  var pkg = require(path.join(dir, 'package.json'));
  var wrapper = require(path.join(dir, pkg.main));

  youmeb.root = dir;

  youmeb.config = require('./config.js');
  youmeb.config.load(path.join(dir, 'config'), process.env.NODE_ENV || 'development');

  // logger, injector
  youmeb.injector = new Injector();
  youmeb.injector.initConfig(youmeb.config.get('packages') || {});
  youmeb.borrow(['register', 'invoke']).apply(youmeb.injector).from(youmeb.injector).thanks();

  (function () {
    var loggerConfig = youmeb.config.get('logger');
    youmeb.logger = Logger.create(loggerConfig.level, path.join(dir, loggerConfig.dir), loggerConfig.filename);
  })();

  // register
  youmeb.register('youmeb', youmeb);
  youmeb.register('injector', youmeb.injector);
  youmeb.register('logger', youmeb.logger);
  youmeb.register('debug', debug);
  youmeb.register('prompt', prompt);
  youmeb.register('async', async);
  youmeb.register('generator', generator);

  async.series([
    function (done) {
      youmeb.injector.loadPackages(path.join(__dirname, '../packages'), done);
    },
    function (done) {
      youmeb.emit('preLoadUserPackages', function (err) {
        if (err) {
          return done(err);
        }
        youmeb.injector.loadPackages(path.join(youmeb.root, 'node_modules'), function (err) {
          if (err) {
            return done(err);
          }
          youmeb.injector.init(function (err) {
            if (err) {
              return done(err);
            }
            youmeb.emit('posLoadUserPackages', done);
          });
        });
      });
    },
    function (done) {
      youmeb.emit('preCallWrapper', function (err) {
        if (err) {
          return done(err);
        }
        wrapper.call(youmeb, function (err) {
          if (err) {
            return done(err);
          }
          youmeb.emit('posCallWrapper', done);
        });
      });
    },
    function (done) {
      youmeb.emit('initDone', done);
    }
  ], function (err) {
    if (err) {
      youmeb.logger.error('init failed ' + err.message);
    } else {
      if (!youmeb.isCli) {
        console.log('  youmeb %s', pkg.version);
        console.log();
        var ctx = repl.start({
          prompt: '  youmeb> ',
          input: process.stdin,
          output: process.stdout
        }).context;
        ctx.youmeb = youmeb;
      }
    }
    done(err);
  });
};

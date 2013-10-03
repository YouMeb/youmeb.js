'use strict';

var fs = require('fs');
var path = require('path');
var youmeb = require('./youmeb');
var cli = module.exports = {};

cli.youmeb = youmeb;

cli.server = function (parser, args, done) {
  var root = path.resolve(process.cwd(), parser.get('root') || './');
  youmeb.boot(root, done);
};

cli.boot = function (done) {
  youmeb.isCli = true;
  getProjectRoot(process.cwd(), function (err, root) {
    if (err) {
      return done(err);
    }
    youmeb.boot(root || process.cwd(), done);
  });
};

function getProjectRoot(dir, done) {
  var newdir;
  fs.readdir(dir, function (err, files) {
    if (err) {
      return done(err);
    }
    if (!!~files.indexOf('node_modules')) {
      return done(null, dir);
    }
    if (newdir === dir) {
      return done(null, null);
    }
    newdir = path.resolve(dir, '..');
    getProjectRoot(newdir, done);
  });
}

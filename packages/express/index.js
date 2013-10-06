'use strict';

var http = require('http');
var express = require('express');
var colors = require('colors');

module.exports = function ($youmeb, $logger) {
  
  var app = $youmeb.app = express();

  this.on('init', function (config, done) {
    $youmeb.register('app', app);
    done();
  });
  
  $youmeb.express = function (fn) {
    fn && fn.call($youmeb, app, express);
    app.use(function (err, req, res, next) {
      if (err) {
        var msg = (err.code ? '<' + err.code + '> ' : '') + (err.message || '');
        $logger.error(msg);
        err.status = err.status || 503;
        res.send(err.status, err.status + '<br />' + msg);
        return;
      }
      next();
    });
  };

  if (!$youmeb.isCli) {
    $youmeb.on('initDone', function (done) {
      console.log();
      console.log('  Server start'.green);
      $youmeb.emit('preStartServer', function (err) {
        if (err) {
          return done(err);
        }
        http
          .createServer(app)
          .listen($youmeb.config.get('port'), $youmeb.config.get('host'), function (err) {
            if (err) {
              return done(err);
            }
            console.log('  http://' + $youmeb.config.get('host') + (($youmeb.config.get('port') | 0) === 80 ? '' : ':' + $youmeb.config.get('port')) + '/');
            console.log();
            $youmeb.emit('posStartServer', done);
          });
      });
    });
  }

};

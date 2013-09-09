'use strict';

var http = require('http');
var express = require('express');

module.exports = app;

function app(fn) {
  var app = this.app = express();
  var that = this;

  fn && fn.call(this, app, express);

  // error handler
  app.use(function (err, req, res, next) {
    if (err) {
      var msg = (err.code ? '<' + err.code + '> ' : '') + (err.message || '');
      that.logger.error(msg);
      err.status = err.status || 503;
      res.send(err.status, err.status + '<br />' + msg);
      return;
    }
    next();
  });
};

app.boot = function (youmeb, done) {
  http
    .createServer(youmeb.app)
    .listen(youmeb.config.get('port'), youmeb.config.get('host'), done);
};

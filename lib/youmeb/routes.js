'use strict';

var fs = require('fs');
var path = require('path');
var Routes = require('youmeb-routes');

module.exports = routes;

function routes(fn) {
  var routes = this.__routes = Routes.create(this.app);

  // 讓使用者定義 middleware
  fn && fn.call(this, routes);

  routes.source(path.join(this.root, this.config.get('controllers')));
};

routes.boot = function (youmeb, done) {
  var routes = youmeb.__routes;

  routes.injector(youmeb.__injector);

  routes.generate(function (err) {
    if (err) {
      return done(err);
    }

    var json = {};
    var txt = [];
    var txtlen = [];

    routes.collection
      .sort(function (a, b) {
        return a.name > b.name;
      })
      .forEach(function (route) {
        json[route.name] = {
          path: route.path,
          methods: route.methods 
        };
        var data = [
          route.name,
          route.methods.join(','),
          route.path
        ];
        // 取得每個欄位最常字數
        data.forEach(function (val, i) {
          var len = val.length;
          if (len > (txtlen[i] | 0)) {
            txtlen[i] = len;
          }
        });
        txt.push(data);
      });

    // 對齊
    txt = (function () {
      txt.forEach(function (data, i) {
        data.forEach(function (val, j) {
          var k = txtlen[j] - val.length;
          while (k--) {
            val += ' ';
          }
          data[j] = val;
        });
        txt[i] = data.join('    ');
      });

      return txt.join('\n');
    })();

    // 寫入檔案
    fs.writeFile(path.join(youmeb.root, 'routes'), txt);

    youmeb.app.get('/routes.json', function (req, res, next) {
      res.jsonp(json);
    });

    done();
  });
};

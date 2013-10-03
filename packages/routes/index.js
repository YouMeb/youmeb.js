'use strict';

var fs = require('fs');
var Routes = require('youmeb-routes');
var path = require('path');

module.exports = function ($youmeb, $app, $injector, $debug) {
  var debug = $debug('youmeb:routes');
  var routes = Routes.create($app);

  this.on('init', function (config, done) {
    debug('register');
    $youmeb.register('routes', routes);
    done();
  });

  $youmeb.routes = function (fn) {
    fn && fn.call($youmeb, routes);
    routes.source(path.join($youmeb.root, $youmeb.config.get('controllers')));
  };

  $youmeb.on('preStartServer', function (done) {
    routes.injector($injector);
    $youmeb.emit('preGenerateRoutes', function (err) {
      if (err) {
        return done(err);
      }
      debug('generate routes');
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
            var jsonItem = json[route.name] = {};

            // 不能直接把 route 指給 jsonItem
            // 因為他們會對應到同一個 route，這樣就不能 delete 屬性了
            Object.keys(route).forEach(function (name) {
              jsonItem[name] = route[name];
            });

            delete jsonItem.name;
            delete jsonItem.middlewares;
            delete jsonItem.api;

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
        fs.writeFile(path.join($youmeb.root, 'routes'), txt);

        $youmeb.app.get('/youmeb/routes.json', function (req, res, next) {
          res.jsonp(json);
        });

        $youmeb.emit('posGenerateRoutes', done);
      });
    });
  });

};

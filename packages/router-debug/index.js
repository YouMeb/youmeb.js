'use strict';

var util = require('util');
var colors = require('colors');

module.exports = function ($youmeb, $routes, $injector) {

  // 加入 help 訊息
  $youmeb.on('help', function (command, data, done) {
    data.commands.push(['routes', '[filter]', 'Displays current routes for an application']);
    done();
  });
  
  $youmeb.on('cli-routes', function (parser, args, done) {
    $routes.injector($injector);

    $routes.scan(function (err) {
      if (err) {
        return done(err);
      }

      var txtlen = {};
      var routes = [];
      var filter = args[0];

      // 取得所有 route，並計算字串長度
      $routes.collection.forEach(function (route) {
        // 過濾名稱
        if (filter && !~route.name.search(filter)) {
          return;
        }
        var data = {
          name: route.name,
          methods: route.methods.join(','),
          path: route.path
        };
        Object.keys(data).forEach(function (key) {
          var val = data[key];
          var len = val.length;
          if (len > (txtlen[key] | 0)) {
            txtlen[key] = len;
          }
        });
        routes.push(data);
      });

      var str = [];
      routes.forEach(function (route) {
        var item = [];
        Object.keys(route).forEach(function (key) {
          var val = route[key]
          var i = txtlen[key] - val.length;
          while (i--) {
            val += ' ';
          }
          item.push(val);
        });
        item[0] = '  ' + item[0].green;
        str.push(item.join('    '));
      });
      str = str.join('\n');
      console.log('\n' + str + '\n');
      done();
    });
  });
};

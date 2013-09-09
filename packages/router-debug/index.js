'use strict';

var util = require('util');
var colors = require('colors');

module.exports = function ($youmeb, $routes, $cliox) {
  
  $youmeb.on('cli-routes', function (cliox, args, done) {
    $routes.scan(function (err) {
      if (err) {
        return done(err);
      }

      var format = cliox._format[cliox.get('format')] || cliox.get('format');
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

      // 預設格式
      if (typeof format === 'function') {
        console.log(format(routes));
        return done();
      }

      // 使用者指定格式
      if (typeof format === 'string') {
        return done();
      }

      // 無格式
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

'use strict';

var fs = require('fs');
var path = require('path');
var repl = require('repl');

module.exports = function ($youmeb) {

  $youmeb.on('help', function (command, data, done) {
    data.commands.push(['log', '', 'Log manager']);
    done();
  });

  $youmeb.on('cli-log', function (parser, args, done) {
    var logger;

    $youmeb.logger.boot($youmeb);

    logger = $youmeb.logger;

    var help = function () {
      console.log();
      console.log('  filter(text)                         Return a fiter object');
      console.log('  list([from, to])                     Display all file names');
      console.log('  listAfter(date)');
      console.log('  listBefore(date)');
      console.log('  show(date[, filter])                 Display content in log file');
      console.log('  show(from, to[, filter])');
      console.log('  showAfter(date[, filter])');
      console.log('  showBefore(date[, filter])');
      console.log('  clear()                              Delete log file(s)');
      console.log('  clear(date)');
      console.log('  clear(from, to)');
      console.log('  clearAfter(date)');
      console.log('  clearBefore(date)');
      console.log();
    };

    var printFiles = function (files) {
      if (!files.length) {
        return;
      }
      console.log();
      files.forEach(function (file) {
        var date = file.date;
        console.log('  %s-%s-%s'.green + '  %s', date.getFullYear(), date.getMonth() + 1, date.getDate(), file.path);
      });
      console.log();
    };

    var displayLog = function (files, filter) {
      if (!files.length) {
        return;
      }
      console.log();
      files.forEach(function (file) {
        var log = logger.read(file.path);
        console.log('  %s', file.date);
        console.log();
        log.forEach(function (val) {
          if (filter && !~JSON.stringify(val).search(filter.text)) {
            return;
          }
          console.log('    %s'.green + '  %s'.yellow + '  %s', val.level, new Date(val.time), val.message);
        });
      });
      console.log();
    };

    help();

    var ctx = repl.start({
      prompt: 'log> ',
      input: process.stdin,
      output: process.stdout
    }).context;

    ctx.help = help;

    ctx.Filter = function Filter(text) {
      this.text = text;
    };

    ctx.filter = function (text) {
      return new ctx.Filter(text);
    };

    ctx.list = function (from, to) {
      printFiles(logger.getFiles.apply(logger, arguments));
    };

    ctx.listBefore = function (date) {
      printFiles(logger.getFilesBefore.apply(logger, arguments));
    };

    ctx.listAfter = function (date) {
      printFiles(logger.getFilesAfter.apply(logger, arguments));
    };

    ctx.show = function (from, to) {
      var args = Array.prototype.slice.call(arguments);
      var filter;
      if (args[args.length - 1] instanceof ctx.Filter) {
        filter = args.pop();
      }
      displayLog(logger.getFiles.apply(logger, args), filter);
    };

    ctx.showBefore = function (from, to) {
      var args = Array.prototype.slice.call(arguments);
      var filter;
      if (args[args.length - 1] instanceof ctx.Filter) {
        filter = args.pop();
      }
      displayLog(logger.getFilesBefore.apply(logger, args), filter);
    };

    ctx.showAfter = function (from, to) {
      var args = Array.prototype.slice.call(arguments);
      var filter;
      if (args[args.length - 1] instanceof ctx.Filter) {
        filter = args.pop();
      }
      displayLog(logger.getFilesAfter.apply(logger, args), filter);
    };

    ctx.clear = function () {
      var files = logger.clear.apply(logger, arguments);
    };

    ctx.clearBefore = function () {
      var files = logger.clearBefore.apply(logger, arguments);
    };

    ctx.clearAfter = function () {
      var files = logger.clearAfter.apply(logger, arguments);
    };

  });
};

'use strict';

var EventEmitter = require('youmeb-events');
var youmeb = module.exports = new EventEmitter();

youmeb.isCli = false;
youmeb.boot = require('./boot');

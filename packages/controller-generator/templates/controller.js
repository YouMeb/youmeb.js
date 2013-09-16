'use strict';

module.exports = function ($youmeb) {

  this.$({
    name: '<%= name %>',
    path: ''
  });

  this.index = {
    path: '/',
    methods: ['all'],
    handler: function (req, res, next) {
      res.send('<%= name %>');
    }
  };

};

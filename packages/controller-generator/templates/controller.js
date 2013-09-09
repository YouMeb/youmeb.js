'use strict';

module.exports = function () {

  this.$({
    name: '<%= name %>',
    path: '/<%= name %>'
  });

  this.index = {
    path: '',
    methods: ['all'],
    handler: function ($youmeb) {
      this.response.sned('<%= name %>');
      // this.next();
    }
  };

};

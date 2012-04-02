define([
  'underscore',
  'backbone',
  'backbone-mediator'
], function(_, Backbone){
  'use strict';

  var spies = {};

  describe("Backbone-Mediator", function () {

    beforeEach(function(){
      $('body').append('<div id="container"><a></a></div>');
    });

    afterEach(function(){
      _.each(spies, function(spy){
        spy.restore();
      });
    });

  });

});
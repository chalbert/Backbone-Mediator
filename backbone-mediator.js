define([
  'underscore',
  'libs/vendor/backbone/backbone'
], function(_, Backbone){

  var channels = {};

  Backbone.Mediator = {

    subscribe: function(channel, subscription, context, once) {
      if (!channels[channel]) channels[channel] = [];
      channels[channel].push({fn: subscription, context: context || this, once: once});
    },

    publish: function(channel) {
      if (!channels[channel]) return;
      var args = [].slice.call(arguments, 1);
      for (var i = 0; i < channels[channel].length; i++) {
        var subscription = channels[channel][i];
        subscription.fn.apply(subscription.context, args);
        if (subscription.once) {
          this.unsubscribe(channel, subscription.fn, subscription.context);
          i--;
        }
      }
    },

    unsubscribe: function(channel, fn, context){
      if (channels[channel]) {
        for (var i = 0; i < channels[channel].length; i++) {
          var subscription = channels[channel][i];
          if (subscription.fn === fn && subscription.context === context) {
            channels[channel].splice(i, 1);
            i--;
          }
        }
      }
    },

    subscribeOnce: function (channel, subscription, context) {
      Backbone.Mediator.subscribe(channel, subscription, context, true);
    }

  };

  return Backbone;

});
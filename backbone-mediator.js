/**
 * |-------------------|
 * | Backbone-Mediator |
 * |-------------------|
 *  Backbone-Mediator is freely distributable under the MIT license.
 *
 *  <a href="https://github.com/chalbert/Backbone-Mediator">More details & documentation</a>
 *
 * @author Nicolas Gilbert
 * 
 * Support to channel wildcards added by
 * @author Estevão Santos (tivie)
 * 
 * @requires _
 * @requires Backbone
 */
(function(factory){
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone'], factory);
  } else {
    factory(_, Backbone);
  }

})(function (_, Backbone){
  'use strict';

  /**
	 * @static
	 */
	var debug = false,
		channels = {},
		Subscriber,
		/** @borrows Backbone.View#delegateEvents */
		delegateEvents = Backbone.View.prototype.delegateEvents,
		/** @borrows Backbone.View#delegateEvents */
		undelegateEvents = Backbone.View.prototype.undelegateEvents;

	/**
	 * @class
	 */
	Backbone.Mediator = {
		
		/**
		 * Enables/disables debug mode
		 * @param Boolean flag True enables debugging mode, false disables it
		 */
		debugMode: function(flag) {
			debug = (flag) ? true : false;
		},
			
	    /**
	     * Subscribe to a channel
	     * @param channel
	     */
		subscribe: function(channel, subscription, context, once) {
			
		    if (!_.isObject(context)) {
		         context = window;
		    }
			
		    if (_.isUndefined(subscription)) {
		    	return;
		    }
		    
		    if (!_.isFunction(subscription) && !_.isFunction(context[subscription])) {
		        if (debug) console.warn('Fuction passed as callback to channel subscription named  ' + channel + ' seems invalid! Skipped!');
		        return;
		    }
			
			if (!channels[channel]) channels[channel] = [];
			channels[channel].push({fn: subscription, context: context || this, once: once});
		},
		
		/**
		 * Cancel subscription
		 *
		 * @param channel
		 * @param fn
		 * @param context
		 */
	    unsubscribe: function(channel, fn, context){
	    	if (!channels[channel]) return;
	
	    	var subscription;
	    	for (var i = 0; i < channels[channel].length; i++) {
	    		subscription = channels[channel][i];
	    		if (subscription.fn === fn && subscription.context === context) {
	    			channels[channel].splice(i, 1);
	    			i--;
	    		}
	    	}
	    },
		
		
		
		/**
	     * Trigger all callbacks for a channel
	     *
	     * @param channel
	     * @params N Extra parametter to pass to handler
	     */
		publish: function(channel) {
			
			if (channel.indexOf('*') > -1) {
		    	throw new Error('When publishing to a channel, you cannot use wildcards');
		    }
			
			var params = [].slice.call(arguments, 1),
				sentSpl = channel.split(':'),
				eleNum  = sentSpl.length,
				pubMe = function (foundChannels, args) {
					for (var i = 0; i < foundChannels.length; i++) {
						var subscription = foundChannels[i];
						subscription.fn.apply(subscription.context, args);
						if (subscription.once) {
							Backbone.Mediator.unsubscribe(channel, subscription.fn, subscription.context);
							i--;
						}
					}
				};
			for (var c in channels) {
			    var cSpl = c.split(':');
			    
			    for (var i = 0; i < eleNum; ++i) {
			        if (sentSpl[i] !== cSpl[i] && 
			        	cSpl[i]    !== '*') { 
			        	break; 
			        }
			        
			        if (i === eleNum - 1) {
			        	pubMe(channels[c], params);
			        	
			        }
			    }
			}
		},



	    /**
	     * Subscribing to one event only
	     *
	     * @param channel
	     * @param subscription
	     * @param context
	     */
	    subscribeOnce: function (channel, subscription, context) {
	    	Backbone.Mediator.subscribe(channel, subscription, context, true);
	    }

	};

	/**
	 * Allow to define convention-based subscriptions
	 * as an 'subscriptions' hash on a view. Subscriptions
	 * can then be easily setup and cleaned.
	 *
	 * @class
	 */
	Subscriber = {

		/**
     	 * Extend delegateEvents() to set subscriptions
     	 */
		delegateEvents: function () {
			delegateEvents.apply(this, arguments);
			this.setSubscriptions();
		},

		/**
		 * Extend undelegateEvents() to unset subscriptions
		 */
		undelegateEvents: function() {
			undelegateEvents.apply(this, arguments);
			this.unsetSubscriptions();
		},

		/** 
		 * @property {Object} List of subscriptions, to be defined 
		 */
		subscriptions: {},

	    /**
	     * Subscribe to each subscription
	     * @param {Object} [subscriptions] An optional hash of subscription to add
	     */
	    setSubscriptions: function(subscriptions){
		    if (subscriptions) _.extend(this.subscriptions || {}, subscriptions);
		    subscriptions = subscriptions || this.subscriptions;
		    if (!subscriptions || _.isEmpty(subscriptions)) return;
		    // Just to be sure we don't set duplicate
		    this.unsetSubscriptions(subscriptions);
		
		    _.each(subscriptions, function(subscription, channel) {
		    	var once;
		    	if (subscription.$once) {
		    		subscription = subscription.$once;
		    		once = true;
		    	}
		    	if (_.isString(subscription)) {
		    		subscription = this[subscription];
		    	}
		    	Backbone.Mediator.subscribe(channel, subscription, this, once);
		    	
		    }, this);
	    },

	    /**
	     * Unsubscribe to each subscription
	     * @param {Object} [subscriptions] An optional hash of subscription to remove
	     */
	    unsetSubscriptions: function(subscriptions){
	      subscriptions = subscriptions || this.subscriptions;
	      if (!subscriptions || _.isEmpty(subscriptions)) return;
	      _.each(subscriptions, function(subscription, channel){
	        if (_.isString(subscription)) {
	          subscription = this[subscription];
	        }
	        Backbone.Mediator.unsubscribe(channel, subscription.$once || subscription, this);
	      }, this);
	    }
	  };

	  /**
	   * @lends Backbone.View.prototype
	   */
	  _.extend(Backbone.View.prototype, Subscriber);
	
	  /**
	   * @lends Backbone.Mediator
	   */
	  _.extend(Backbone.Mediator, {
	    /**
	     * Shortcut for publish
	     * @function
	     */
	    pub: Backbone.Mediator.publish,
	    /**
	     * Shortcut for subscribe
	     * @function
	     */
	    sub: Backbone.Mediator.subscribe
	  });

	return Backbone;
});

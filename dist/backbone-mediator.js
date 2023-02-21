(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'backbone', 'underscore'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('backbone'), require('underscore'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.backbone, global.underscore);
    global.backboneMediator = mod.exports;
  }
})(this, function (exports, _backbone, _underscore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _backbone2 = _interopRequireDefault(_backbone);

  var _underscore2 = _interopRequireDefault(_underscore);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  // When running in global scope, we have to map manually...
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
   * @requires _
   * @requires Backbone
   */
  var Backbone = _backbone2.default || window.Backbone;
  var _ = _underscore2.default || window._;

  /**
   * @static
   */
  var Subscriber,

  /** @borrows Backbone.View#delegateEvents */
  _delegateEvents = Backbone.View.prototype.delegateEvents,

  /** @borrows Backbone.View#delegateEvents */
  _undelegateEvents = Backbone.View.prototype.undelegateEvents;

  /**
   * @class
   */
  Backbone.Mediator = _.extend({
    subscribe: function subscribe(event, callback, context, once) {
      if (once) {
        return this.once(event, callback, context);
      } else {
        return this.on(event, callback, context);
      }
    },

    publish: function publish() {
      return this.trigger.apply(this, arguments);
    },

    unsubscribe: function unsubscribe() {
      return this.off.apply(this, arguments);
    },

    subscribeOnce: function subscribeOnce() {
      return this.once.apply(this, arguments);
    }
  }, Backbone.Events);

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
    delegateEvents: function delegateEvents() {
      _delegateEvents.apply(this, arguments);
      this.setSubscriptions();
    },

    /**
     * Extend undelegateEvents() to unset subscriptions
     */
    undelegateEvents: function undelegateEvents() {
      _undelegateEvents.apply(this, arguments);
      this.unsetSubscriptions();
    },

    /** @property {Object} List of subscriptions, to be defined */
    subscriptions: {},

    /**
     * Subscribe to each subscription
     * @param {Object} [subscriptions] An optional hash of subscription to add
     */

    setSubscriptions: function setSubscriptions(subscriptions) {
      if (subscriptions) _.extend(this.subscriptions || {}, subscriptions);
      subscriptions = subscriptions || this.subscriptions;
      if (!subscriptions || _.isEmpty(subscriptions)) return;
      // Just to be sure we don't set duplicate
      this.unsetSubscriptions(subscriptions);

      _.each(subscriptions, function (subscription, channel) {
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
    unsetSubscriptions: function unsetSubscriptions(subscriptions) {
      subscriptions = subscriptions || this.subscriptions;
      if (!subscriptions || _.isEmpty(subscriptions)) return;
      _.each(subscriptions, function (subscription, channel) {
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

  exports.default = Backbone.Mediator;
});

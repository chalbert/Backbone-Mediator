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
import backbone from 'backbone';
import underscore from 'underscore';

// When running in global scope, we have to map manually...
const Backbone = backbone || window.Backbone;
const _ = underscore || window._;

/**
 * @static
 */
var
  Subscriber,
  /** @borrows Backbone.View#delegateEvents */
  delegateEvents = Backbone.View.prototype.delegateEvents,
  /** @borrows Backbone.View#delegateEvents */
  undelegateEvents = Backbone.View.prototype.undelegateEvents;

/**
 * @class
 */
Backbone.Mediator = _.extend({
  subscribe: function (event, callback, context, once) {
    if (once) {
      return this.once(event, callback, context);
    } else {
      return this.on(event, callback, context);
    }
  },

  publish: function (...args) {
    return this.trigger(...args);
  },

  unsubscribe: function (...args) {
    return this.off(...args);
  },

  subscribeOnce: function (...args) {
    return this.once(...args);
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
  delegateEvents: function () {
    delegateEvents.apply(this, arguments);
    this.setSubscriptions();
  },

  /**
   * Extend undelegateEvents() to unset subscriptions
   */
  undelegateEvents: function () {
    undelegateEvents.apply(this, arguments);
    this.unsetSubscriptions();
  },

  /** @property {Object} List of subscriptions, to be defined */
  subscriptions: {},

  /**
   * Subscribe to each subscription
   * @param {Object} [subscriptions] An optional hash of subscription to add
   */

  setSubscriptions: function (subscriptions) {
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
  unsetSubscriptions: function (subscriptions) {
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

export default Backbone.Mediator;

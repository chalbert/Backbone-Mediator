# Backbone-Mediator

Backbone plugin to add app-wide pub/sub.

## API

### subscribe(channel, subscription, context [, once])
  *or shortcut sub()*
  
  Subscribe to a channel.

    Backbone.Mediator.subscribe('view:loaded', this.callback, this);
    
    // or
    
    Backbone.Mediator.sub('view:loaded', this.callback, this);
    
    
### subscribeOnce(channel, subscription, context)
  
  Subscribe to a channel **once**.
  
    // Will be called once only
    Backbone.Mediator.subscribeOnce('view:loaded', this.callback, this);

### publish(channel [, arg1][, argN])
  *or shortcut pub()*

  Execute all callbacks defined for a channel. Any addional argument will be tranfered to the callback.
  
    Backbone.Mediator.publish('view:loaded', 'myView');
    
    // or
    
    Backbone.Mediator.pub('view:loaded', 'myView');
    
## Convention-based subscriptions

Add a 'subscriptions' property to your view. The subscriptions property must be an hash as
{channel:method}, where method
is either a string representing a view method, or a function. The methods will be called with the 
view context.

    var View = Backbone.View.extend({
      subscriptions: {
        'item:select': 'enable', // calls this.enable
        'item:unselect': function(){...}
      }
    });
    
The subscriptions are tied with the delegateEvents/undelegateEvents methods. Calling delegateEvents() automatically
sets subscriptions and calling undelegateEvents() unsets them.
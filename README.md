# Backbone-Mediator

Backbone plugin to add app-wide pub/sub.

## API

### subscribe(channel, subscription, context [, once])
  *or shortcut sub()*
  
  Subscribe to a channel.

    Backbone.Mediator.subscribe('myView:viewId:view:loaded', this.callback, this);
    
    Backbone.Mediator.sub('myView:viewId:view:loaded', this.callback, this);
    
  Subscribe to a group of channels using wildcards
    
    Backbone.Mediator.subscribe('myView:*:view:loaded', this.callback, this);
  
 
### subscribeOnce(channel, subscription, context)
  
  Subscribe to a channel **once**.
  
    // Will be called once only
    Backbone.Mediator.subscribeOnce('myView:viewId:view:loaded', this.callback, this);

### publish(channel [, arg1][, argN])
  *or shortcut pub()*

  Execute all callbacks defined for a channel. Any addional argument will be tranfered to the callback.
  
    Backbone.Mediator.publish('myView:viewId:view:loaded', 'myView');
    
    // or
    
    Backbone.Mediator.pub('myView:viewId:view:loaded', 'myView');
    
## Convention-based subscriptions

Add a 'subscriptions' property to your view. The subscriptions property must be an hash as
{channel:method}, where method
is either a string representing a view method, or a function. The methods will be called with the 
view context.

    var View = Backbone.View.extend({
      subscriptions: {
        'view:id:item:select': 'enable', // calls this.enable
        'view:id:item:select': function(){...}
      }
    });
    
The subscriptions are tied with the delegateEvents/undelegateEvents methods. Calling delegateEvents() automatically
sets subscriptions and calling undelegateEvents() unsets them.


## Channel naming pattern

Backbone Mediator does not impose many restrictions on how channels are named, but it's usually 
a good ideia to always follow the same pattern throghout your application. There are, however, 
a few simple rules you must follow in order to assure proper functioning:

  1. dots(.) and colons(:) are used in channel namespacing to separate components. 
  2. All channels should have the same number of components
  3. asterisk(*) is used for wildcards (see below)

These rules are specially important if you want to use wildcard channel subscription (see below)

Backbone Mediator suggests using a 4 namespaced component channel with the following pattern:

    <className>:<objectID>:<item>:<event>
    
example:

    albumModel:albumModel_id:artist:changed
    
    albumView:albumView_id:view:loaded
    
    albumView:button_DOM_id:button:click
    

## Wildcards

Wilcards enable a controller to subscribe to a group of related channels without 
needing to subscribe to each one individually. This adds flexibility to your application.

Take the following example channels:

    1. foo:bar:baz
    2. foo:banana:baz
    3. car:banana:baz

### Single winldcard

Subscribe to channel 1 and 2

    Backbone.Mediator.sub('foo:*:baz', callback);

Subscribe to channel 2 and 3

    Backbone.Mediator.sub('*:banana:baz', callback);
    
###Multiple wildcards 

Multiple wilcards are allowed.

Subscribe to all channels started by foo

    Backbone.Mediator.sub('foo:*:*', callback);

Subscribe to all channels ended in baz

    Backbone.Mediator.sub('*:*:baz', callback);

Subscribe to all channels

    Backbone.Mediator.sub('*:*:*', callback);

Please note that wildcards cannot be used when publishing, only when subscribing. 

This means:

    //Invalid
    Backbone.Mediator.publish('myView:*:view:loaded', 'myView');
    
    //Valid
    Backbone.Mediator.subscribe('myView:*:view:loaded', 'myView');
    

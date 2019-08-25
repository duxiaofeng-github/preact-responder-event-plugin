# preact-responder-event-plugin

This library implement the react native's `Gesture Responder System` which is required by react-native-web.

It brings [preact](https://github.com/preactjs/preact) and [react-native-web](https://github.com/necolas/react-native-web) together like react-dom does for react and react-native-web.

So you can build a react native app into web app by using preact now.

# Installation

```
npm i preact-responder-event-plugin
```

or

```
yarn add preact-responder-event-plugin
```

# Usage

You only need to add some aliases in your webpack config to replace the `react-native`, `react`, `react-dom` implicitly. of course you need to install `react-native-web` and `preact` first.

```
  resolve: {
    alias: {
      "react-native$": "react-native-web",
      react$: "preact/compat",
      "react-dom$": "preact/compat",
      "react-dom/unstable-native-dependencies$": "preact-responder-event-plugin",
    },
  },
```

# Try it

[example](https://duxiaofeng-github.github.io/preact-responder-event-plugin/example)

# How it works

The plugin will listen to some events like `touchstart`, `touchmove` at document node like the react do.

It will find those views which want to be the `responder`(if a view has an `onStartShouldSetResponder` or `onMoveShouldSetResponder` property) and pick the first one to be the responder when start or move events being triggered

If another view, like a parent view, also wants to be a responder. the plugin will call responder's `onResponderTerminationRequest` to ask if it allows the request. if it returns true, the `responder` will be transfered to another view.

If it's a multi-finger touch, the responder view's `onTouchEnd` will be called when `touchend` event fired and when the `event.touches` becames to zero, `onResponderRelease` will be called.

At destop platform, a mouse event will transform to a touch event and treat like a single-finger event.

Here is a graph in [ResponderEventPlugin](https://github.com/facebook/react/blob/b1a03dfdc8e42d075422556553ffe59868150e95/packages/legacy-events/ResponderEventPlugin.js) describes the whole process.

```
                                               Negotiation Performed
                                             +-----------------------+
                                            /                         \
Process low level events to    +     Current Responder      +   wantsResponderID
determine who to perform negot-|   (if any exists at all)   |
iation/transition              | Otherwise just pass through|
-------------------------------+----------------------------+------------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +-------------+           |                            |
     | onTouchStart|           |                            |
     +------+------+     none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onStartShouldSetResponder|----->|onResponderStart (cur)  |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderReject
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | |   onResponder          | |
            +------------------->|      TerminationRequest| |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | |   onResponderTerminate |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderStart|
                               |                            | +----------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +-------------+           |                            |
     | onTouchMove |           |                            |
     +------+------+     none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onMoveShouldSetResponder |----->|onResponderMove (cur)   |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderRejec|
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | |   onResponder          | |
            +------------------->|      TerminationRequest| |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | |   onResponderTerminate |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderMove |
                               |                            | +----------------+
                               |                            |
                               |                            |
      Some active touch started|                            |
      inside current responder | +------------------------+ |
      +------------------------->|      onResponderEnd    | |
      |                        | +------------------------+ |
  +---+---------+              |                            |
  | onTouchEnd  |              |                            |
  +---+---------+              |                            |
      |                        | +------------------------+ |
      +------------------------->|     onResponderEnd     | |
      No active touches started| +-----------+------------+ |
      inside current responder |             |              |
                               |             v              |
                               | +------------------------+ |
                               | |    onResponderRelease  | |
                               | +------------------------+ |
                               |                            |
                               +                            +
```

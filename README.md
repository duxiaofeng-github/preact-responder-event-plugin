# [preact-responder-event-plugin](https://github.com/duxiaofeng-github/preact-responder-event-plugin)

[![HitCount](http://hits.dwyl.io/duxiaofeng-github/preact-responder-event-plugin.svg)](http://hits.dwyl.io/duxiaofeng-github/preact-responder-event-plugin)

This library implement the react native's `Gesture Responder System` which is required by react-native-web.

It brings the [preact](https://github.com/preactjs/preact) and [react-native-web](https://github.com/necolas/react-native-web) together like what react-dom does for react and react-native-web. Now you can build a react native app into web app by using preact.

It's 3KB after compressed, no need to worry about the size.

# Installation

It depends on preact 10 and react-native-web, so you need to install them too.

```
npm i preact-responder-event-plugin react-native-web preact@next
```

or

```
yarn add preact-responder-event-plugin react-native-web preact@next
```

# Usage

All you need to do is add some aliases in your webpack config to replace the `react-native`, `react`, `react-dom` implicitly.

```
  resolve: {
    alias: {
      "react-native$": "react-native-web/dist/index.js",
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

If another view, like a parent view, also wants to be a responder. the plugin will call responder's `onResponderTerminationRequest` to ask if it allows the request. if it returns true, the `responder` will be transferred to another view.

If it's a multi-finger touch, the responder view's `onTouchEnd` will be called when the `touchend` event is fired and when the `event.touches` becames zero, `onResponderRelease` will be called.

On desktop platform, a mouse event will transform to a touch event and it will be treated like a single-finger event.

Here is a graph in [ResponderEventPlugin](https://github.com/facebook/react/blob/b1a03dfdc8e42d075422556553ffe59868150e95/packages/legacy-events/ResponderEventPlugin.js) that describes the whole process.

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

# CHANGELOG

[CHANGELOG](./CHANGELOG.md)

# LICENSE

MIT

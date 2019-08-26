import { options } from 'preact';

var root;
var oldRootHook = options._root;

options._root = function (node) {
  root = node;

  if (root != null) {
    addEventListenerToDocument();
  } else {
    removeEventListenerToDocument();
  }

  if (oldRootHook) { oldRootHook(node); }
};

var oldCommitHook = options._commit;

options._commit = function (node) {
  if (root && plugins.ResponderEventPlugin) {
    var vnodes = [root];

    while (vnodes.length) {
      var vnode = vnodes.pop(); // it's a real vnode reflect to the dom

      if (typeof vnode.type === "string") {
        vnode._dom._vnode = vnode;
      }

      if (vnode._children != null && vnode._children.length != null) {
        for (var i = 0, list = vnode._children; i < list.length; i += 1) {
          var child = list[i];

          if (child != null) {
            vnodes.push(child);
          }
        }
      }
    }
  }

  if (oldCommitHook) { oldCommitHook(node); }
};

var ProcessType;

(function (ProcessType) {
  ProcessType[ProcessType["start"] = 0] = "start";
  ProcessType[ProcessType["move"] = 1] = "move";
  ProcessType[ProcessType["end"] = 2] = "end";
})(ProcessType || (ProcessType = {}));

var startResponderKey = "onResponderStart";
var moveResponderKey = "onResponderMove";
var endResponderKey = "onResponderEnd";
var startCheckerKeys = ["onStartShouldSetResponderCapture", "onStartShouldSetResponder"];
var moveCheckerKeys = ["onMoveShouldSetResponderCapture", "onMoveShouldSetResponder"];
var startDefinition = getEventDefinition(startCheckerKeys, startResponderKey, ProcessType.start);
var moveDefinition = getEventDefinition(moveCheckerKeys, moveResponderKey, ProcessType.move);
var endDefinition = getEventDefinition([], endResponderKey, ProcessType.end);
var responderEvents = {
  touchstart: startDefinition,
  mousedown: startDefinition,
  touchmove: moveDefinition,
  mousemove: moveDefinition,
  touchend: endDefinition,
  mouseup: endDefinition
};

function getEventDefinition(checkerKeys, responderKey, process) {
  return {
    checkerKeys: checkerKeys,
    responderKey: responderKey,
    process: process
  };
}

function addEventListenerToDocument() {
  for (var event in responderEvents) {
    document.addEventListener(event, eventListener);
  }
}

function removeEventListenerToDocument() {
  for (var event in responderEvents) {
    document.removeEventListener(event, eventListener);
  }
}

function getEventPath(e) {
  var path = [e.target];
  var parent = [e.target];

  while (parent.length) {
    var ele = parent.pop();

    if (ele.parentElement) {
      parent.push(ele.parentElement);
      path.push(ele.parentElement);
    }
  }

  return path;
}

function getCheckersWithPropsByEventPath(checkerKey, eventPath, isCapture) {
  var checkers = [];

  for (var i = 0, list = eventPath; i < list.length; i += 1) {
    var dom = list[i];

    var vnode = dom._vnode;

    if (vnode != null) {
      if (typeof vnode.props === "object") {
        var checker = vnode.props[checkerKey];

        if (checker != null) {
          checkers.push({
            isCapture: isCapture,
            checker: checker,
            props: vnode.props,
            dom: dom
          });
        }
      }
    }
  }

  return checkers;
}

function getCheckers(eventType, eventPath, eventPathReverse) {
  var definition = responderEvents[eventType];
  var checkerKeys = definition.checkerKeys;
  var checkers = [];

  for (var i = 0, list = checkerKeys; i < list.length; i += 1) {
    // invoke capture checkers from root
    var key = list[i];

    if (key.indexOf("Capture") > -1) {
      checkers.push.apply(checkers, getCheckersWithPropsByEventPath(key, eventPathReverse, true));
    } else {
      checkers.push.apply(checkers, getCheckersWithPropsByEventPath(key, eventPath, false));
    }
  }

  return checkers;
}

function getEventPaths(e) {
  var eventPath = e.composedPath != null ? e.composedPath() : getEventPath(e);
  var eventPathReverse = eventPath.concat([]).reverse();
  return {
    eventPath: eventPath,
    eventPathReverse: eventPathReverse
  };
}

function setEvent(e, responderKey, props) {
  var responder = props[responderKey];

  if (plugins.ResponderEventPlugin.view) {
    plugins.ResponderEventPlugin.view.event = {
      responder: responder,
      type: e.type
    };
  }
}

function initView(e, responderKey, props, dom) {
  var responder = props[responderKey];
  plugins.ResponderEventPlugin.view = {
    event: {
      responder: responder,
      type: e.type
    },
    props: props,
    dom: dom
  };
  var onResponderGrant = props.onResponderGrant;
  if (onResponderGrant) { onResponderGrant(e); }
}

function handleResponderTransferRequest(e, definition, props, dom) {
  var view = getCurrentView(); // view can't be null here

  var ref = view.props;
  var onResponderTerminate = ref.onResponderTerminate;
  var onResponderTerminationRequest = ref.onResponderTerminationRequest;
  var onResponderReject = props.onResponderReject;

  if (onResponderTerminationRequest) {
    var allowTransfer = onResponderTerminationRequest(e);

    if (allowTransfer) {
      initView(e, definition.responderKey, props, dom);
      if (onResponderTerminate) { onResponderTerminate(e); }
    } else {
      if (onResponderReject) { onResponderReject(e); }
    }
  } else {
    initView(e, definition.responderKey, props, dom);
    if (onResponderTerminate) { onResponderTerminate(e); }
  }
}

function handleActiveTouches(e) {
  ResponderTouchHistoryStore.touchHistory.numberActiveTouches = e.touches.length;
}

function isStartish(definition) {
  return definition.process === ProcessType.start;
}

function isMoveish(definition) {
  return definition.process === ProcessType.move;
}

function isEndish(definition) {
  return definition.process === ProcessType.end;
}

function getCurrentView() {
  if (plugins.ResponderEventPlugin) {
    return plugins.ResponderEventPlugin.view;
  }
}

function getCurrentEvent() {
  var view = getCurrentView();

  if (view) {
    return view.event;
  }
}

function getCurrentResponder() {
  var event = getCurrentEvent();

  if (event) {
    return event.responder;
  }
}

function executeResponder(e, checker) {
  var definition = responderEvents[e.type];
  handleActiveTouches(e);

  if (isStartish(definition) || isMoveish(definition)) {
    for (var i = 0, list = checker; i < list.length; i += 1) {
      var item = list[i];

      e = Object.assign({}, e,
        {bubbles: !item.isCapture});
      var requireToBeResponder = item.checker(e);

      if (requireToBeResponder) {
        var view = getCurrentView(); // if no responding view, set it and call granted

        if (view == null) {
          initView(e, definition.responderKey, item.props, item.dom);
        } else {
          // if same view is responding, set new responder
          if (view.dom === item.dom) {
            setEvent(e, definition.responderKey, item.props);
          } else {
            // if other view wants to response, start to negotiate
            handleResponderTransferRequest(e, definition, item.props, item.dom);
          }
        }
      }
    }

    var responder = getCurrentResponder();

    if (responder) {
      responder(e);
      plugins.ResponderEventPlugin.view.event = null;
    }
  }

  if (isEndish(definition)) {
    var view$1 = getCurrentView();

    if (view$1 != null) {
      var ref = view$1.props;
      var onResponderRelease = ref.onResponderRelease;
      var onResponderEnd = ref.onResponderEnd;

      if (onResponderEnd) {
        onResponderEnd(e);
      }

      if (ResponderTouchHistoryStore.touchHistory.numberActiveTouches === 0) {
        if (onResponderRelease) {
          onResponderRelease(e);
        }

        if (plugins.ResponderEventPlugin) {
          plugins.ResponderEventPlugin.view = null;
        }
      }
    }
  }
}

function eventListener(e) {
  if (!plugins.ResponderEventPlugin) { return; }
  var result = plugins.ResponderEventPlugin.extractEvents(e.type, {}, e, e.target);

  if (result == null) {
    return;
  }

  var nativeEvent = result.nativeEvent;
  var ref = getEventPaths(nativeEvent);
  var eventPath = ref.eventPath;
  var eventPathReverse = ref.eventPathReverse;
  var checkers = getCheckers(nativeEvent.type, eventPath, eventPathReverse);
  executeResponder(nativeEvent, checkers);
}

var ResponderEventPlugin = {
  view: null,
  extractEvents: function (eventType, props, nativeEvent, nativeEventTarget) {
    return {
      nativeEvent: nativeEvent
    };
  },
  eventTypes: {
    responderMove: {
      dependencies: ["touchmove", "mousemove"]
    }
  }
};
var ResponderTouchHistoryStore = {
  touchHistory: {
    numberActiveTouches: 0
  }
};
var plugins = {};
var injectEventPluginsByName = function (injectedPlugins) {
  plugins = Object.assign({}, plugins, injectedPlugins);
};
var index = {
  injectEventPluginsByName: injectEventPluginsByName,
  ResponderEventPlugin: ResponderEventPlugin,
  ResponderTouchHistoryStore: ResponderTouchHistoryStore
};

export default index;
export { ResponderEventPlugin, ResponderTouchHistoryStore, injectEventPluginsByName };

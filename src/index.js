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

  if (oldRootHook) { oldRootHook.apply(null, arguments); }
};

var oldCommitHook = options._commit;

options._commit = function (node) {
  if (root && getPlugin()) {
    var vnodes = [root];

    while (vnodes.length) {
      var vnode = vnodes.pop(); // it's a real vnode reflect to the dom

      if (typeof vnode.type === "string") {
        var dom = vnode._dom;

        if (dom != null) {
          dom._vnode = vnode;
        }
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

  if (oldCommitHook) { oldCommitHook.apply(null, arguments); }
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

function getEventDefinition(prepCheckerKeys, prepResponderKey, prepProcess) {
  return {
    prepCheckerKeys: prepCheckerKeys,
    prepResponderKey: prepResponderKey,
    prepProcess: prepProcess
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
    var parentElement = ele.parentElement;

    if (parentElement) {
      parent.push(parentElement);
      path.push(parentElement);
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
            prepChecker: checker,
            prepProps: vnode.props,
            prepDom: dom
          });
        }
      }
    }
  }

  return checkers;
}

function getCheckers(eventType, eventPath, eventPathReverse) {
  var definition = responderEvents[eventType];
  var checkerKeys = definition.prepCheckerKeys;
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
  var composedPath = e.composedPath;
  var path = e.path || (composedPath != null ? composedPath() : getEventPath(e));
  var pathReverse = path.concat([]).reverse();
  return {
    p: path,
    pr: pathReverse
  };
}

function setEvent(e, responderKey, props) {
  var responder = props[responderKey];
  var plugin = getPlugin();

  if (plugin.prepView) {
    plugin.prepView.prepEvent = {
      prepResponder: responder,
      prepType: e.type
    };
  }
}

function initView(e, responderKey, props, dom) {
  var responder = props[responderKey];
  var plugin = getPlugin();
  plugin.prepView = {
    prepEvent: {
      prepResponder: responder,
      prepType: e.type
    },
    prepProps: props,
    prepDom: dom
  };
  var onResponderGrant = props.onResponderGrant;
  if (onResponderGrant) { onResponderGrant(e); }
}

function handleResponderTransferRequest(e, definition, props, dom) {
  var view = getCurrentView(); // view can't be null here

  var ref = view.prepProps;
  var onResponderTerminate = ref.onResponderTerminate;
  var onResponderTerminationRequest = ref.onResponderTerminationRequest;
  var onResponderReject = props.onResponderReject;

  if (onResponderTerminationRequest) {
    var allowTransfer = onResponderTerminationRequest(e);

    if (allowTransfer) {
      initView(e, definition.prepResponderKey, props, dom);
      if (onResponderTerminate) { onResponderTerminate(e); }
    } else {
      if (onResponderReject) { onResponderReject(e); }
    }
  } else {
    initView(e, definition.prepResponderKey, props, dom);
    if (onResponderTerminate) { onResponderTerminate(e); }
  }
}

function handleActiveTouches(e) {
  ResponderTouchHistoryStore.touchHistory.numberActiveTouches = e.nativeEvent.touches.length;
}

function isStartish(definition) {
  return definition.prepProcess === ProcessType.start;
}

function isMoveish(definition) {
  return definition.prepProcess === ProcessType.move;
}

function isEndish(definition) {
  return definition.prepProcess === ProcessType.end;
}

function getPlugin() {
  return plugins.ResponderEventPlugin;
}

function getCurrentView() {
  var plugin = getPlugin();

  if (plugin) {
    return plugin.prepView;
  }
}

function getCurrentEvent() {
  var view = getCurrentView();

  if (view) {
    return view.prepEvent;
  }
}

function getCurrentResponder() {
  var event = getCurrentEvent();

  if (event) {
    return event.prepResponder;
  }
}

function executeResponder(e, checker) {
  var definition = responderEvents[e.type];
  handleActiveTouches(e);

  if (isStartish(definition) || isMoveish(definition)) {
    for (var i = 0, list = checker; i < list.length; i += 1) {
      var item = list[i];

      var requireToBeResponder = item.prepChecker(e);

      if (requireToBeResponder) {
        var view = getCurrentView(); // if no responding view, set it and call granted

        if (view == null) {
          initView(e, definition.prepResponderKey, item.prepProps, item.prepDom);
        } else {
          // if same view is responding, set new responder
          if (view.prepDom === item.prepDom) {
            setEvent(e, definition.prepResponderKey, item.prepProps);
          } else {
            // if other view wants to response, start to negotiate
            handleResponderTransferRequest(e, definition, item.prepProps, item.prepDom);
          }
        }

        break;
      }
    }

    var responder = getCurrentResponder();

    if (responder) {
      responder(e);
      getPlugin().prepView.prepEvent = null;
    }
  }

  if (isEndish(definition)) {
    var view$1 = getCurrentView();

    if (view$1 != null) {
      var ref = view$1.prepProps;
      var onResponderRelease = ref.onResponderRelease;
      var onResponderEnd = ref.onResponderEnd;

      if (onResponderEnd) {
        onResponderEnd(e);
      }

      if (ResponderTouchHistoryStore.touchHistory.numberActiveTouches === 0) {
        if (onResponderRelease) {
          onResponderRelease(e);
        }

        var plugin = getPlugin();

        if (plugin) {
          plugin.prepView = null;
        }
      }
    }
  }
}

function eventListener(e) {
  var plugin = getPlugin();
  if (!plugin) { return; }
  var result = plugin.extractEvents(e.type, {}, e, e.target);

  if (result == null) {
    return;
  }

  e.nativeEvent = result.nativeEvent;
  var ref = getEventPaths(e);
  var p = ref.p;
  var pr = ref.pr;
  var checkers = getCheckers(e.type, p, pr);
  executeResponder(e, checkers);
}

var ResponderEventPlugin = {
  prepView: null,
  extractEvents: function (eventType, props, nativeEvent, nativeEventTarget) {
    return {
      // event will transform to NativeTouchEvent by react-native-web
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

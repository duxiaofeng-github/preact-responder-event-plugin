import { VNode, options } from "preact";
import { NativeTouchEvent } from "react-native";

let root: VNode;

const oldRootHook = (options as any)._root;

(options as any)._root = (node: VNode) => {
  root = node;

  if (root != null) {
    addEventListenerToDocument();
  } else {
    removeEventListenerToDocument();
  }

  if (oldRootHook) oldRootHook(node);
};

let oldCommitHook = (options as any)._commit;

(options as any)._commit = (node: VNode) => {
  if (root && getPlugin()) {
    const vnodes = [root];

    while (vnodes.length) {
      const vnode = vnodes.pop();

      // it's a real vnode reflect to the dom
      if (typeof (vnode as any).type === "string") {
        (vnode as any)._dom._vnode = vnode;
      }

      if ((vnode as any)._children != null && (vnode as any)._children.length != null) {
        for (let child of (vnode as any)._children) {
          if (child != null) {
            vnodes.push(child);
          }
        }
      }
    }
  }

  if (oldCommitHook) oldCommitHook(node);
};

enum ProcessType {
  start = 0,
  move,
  end,
}
const startResponderKey = "onResponderStart";
const moveResponderKey = "onResponderMove";
const endResponderKey = "onResponderEnd";
const startCheckerKeys = ["onStartShouldSetResponderCapture", "onStartShouldSetResponder"];
const moveCheckerKeys = ["onMoveShouldSetResponderCapture", "onMoveShouldSetResponder"];
const startDefinition = getEventDefinition(startCheckerKeys, startResponderKey, ProcessType.start);
const moveDefinition = getEventDefinition(moveCheckerKeys, moveResponderKey, ProcessType.move);
const endDefinition = getEventDefinition([], endResponderKey, ProcessType.end);

interface IDefinition {
  _checkerKeys: string[];
  _responderKey: string;
  _process: ProcessType;
}

interface IResponderEvents {
  [key: string]: IDefinition;
}

const responderEvents: IResponderEvents = {
  touchstart: startDefinition,
  mousedown: startDefinition,
  touchmove: moveDefinition,
  mousemove: moveDefinition,
  touchend: endDefinition,
  mouseup: endDefinition,
};

function getEventDefinition(_checkerKeys: string[], _responderKey: string, _process: ProcessType) {
  return { _checkerKeys, _responderKey, _process };
}

function addEventListenerToDocument() {
  for (let event in responderEvents) {
    document.addEventListener(event, eventListener);
  }
}

function removeEventListenerToDocument() {
  for (let event in responderEvents) {
    document.removeEventListener(event, eventListener);
  }
}

function getEventPath(e: IEvent) {
  const path = [e.target];
  const parent: any[] = [e.target];

  while (parent.length) {
    const ele = parent.pop();
    const parentElement = ele.parentElement;

    if (parentElement) {
      parent.push(parentElement);
      path.push(parentElement);
    }
  }

  return path;
}

type IChecker = (e: IEvent) => boolean;

interface ICheckers {
  onMoveShouldSetResponderCapture?: IChecker;
  onMoveShouldSetResponder?: IChecker;
  onStartShouldSetResponderCapture?: IChecker;
  onStartShouldSetResponder?: IChecker;
}

interface IResponders {
  onResponderStart?: (e: IEvent) => void;
  onResponderMove?: (e: IEvent) => void;
  onResponderEnd?: (e: IEvent) => void;
}

interface IProcessors {
  onResponderTerminationRequest?: IChecker;
  onResponderTerminate?: (e: IEvent) => void;
  onResponderGrant?: (e: IEvent) => void;
  onResponderReject?: (e: IEvent) => void;
  onResponderRelease?: (e: IEvent) => void;
}

type IProps = ICheckers & IResponders & IProcessors;

interface ICheckerWrapper {
  _isCapture: boolean;
  _checker: IChecker;
  _props: IProps;
  _dom: HTMLElement;
}

interface IEvent extends UIEvent {
  nativeEvent: NativeTouchEvent;
}

function getCheckersWithPropsByEventPath(checkerKey: string, eventPath: HTMLElement[], isCapture: boolean) {
  const checkers: ICheckerWrapper[] = [];

  for (let dom of eventPath) {
    const vnode = (dom as any)._vnode;

    if (vnode != null) {
      if (typeof vnode.props === "object") {
        const checker = vnode.props[checkerKey];

        if (checker != null) {
          checkers.push({
            _isCapture: isCapture,
            _checker: checker,
            _props: vnode.props as IProps,
            _dom: dom,
          });
        }
      }
    }
  }

  return checkers;
}

function getCheckers(eventType: string, eventPath: HTMLElement[], eventPathReverse: HTMLElement[]) {
  const definition = responderEvents[eventType];
  const checkerKeys = definition._checkerKeys;
  const checkers: ICheckerWrapper[] = [];

  for (let key of checkerKeys) {
    // invoke capture checkers from root
    if (key.indexOf("Capture") > -1) {
      checkers.push(...getCheckersWithPropsByEventPath(key, eventPathReverse, true));
    } else {
      checkers.push(...getCheckersWithPropsByEventPath(key, eventPath, false));
    }
  }

  return checkers;
}

function getEventPaths(e: IEvent) {
  const composedPath = e.composedPath;
  const path = (e as any).path || (composedPath != null ? composedPath() : getEventPath(e));
  const pathReverse = path.concat([]).reverse();
  return { p: path, pr: pathReverse };
}

function setEvent(e: IEvent, responderKey: keyof IProps, props: IProps) {
  const responder = props[responderKey];
  const plugin = getPlugin();

  if (plugin!._view) {
    plugin!._view!._event = {
      _responder: responder,
      _type: e.type,
    };
  }
}

function initView(e: IEvent, responderKey: keyof IProps, props: IProps, dom: HTMLElement) {
  const responder = props[responderKey];
  const plugin = getPlugin();

  plugin!._view = {
    _event: {
      _responder: responder,
      _type: e.type,
    },
    _props: props,
    _dom: dom,
  };

  const { onResponderGrant } = props;

  if (onResponderGrant) onResponderGrant(e);
}

function handleResponderTransferRequest(e: IEvent, definition: IDefinition, props: IProps, dom: HTMLElement) {
  const view = getCurrentView();
  // view can't be null here
  const { onResponderTerminate, onResponderTerminationRequest } = view!._props;
  const { onResponderReject } = props;

  if (onResponderTerminationRequest) {
    const allowTransfer = onResponderTerminationRequest(e);

    if (allowTransfer) {
      initView(e, definition._responderKey as keyof IProps, props, dom);
      if (onResponderTerminate) onResponderTerminate(e);
    } else {
      if (onResponderReject) onResponderReject(e);
    }
  } else {
    initView(e, definition._responderKey as keyof IProps, props, dom);
    if (onResponderTerminate) onResponderTerminate(e);
  }
}

function handleActiveTouches(e: IEvent) {
  ResponderTouchHistoryStore.touchHistory.numberActiveTouches = e.nativeEvent.touches.length;
}

function isStartish(definition: IDefinition) {
  return definition._process === ProcessType.start;
}

function isMoveish(definition: IDefinition) {
  return definition._process === ProcessType.move;
}

function isEndish(definition: IDefinition) {
  return definition._process === ProcessType.end;
}

function getPlugin() {
  return plugins.ResponderEventPlugin;
}

function getCurrentView() {
  const plugin = getPlugin();
  if (plugin) {
    return plugin._view;
  }
}

function getCurrentEvent() {
  const view = getCurrentView();
  if (view) {
    return view._event;
  }
}

function getCurrentResponder() {
  const event = getCurrentEvent();
  if (event) {
    return event._responder;
  }
}

function executeResponder(e: IEvent, checker: ICheckerWrapper[]) {
  const definition: IDefinition = responderEvents[e.type];

  handleActiveTouches(e);

  if (isStartish(definition) || isMoveish(definition)) {
    for (let item of checker) {
      e = { ...e, bubbles: !item._isCapture };

      const requireToBeResponder = item._checker(e);

      if (requireToBeResponder) {
        const view = getCurrentView();

        // if no responding view, set it and call granted
        if (view == null) {
          initView(e, definition._responderKey as keyof IProps, item._props, item._dom);
        } else {
          // if same view is responding, set new responder
          if (view._dom === item._dom) {
            setEvent(e, definition._responderKey as keyof IProps, item._props);
          } else {
            // if other view wants to response, start to negotiate
            handleResponderTransferRequest(e, definition, item._props, item._dom);
          }
        }

        break;
      }
    }

    const responder = getCurrentResponder();

    if (responder) {
      responder(e);
      getPlugin()!._view!._event = null;
    }
  }

  if (isEndish(definition)) {
    const view = getCurrentView();

    if (view != null) {
      const { onResponderRelease, onResponderEnd } = view._props;

      if (onResponderEnd) {
        onResponderEnd(e);
      }

      if (ResponderTouchHistoryStore.touchHistory.numberActiveTouches === 0) {
        if (onResponderRelease) {
          onResponderRelease(e);
        }

        const plugin = getPlugin();

        if (plugin) {
          plugin._view = null;
        }
      }
    }
  }
}

function eventListener(e: Event) {
  const plugin = getPlugin();

  if (!plugin) return;

  const result = plugin.extractEvents(e.type, {}, e, e.target as HTMLElement);

  if (result == null) {
    return;
  }

  (e as IEvent).nativeEvent = result.nativeEvent;

  const { p, pr } = getEventPaths(e as IEvent);
  const checkers = getCheckers(e.type, p as HTMLElement[], pr as HTMLElement[]);

  executeResponder(e as IEvent, checkers);
}

interface IResponderEventPlugin {
  _view: {
    _dom: HTMLElement;
    _event: {
      _responder: ((e: IEvent) => void) | undefined;
      _type: string;
    } | null;
    _props: IProps;
  } | null;
  extractEvents: (
    eventType: string,
    targetInst: IProps,
    nativeEvent: Event,
    nativeEventTarget: HTMLElement
  ) => { nativeEvent: NativeTouchEvent };
  eventTypes: any;
}

export const ResponderEventPlugin: IResponderEventPlugin = {
  _view: null,
  extractEvents: (eventType: string, props: IProps, nativeEvent: Event, nativeEventTarget: HTMLElement) => {
    return {
      // event will transform to NativeTouchEvent by react-native-web
      nativeEvent: (nativeEvent as any) as NativeTouchEvent,
    };
  },
  eventTypes: {
    responderMove: {
      dependencies: ["touchmove", "mousemove"],
    },
  },
};

export const ResponderTouchHistoryStore = {
  touchHistory: { numberActiveTouches: 0 },
};

interface IPlugins {
  ResponderEventPlugin?: IResponderEventPlugin;
}

let plugins: IPlugins = {};

export const injectEventPluginsByName = (injectedPlugins: IPlugins) => {
  plugins = Object.assign({}, plugins, injectedPlugins);
};

export default {
  injectEventPluginsByName,
  ResponderEventPlugin,
  ResponderTouchHistoryStore,
};

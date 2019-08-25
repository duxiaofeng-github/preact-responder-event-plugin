import { VNode, options } from "preact";

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
  if (root && plugins.ResponderEventPlugin) {
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
  checkerKeys: string[];
  responderKey: string;
  process: ProcessType;
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

function getEventDefinition(checkerKeys: string[], responderKey: string, process: ProcessType) {
  return { checkerKeys, responderKey, process };
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

    if (ele.parentElement) {
      parent.push(ele.parentElement);
      path.push(ele.parentElement);
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
  isCapture: boolean;
  checker: IChecker;
  props: IProps;
  dom: HTMLElement;
}

type IEvent = TouchEvent;

function getCheckersWithPropsByEventPath(checkerKey: string, eventPath: HTMLElement[], isCapture: boolean) {
  const checkers: ICheckerWrapper[] = [];

  for (let dom of eventPath) {
    const vnode = (dom as any)._vnode;

    if (vnode != null) {
      if (typeof vnode.props === "object") {
        const checker = vnode.props[checkerKey];

        if (checker != null) {
          checkers.push({
            isCapture,
            checker,
            props: vnode.props as IProps,
            dom,
          });
        }
      }
    }
  }

  return checkers;
}

function getCheckers(eventType: string, eventPath: HTMLElement[], eventPathReverse: HTMLElement[]) {
  const definition = responderEvents[eventType];
  const checkerKeys = definition.checkerKeys;
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
  const eventPath = e.composedPath != null ? e.composedPath() : getEventPath(e);
  const eventPathReverse = eventPath.concat([]).reverse();
  return { eventPath, eventPathReverse };
}

function setEvent(e: IEvent, responderKey: keyof IProps, props: IProps) {
  const responder = props[responderKey];

  if (plugins.ResponderEventPlugin!.view) {
    plugins.ResponderEventPlugin!.view!.event = {
      responder,
      type: e.type,
    };
  }
}

function initView(e: IEvent, responderKey: keyof IProps, props: IProps, dom: HTMLElement) {
  const responder = props[responderKey];

  plugins.ResponderEventPlugin!.view = {
    event: {
      responder,
      type: e.type,
    },
    props,
    dom,
  };

  const { onResponderGrant } = props;

  if (onResponderGrant) onResponderGrant(e);
}

function handleResponderTransferRequest(e: IEvent, definition: IDefinition, props: IProps, dom: HTMLElement) {
  const view = getCurrentView();
  // view can't be null here
  const { onResponderTerminate, onResponderTerminationRequest } = view!.props;
  const { onResponderReject } = props;

  if (onResponderTerminationRequest) {
    const allowTransfer = onResponderTerminationRequest(e);

    if (allowTransfer) {
      initView(e, definition.responderKey as keyof IProps, props, dom);
      if (onResponderTerminate) onResponderTerminate(e);
    } else {
      if (onResponderReject) onResponderReject(e);
    }
  } else {
    initView(e, definition.responderKey as keyof IProps, props, dom);
    if (onResponderTerminate) onResponderTerminate(e);
  }
}

function handleActiveTouches(e: IEvent) {
  ResponderTouchHistoryStore.touchHistory.numberActiveTouches = e.touches.length;
}

function isStartish(definition: IDefinition) {
  return definition.process === ProcessType.start;
}

function isMoveish(definition: IDefinition) {
  return definition.process === ProcessType.move;
}

function isEndish(definition: IDefinition) {
  return definition.process === ProcessType.end;
}

function getCurrentView() {
  if (plugins.ResponderEventPlugin) {
    return plugins.ResponderEventPlugin.view;
  }
}

function getCurrentEvent() {
  const view = getCurrentView();
  if (view) {
    return view.event;
  }
}

function getCurrentResponder() {
  const event = getCurrentEvent();
  if (event) {
    return event.responder;
  }
}

function executeResponder(e: IEvent, checker: ICheckerWrapper[]) {
  const definition: IDefinition = responderEvents[e.type];

  handleActiveTouches(e);

  if (isStartish(definition) || isMoveish(definition)) {
    for (let item of checker) {
      e = { ...e, bubbles: !item.isCapture };

      const requireToBeResponder = item.checker(e);

      if (requireToBeResponder) {
        const view = getCurrentView();

        // if no responding view, set it and call granted
        if (view == null) {
          initView(e, definition.responderKey as keyof IProps, item.props, item.dom);
        } else {
          // if same view is responding, set new responder
          if (view.dom === item.dom) {
            setEvent(e, definition.responderKey as keyof IProps, item.props);
          } else {
            // if other view wants to response, start to negotiate
            handleResponderTransferRequest(e, definition, item.props, item.dom);
          }
        }
      }
    }

    const responder = getCurrentResponder();

    if (responder) {
      responder(e);
      plugins.ResponderEventPlugin!.view!.event = null;
    }
  }

  if (isEndish(definition)) {
    const view = getCurrentView();

    if (view != null) {
      const { onResponderRelease, onResponderEnd } = view.props;

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

function eventListener(e: Event) {
  if (!plugins.ResponderEventPlugin) return;

  const result = plugins.ResponderEventPlugin.extractEvents(e.type, {}, e, e.target as HTMLElement);

  if (result == null) {
    return;
  }

  const { nativeEvent } = result;

  const { eventPath, eventPathReverse } = getEventPaths(nativeEvent);
  const checkers = getCheckers(nativeEvent.type, eventPath as HTMLElement[], eventPathReverse as HTMLElement[]);

  executeResponder(nativeEvent, checkers);
}

interface IResponderEventPlugin {
  view: {
    dom: HTMLElement;
    event: {
      responder: ((e: IEvent) => void) | undefined;
      type: string;
    } | null;
    props: IProps;
  } | null;
  extractEvents: (
    eventType: string,
    targetInst: IProps,
    nativeEvent: Event,
    nativeEventTarget: HTMLElement
  ) => { nativeEvent: IEvent };
  eventTypes: any;
}

export const ResponderEventPlugin: IResponderEventPlugin = {
  view: null,
  extractEvents: (eventType: string, props: IProps, nativeEvent: Event, nativeEventTarget: HTMLElement) => {
    return {
      nativeEvent: nativeEvent as IEvent,
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

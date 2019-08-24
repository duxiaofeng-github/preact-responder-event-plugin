import Preact, { VNode } from "preact";

const options = Preact.options;

let root: VNode;

const oldRootHook = (options as any)._root;

// TODO: fix hack
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

// TODO: fix hack
(options as any)._commit = (node: VNode) => {
  if (root && plugins.ResponderEventPlugin) {
    const vnodes = [root];

    while (vnodes.length) {
      const vnode = vnodes.pop();

      // it's a real vnode reflect to the dom
      if (typeof (vnode as any).type === "string") {
        (vnode as any)._dom._vnode = vnode; // TODO: fix hack
      }

      for (let child of (vnode as any)._children) {
        if (child != null) {
          vnodes.push(child);
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
const startNegotiatorKeys = ["onStartShouldSetResponderCapture", "onStartShouldSetResponder"];
const moveNegotiatorKeys = [
  "onMoveShouldSetResponderCapture",
  "onSelectionChangeShouldSetResponderCapture",
  "onMoveShouldSetResponder",
  "onSelectionChangeShouldSetResponder",
];
const scrollNegotiatorKeys = ["onScrollShouldSetResponderCapture", "onScrollShouldSetResponder"];
const startDefinition = getEventDefinition(startNegotiatorKeys, startResponderKey, ProcessType.start);
const moveDefinition = getEventDefinition(moveNegotiatorKeys, moveResponderKey, ProcessType.move);
const scrollDefinition = getEventDefinition(scrollNegotiatorKeys, moveResponderKey, ProcessType.move);
const endDefinition = getEventDefinition(null, endResponderKey, ProcessType.end);

interface IDefinition {
  negotiatorKeys: string[];
  responderKey: string;
  process: ProcessType;
}

interface IResponderEventEvents {
  touchstart: IDefinition;
  mousedown: IDefinition;
  touchmove: IDefinition;
  mousemove: IDefinition;
  selectionchange: IDefinition;
  scroll: IDefinition;
  touchend: IDefinition;
  mouseup: IDefinition;
}

const responderEventEvents: IResponderEventEvents = {
  touchstart: startDefinition,
  mousedown: startDefinition,
  touchmove: moveDefinition,
  mousemove: moveDefinition,
  selectionchange: moveDefinition,
  scroll: scrollDefinition,
  touchend: endDefinition,
  mouseup: endDefinition,
};

function getEventDefinition(negotiatorKeys: string[], responderKey: string, process: ProcessType) {
  return { negotiatorKeys, responderKey, process };
}

function addEventListenerToDocument() {
  for (let event in responderEventEvents) {
    document.addEventListener(event, eventListener);
  }
}

function removeEventListenerToDocument() {
  for (let event in responderEventEvents) {
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

interface INegotiators {
  onMoveShouldSetResponderCapture?: (e: IEvent) => boolean;
  onSelectionChangeShouldSetResponderCapture?: (e: IEvent) => boolean;
  onMoveShouldSetResponder?: (e: IEvent) => boolean;
  onSelectionChangeShouldSetResponder?: (e: IEvent) => boolean;
  onStartShouldSetResponderCapture?: (e: IEvent) => boolean;
  onStartShouldSetResponder?: (e: IEvent) => boolean;
  onScrollShouldSetResponderCapture?: (e: IEvent) => boolean;
  onScrollShouldSetResponder?: (e: IEvent) => boolean;
}

interface IResponders {
  onResponderStart?: (e: IEvent) => void;
  onResponderMove?: (e: IEvent) => void;
  onResponderEnd?: (e: IEvent) => void;
}

interface IProcessors {
  onResponderTerminationRequest?: (e: IEvent) => boolean;
  onResponderTerminate?: (e: IEvent) => void;
  onResponderGrant?: (e: IEvent) => void;
  onResponderReject?: (e: IEvent) => void;
  onResponderRelease?: (e: IEvent) => void;
}

type IProps = INegotiators & IResponders & IProcessors;

interface INegotiatorWrapper {
  isCapture: boolean;
  negotiator: (e: IEvent) => boolean;
  props: IProps;
}

type IEvent = TouchEvent;

function getNegotiatorsWithPropsByEventPath(negotiatorKey: string, eventPath: HTMLElement[], isCapture: boolean) {
  const negotiators: INegotiatorWrapper[] = [];

  for (let ele of eventPath) {
    const vnode = (ele as any)._vnode;

    if (vnode != null) {
      if (typeof vnode.props === "object") {
        const negotiator = vnode.props[negotiatorKey];
        if (negotiator != null) {
          negotiators.push({
            isCapture,
            negotiator,
            props: vnode.props as IProps,
          });
        }
      }
    }
  }

  return negotiators;
}

function getNegotiators(eventType: string, eventPath: HTMLElement[], eventPathReverse: HTMLElement[]) {
  const responderEvent = responderEventEvents[eventType];
  const negotiatorKeys = responderEvent.negotiatorKeys;
  const negotiators: INegotiatorWrapper[] = [];

  for (let key of negotiatorKeys) {
    // invoke negotiate capture from root
    if (key.indexOf("Capture") > -1) {
      negotiators.push(...getNegotiatorsWithPropsByEventPath(key, eventPathReverse, true));
    } else {
      negotiators.push(...getNegotiatorsWithPropsByEventPath(key, eventPath, false));
    }
  }

  return negotiators;
}

function getEventPaths(e: IEvent) {
  const eventPath = e.composedPath != null ? e.composedPath() : getEventPath(e);
  const eventPathReverse = eventPath.concat([]).reverse();
  return { eventPath, eventPathReverse };
}

function setCurrentResponder(e: IEvent, responderEvent: IDefinition, props: IProps) {
  plugins.ResponderEventPlugin.current = {
    responder: props[responderEvent.responderKey],
    eventType: e.type,
    responderEvent,
    props,
  };
}

function handleResponderTransferRequest(e: IEvent, responderEvent: IDefinition, props: IProps) {
  const { onResponderTerminationRequest, onResponderTerminate } = plugins.ResponderEventPlugin.current.props;
  const { onResponderGrant, onResponderReject } = props;

  if (onResponderTerminationRequest) {
    const allowTransfer = onResponderTerminationRequest(e);

    if (allowTransfer) {
      if (onResponderGrant) onResponderGrant(e);
      if (onResponderTerminate) onResponderTerminate(e);
      setCurrentResponder(e, responderEvent, props);
    } else {
      if (onResponderReject) onResponderReject(e);
    }
  } else {
    if (onResponderGrant) onResponderGrant(e);
    if (onResponderTerminate) onResponderTerminate(e);
    setCurrentResponder(e, responderEvent, props);
  }
}

function handleActiveTouches(e: IEvent) {
  ResponderTouchHistoryStore.touchHistory.numberActiveTouches = e.touches.length;
}

function isStartish(responderEvent: IDefinition) {
  return responderEvent.process === ProcessType.start;
}

function isMoveish(responderEvent: IDefinition) {
  return responderEvent.process === ProcessType.move;
}

function isEndish(responderEvent: IDefinition) {
  return responderEvent.process === ProcessType.end;
}

function executeResponder(e: IEvent, negotiators: INegotiatorWrapper[]) {
  const responderEvent: IDefinition = responderEventEvents[e.type];

  handleActiveTouches(e);

  if (isStartish(responderEvent) || isMoveish(responderEvent)) {
    for (let item of negotiators) {
      e = { ...e, bubbles: !item.isCapture };
      const requireToBeResponder = item.negotiator(e);

      if (requireToBeResponder) {
        if (plugins.ResponderEventPlugin.current == null) {
          setCurrentResponder(e, responderEvent, item.props);
        } else {
          if (
            // transfer responder from starting to moving or from moving to starting
            // on destop you can move a mouse and then click
            plugins.ResponderEventPlugin.current.responderEvent.process !== responderEvent.process
          ) {
            setCurrentResponder(e, responderEvent, item.props);
          } else {
            handleResponderTransferRequest(e, responderEvent, item.props);
          }
        }
      }
    }
  }

  plugins.ResponderEventPlugin.current.responder(e);

  if (isEndish(responderEvent)) {
    if (ResponderTouchHistoryStore.touchHistory.numberActiveTouches === 0) {
      const { onResponderRelease } = plugins.ResponderEventPlugin.current.props;

      if (onResponderRelease) {
        onResponderRelease(e);
      }

      plugins.ResponderEventPlugin.current.responder = null;
    }
  }
}

function eventListener(e: IEvent) {
  if (!plugins.ResponderEventPlugin) return;

  const { nativeEvent } = plugins.ResponderEventPlugin.extractEvents(e.type, null, e, e.target as HTMLElement);

  const { eventPath, eventPathReverse } = getEventPaths(nativeEvent);
  const negotiators = getNegotiators(nativeEvent.type, eventPath as HTMLElement[], eventPathReverse as HTMLElement[]);

  executeResponder(nativeEvent, negotiators);
}

interface IResponderEventPlugin {
  current: {
    responder: (e: IEvent) => void;
    eventType: string;
    responderEvent: IDefinition;
    props: IProps;
  };
  extractEvents: (
    eventType: string,
    targetInst: IProps,
    nativeEvent: IEvent,
    nativeEventTarget: HTMLElement
  ) => { nativeEvent: IEvent };
  eventTypes: any;
}

export const ResponderEventPlugin: IResponderEventPlugin = {
  current: null,
  extractEvents: (eventType: string, props: IProps, nativeEvent: IEvent, nativeEventTarget: HTMLElement) => {
    return {
      nativeEvent,
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

let plugins: {
  ResponderEventPlugin?: IResponderEventPlugin;
} = {};

export const injectEventPluginsByName = (injectedPlugins) => {
  plugins = Object.assign({}, plugins, injectedPlugins);
};

export default {
  injectEventPluginsByName,
  ResponderEventPlugin,
  ResponderTouchHistoryStore,
};

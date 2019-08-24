declare enum ProcessType {
    start = 0,
    move = 1,
    end = 2
}
interface IDefinition {
    negotiatorKeys: string[];
    responderKey: string;
    process: ProcessType;
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
declare type IProps = INegotiators & IResponders & IProcessors;
declare type IEvent = TouchEvent;
interface IResponderEventPlugin {
    current: {
        responder: (e: IEvent) => void;
        eventType: string;
        responderEvent: IDefinition;
        props: IProps;
    };
    extractEvents: (eventType: string, targetInst: IProps, nativeEvent: IEvent, nativeEventTarget: HTMLElement) => {
        nativeEvent: IEvent;
    };
    eventTypes: any;
}
export declare const ResponderEventPlugin: IResponderEventPlugin;
export declare const ResponderTouchHistoryStore: {
    touchHistory: {
        numberActiveTouches: number;
    };
};
export declare const injectEventPluginsByName: (injectedPlugins: any) => void;
declare const _default: {
    injectEventPluginsByName: (injectedPlugins: any) => void;
    ResponderEventPlugin: IResponderEventPlugin;
    ResponderTouchHistoryStore: {
        touchHistory: {
            numberActiveTouches: number;
        };
    };
};
export default _default;

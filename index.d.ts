declare type IChecker = (e: IEvent) => boolean;
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
declare type IProps = ICheckers & IResponders & IProcessors;
declare type IEvent = TouchEvent;
interface IResponderEventPlugin {
    view: {
        dom: HTMLElement;
        event: {
            responder: ((e: IEvent) => void) | undefined;
            type: string;
        } | null;
        props: IProps;
    } | null;
    extractEvents: (eventType: string, targetInst: IProps, nativeEvent: Event, nativeEventTarget: HTMLElement) => {
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
interface IPlugins {
    ResponderEventPlugin?: IResponderEventPlugin;
}
export declare const injectEventPluginsByName: (injectedPlugins: IPlugins) => void;
declare const _default: {
    injectEventPluginsByName: (injectedPlugins: IPlugins) => void;
    ResponderEventPlugin: IResponderEventPlugin;
    ResponderTouchHistoryStore: {
        touchHistory: {
            numberActiveTouches: number;
        };
    };
};
export default _default;

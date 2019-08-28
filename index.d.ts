import { NativeTouchEvent } from "react-native";
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
interface IEvent extends UIEvent {
    nativeEvent: NativeTouchEvent;
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
    extractEvents: (eventType: string, targetInst: IProps, nativeEvent: Event, nativeEventTarget: HTMLElement) => {
        nativeEvent: NativeTouchEvent;
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

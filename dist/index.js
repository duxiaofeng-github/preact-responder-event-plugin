var n,e,r,o,t,u,p,i,c,f,l,v,s;import{options as a}from"preact";function d(n,e,r){return{prepCheckerKeys:n,prepResponderKey:e,prepProcess:r}}function m(){for(var n in c)document.addEventListener(n,A)}function h(){for(var n in c)document.removeEventListener(n,A)}function R(n){for(var e,r=[n.target],o=[n.target];o.length;)(e=o.pop().parentElement)&&(o.push(e),r.push(e));return r}function S(n,e,r){var o,t,u,p,i,c=[];for(o=0,t=e;o<t.length;o+=1)null!=(p=(u=t[o]).__v)&&"object"==typeof p.props&&null!=(i=p.props[n])&&c.push({prepChecker:i,prepProps:p.props,prepDom:u});return c}function y(n,e,r){var o,t,u,p=[];for(o=0,t=c[n].prepCheckerKeys;o<t.length;o+=1)(u=t[o]).indexOf("Capture")>-1?p.push.apply(p,S(u,r)):p.push.apply(p,S(u,e));return p}function E(n){var e=n.path||(null!=n.composedPath?n.composedPath():R(n)),r=e.concat([]).reverse();return{p:e,pr:r}}function C(n,e,r){var o=r[e],t=k();t.prepView&&(t.prepView.prepEvent={prepResponder:o,prepType:n.type})}function P(n,e,r,o){var t,u=r[e];k().prepView={prepEvent:{prepResponder:u,prepType:n.type},prepProps:r,prepDom:o},(t=r.onResponderGrant)&&t(n)}function T(n,e,r,o){var t=x().prepProps,u=t.onResponderTerminate,p=t.onResponderTerminationRequest,i=r.onResponderReject;p?p(n)?(P(n,e.prepResponderKey,r,o),u&&u(n)):i&&i(n):(P(n,e.prepResponderKey,r,o),u&&u(n))}function b(n){l.touchHistory.numberActiveTouches=n.nativeEvent.touches.length}function M(n){return n.prepProcess===o.start}function g(n){return n.prepProcess===o.move}function j(n){return n.prepProcess===o.end}function k(){return v.ResponderEventPlugin}function x(){var n=k();if(n)return n.prepView}function w(){var n=x();if(n)return n.prepEvent}function D(){var n=w();if(n)return n.prepResponder}function H(n,e){var r,o,t,u,p,i,f,v,s,a,d=c[n.type];if(b(n),M(d)||g(d)){for(r=0,o=e;r<o.length;r+=1)if((t=o[r]).prepChecker(n)){null==(u=x())?P(n,d.prepResponderKey,t.prepProps,t.prepDom):u.prepDom===t.prepDom?C(n,d.prepResponderKey,t.prepProps):T(n,d,t.prepProps,t.prepDom);break}(p=D())&&(p(n),k().prepView.prepEvent=null)}j(d)&&null!=(i=x())&&(v=(f=i.prepProps).onResponderRelease,(s=f.onResponderEnd)&&s(n),0===l.touchHistory.numberActiveTouches&&(v&&v(n),(a=k())&&(a.prepView=null)))}function K(){}function A(n){var e,r,o=k();o&&null!=(e=o.extractEvents(n.type,{},n,n.target))&&(n.nativeEvent=e.nativeEvent,n.persist=K,r=E(n),H(n,y(n.type,r.p,r.pr)))}e=a.__,a.__=function(r){null!=(n=r)?m():h(),e&&e.apply(null,arguments)},r=a.__c,a.__c=function(e){var o,t,u,p,i,c;if(n&&k())for(o=[n];o.length;)if("string"==typeof(t=o.pop()).type&&null!=(u=t.__e)&&(u.__v=t),null!=t.__k&&null!=t.__k.length)for(p=0,i=t.__k;p<i.length;p+=1)null!=(c=i[p])&&o.push(c);r&&r.apply(null,arguments)},function(n){n[n.start=0]="start",n[n.move=1]="move",n[n.end=2]="end"}(o||(o={})),t=["onMoveShouldSetResponderCapture","onMoveShouldSetResponder"],u=d(["onStartShouldSetResponderCapture","onStartShouldSetResponder"],"onResponderStart",o.start),p=d(t,"onResponderMove",o.move),i=d([],"onResponderEnd",o.end),c={touchstart:u,mousedown:u,touchmove:p,mousemove:p,touchend:i,mouseup:i},v={};export default{injectEventPluginsByName:s=function(n){v=Object.assign({},v,n)},ResponderEventPlugin:f={prepView:null,extractEvents:function(n,e,r,o){return{nativeEvent:r}},eventTypes:{responderMove:{dependencies:["touchmove","mousemove"]}}},ResponderTouchHistoryStore:l={touchHistory:{numberActiveTouches:0}}};export{f as ResponderEventPlugin,l as ResponderTouchHistoryStore,s as injectEventPluginsByName};
//# sourceMappingURL=index.js.map

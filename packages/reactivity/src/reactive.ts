import { mutableHandlers,readonlyHandler,shallowReadonlyHandler } from "./baseHandler";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
export function reactive(val) {
  return createObjectReactive(val,mutableHandlers);
}

export function readonly(val) {
  return createObjectReactive(val,readonlyHandler);
}
export function shallowReadonly(val) {
  return createObjectReactive(val,shallowReadonlyHandler);
}

export function isReadonly(val) {
  return !!val[ReactiveFlags.IS_READONLY]
}
export function isReactive(val) {
  return !!val[ReactiveFlags.IS_REACTIVE]
}

function createObjectReactive(val,handler){
  return new Proxy(val, handler);
}


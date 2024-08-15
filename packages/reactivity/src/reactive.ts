import { isObject } from "@mini-vue/shared";
import {
  mutableHandlers,
  readonlyHandler,
  shallowReadonlyHandler,
} from "./baseHandler";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
export function reactive(val) {
  return createReactiveObject(val, mutableHandlers);
}

export function readonly(val) {
  return createReactiveObject(val, readonlyHandler);
}
export function shallowReadonly(val) {
  return createReactiveObject(val, shallowReadonlyHandler);
}

export function isReadonly(val) {
  return !!val[ReactiveFlags.IS_READONLY];
}
export function isReactive(val) {
  return !!val[ReactiveFlags.IS_REACTIVE];
}

function createReactiveObject(val, handler) {
  if (!isObject(val)) {
    console.warn(`target ${val} 必须是一个对象`);
    return val;
  }
  return new Proxy(val, handler);
}

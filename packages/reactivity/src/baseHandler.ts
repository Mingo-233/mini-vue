import { extend, isObject } from "../../shared";
import { trigger, track } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

const Getter = createGetter();
const readonlyGetter = createGetter({
  isReadonly: true,
  isShallow: false,
});
const shallowReadonlyGetter = createGetter({
  isReadonly: true,
  isShallow: true,
})

const Setter = createSetter();
export function createGetter(
  option = {
    isReadonly: false,
    isShallow: false,
  }
) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_READONLY) {
      return option.isReadonly;
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !option.isReadonly;
    }
    const res = Reflect.get(target, key);
    if(option.isShallow ) return res
    if (isObject(res)) {
      return option.isReadonly ? readonly(res) : reactive(res);
    }
    if (!option.isReadonly) {
      //Note: 只读不会更改，所以也没有依赖收集的必要
      //Done: 依赖收集
      track(target, key);
    }
    return res;
  };
}

export function createSetter() {
  return function set(target, key, value) {
    // Note: 先set值，在拿新值去更新
    const res = Reflect.set(target, key, value);
    //Done: 触发更新
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get: Getter,
  set: Setter,
};

export const readonlyHandler = {
  get: readonlyGetter,
  set: function set(target, key, value) {
    console.warn(`set on key ${key} failed, because it is readonly`, target);
    return true;
  },
};

export const shallowReadonlyHandler = extend({}, readonlyHandler, {  get: shallowReadonlyGetter,})

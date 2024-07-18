import { trigger, track } from "./effect";

export function createGetter() {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    //Done: 依赖收集
    track(target, key);
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

export const baseHandler = {
  get: createGetter(),
  set: createSetter(),
};

export const readonlyHandler = {
  get: createGetter(),
  set: createSetter(),
};

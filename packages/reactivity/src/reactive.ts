import { trigger, track } from "./effect";
import { baseHandler } from "./baseHandler";
export function reactive(val) {
  return new Proxy(val, baseHandler);
}

export function readonly(val) {
  return new Proxy(val, {
    get(target, key) {
      //Done: 依赖收集
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      // Note: 先set值，在拿新值去更新
      const res = Reflect.set(target, key, value);
      //Done: 触发更新
      trigger(target, key);
      return res;
    },
  });
}

import { trigger, track } from "./effect";
export function reactive(val) {
  return new Proxy(val, {
    get(target, key) {
      const res = Reflect.get(target, key);
      //TODO: 依赖收集
      track(target, key);
      return res;
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      //TODO: 触发更新
      trigger(target, key);
      return res;
    },
  });
}

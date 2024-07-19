import { extend } from "../../shared/index";
const targetMap = new Map();
let activeEffect: any = null;
let shouldTrack = false;
class ReactiveEffect {
  private _fn;
  private isActive = true;
  public deps = [];
  public scheduler: null | (() => void) = null;
  public onStop: null | (() => void) = null;

  constructor(fn) {
    this._fn = fn;
  }
  run() {
    if (!this.isActive) {
      return this._fn();
    }
    // Note: 这里通过shouldTrack把收集范围框定起来，只有在effect中访问getter才会收集依赖
    shouldTrack = true;
    activeEffect = this;
    const r = this._fn();
    // 重置
    shouldTrack = false;
    return r;
  }
  stop() {
    cleanupEffect(this);
    this.onStop && this.onStop();
    this.isActive = false;
  }
}
export function effect(fn, option = {}) {
  const _effect = new ReactiveEffect(fn);
  extend(_effect, option);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  //Note: js中函数是头等 (first-class)对象，因为它们可以像任何其他对象一样具有属性和方法。
  runner.effect = _effect;
  return runner;
}
function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
}
export function stop(runner) {
  runner.effect.stop();
}
export function track(target, key) {
  if (!isTracking()) return;
  // Note: target -> key -> dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
}
export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;
  // dep里面存的实际就是reactiveEffect的实例
  dep.add(activeEffect);
  // 反向存储dep，用于后续clear
  activeEffect.deps.push(dep);
}
export function isTracking() {
  return shouldTrack && activeEffect !== null;
}
export function trigger(target, key) {
  let depsMap = targetMap.get(target);

  let deps = depsMap.get(key);
  triggerEffects(deps);
}
export function triggerEffects(deps) {
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

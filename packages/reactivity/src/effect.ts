const targetMap = new Map();
let activeEffect: any = null;
class ReactiveEffect {
  private _fn;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
}
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  return runner;
}

export function track(target, key) {
  // target -> key -> dep
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
  // dep里面存的实际就是reactiveEffect的实例
  dep.add(activeEffect);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);

  let deps = depsMap.get(key);

  for (const effect of deps) {
    effect.run();
  }
}

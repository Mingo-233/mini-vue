import { isObject, isSameValue } from "../../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value;
  private _rawValue;
  public __v_isRef = true;
  deps = new Set();
  constructor(value) {
    this._value = covert(value);
  }

  get value() {
    const r = this._value;
    if (isTracking()) {
      trackEffects(this.deps);
    }
    return r;
  }
  set value(v) {
    if (isSameValue(v, this._rawValue)) return;
    this._value = covert(v);
    this._rawValue = v;
    triggerEffects(this.deps);
  }
}

function covert(val) {
  return isObject(val) ? reactive(val) : val;
}

export function ref(val) {
  return new RefImpl(val);
}
export function isRef(val) {
  return !!val.__v_isRef;
}

export function unRef(val) {
  return isRef(val) ? val.value : val;
}

// 自动解包和自动设置ref.value
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}

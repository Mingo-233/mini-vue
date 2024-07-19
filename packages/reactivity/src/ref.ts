import { isObject, isSameValue } from "../../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value;
  private _rawValue;
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

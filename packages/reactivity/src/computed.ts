import { ReactiveEffect } from "./effect";

class computedRefImpl {
  private isDirty = true;
  private _value;
  private _effect;
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this.isDirty) {
        this.isDirty = true;
      }
    });
  }

  get value() {
    if (this.isDirty) {
      this._value = this._effect.run();
      this.isDirty = false;
    }
    return this._value;
  }
}

export function computed(getter) {
  return new computedRefImpl(getter);
}

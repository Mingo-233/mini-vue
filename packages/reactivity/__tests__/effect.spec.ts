import { reactive } from "../src/reactive";
import { effect, stop } from "../src/effect";

import { describe, it, expect,vi } from "vitest";

describe("effect", () => {
  it("effect track&trigger", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("effect return runner", () => {
    let num = 0;
    const runner = effect(() => {
      num = num + 1;
      return num;
    });
    expect(num).toBe(1);
    runner();
    expect(num).toBe(2);
  });
  it("effect stop", () => {
    let temp;
    const person = reactive({
      age: 10,
    });
    const runner = effect(() => {
      temp = person.age;
    });
    person.age = 12;
    expect(temp).toBe(12);
    stop(runner);
    // 停止后，响应式失效
    person.age = 13;
    expect(temp).toBe(12);

    // 被stop的effect仍然可以手动触发
    runner();
    expect(temp).toBe(13);
  });

  it("effect stop callback", () => {
    const obj = reactive({
      foo: 1,
    });
    let temp;
    const stopCb = vi.fn(()=>1)
    const runner = effect(() => {
      temp = obj.foo;
    }, {
      onStop:stopCb
    });

    stop(runner);
    expect(stopCb).toBeCalledTimes(1);
  });

  it("scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = vi.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run();
    // // should have run
    expect(dummy).toBe(2);
  });
});

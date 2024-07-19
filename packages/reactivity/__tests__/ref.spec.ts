import { describe, expect, it } from "vitest";
import { ref } from "../src/ref";
import { effect } from "../src/effect";
describe("ref", () => {
  it("ref .value", () => {
    // 1. ref可以正常取值，针对基本数据类型
    const count = ref(1);
    expect(count.value).toBe(1);
  });

  it("ref base reactive", () => {
    // 2. ref针对基本数据类型实现响应式
    const count = ref(1);
    let calls = 0;
    let dummy;

    effect(() => {
      calls++;
      dummy = count.value;
    });
    count.value = 2;
    expect(dummy).toBe(2);
    expect(calls).toBe(2);

    // input same value ,not call effect
    count.value = 2;
    expect(dummy).toBe(2);
    expect(calls).toBe(2);
  });

  it("ref object reactive", () => {
    // 3. ref针对复杂数据结构实现响应式
    const obj = ref({ foo: 1 });
    let dummy;
    expect(obj.value.foo).toBe(1);
    effect(() => {
      dummy = obj.value.foo;
    });
    obj.value.foo = 2;
    expect(dummy).toBe(2);
  });
});

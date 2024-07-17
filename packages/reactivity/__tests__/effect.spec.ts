import { reactive } from "../src/reactive";
import { effect } from "../src/effect";

import { describe, it, expect } from "vitest";

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
});

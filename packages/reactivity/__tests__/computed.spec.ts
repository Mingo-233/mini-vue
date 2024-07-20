import { describe, expect, it, vi } from "vitest";
import { reactive } from "../src";
import { computed } from "../src/computed";
describe("computed", () => {
  it("computed .value", () => {
    const user = reactive({
      age: 1,
    });

    const age = computed(() => {
      return user.age;
    });

    expect(age.value).toBe(1);
  });

  it.only("computed lazily", () => {
    const user = reactive({
      age: 1,
    });
    const getter = vi.fn(() => {
      return user.age;
    });
    const computedUserAge = computed(getter);
    // 懒执行，没有调用computedUserAge时，computed包裹的函数不会执行
    expect(getter).not.toHaveBeenCalled();
    expect(computedUserAge.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);
    // 依赖没有变化，重新访问computedUserAge，应该读取缓存值，不会执行函数
    computedUserAge.value;
    expect(getter).toHaveBeenCalledTimes(1);

    user.age = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // 依赖变化，重新访问computedUserAge，应该计算得到新值
    expect(computedUserAge.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    computedUserAge.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});

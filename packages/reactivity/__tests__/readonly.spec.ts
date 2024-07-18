import { describe, expect, it, vi } from "vitest";
import { readonly } from "../src/readonly";
describe("readonly", () => {
  it("readonly type", () => {
    //TODO: type判断
    const origin = {
      foo: 1,
    };
    const temp = readonly(origin);
    expect(temp.foo).toBe(1);
    expect(temp).not.toBe(origin);
  });

  //   it("should call warn when set",()=>{
  //     const temp = reactive({foo:1})
  //     console.warn = vi.fn()
  //     temp.foo++
  //     expect(console.warn).toHaveBeenCalled()
  //   })
});

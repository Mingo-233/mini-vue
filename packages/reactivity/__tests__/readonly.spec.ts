import { describe, expect, it, vi } from "vitest";
import { readonly,isReadonly } from "../src/reactive";
describe("readonly", () => {
  it("readonly type", () => {
    const origin = {
      foo: 1,
    };
    const temp = readonly(origin);
    expect(temp.foo).toBe(1);
    expect(temp).not.toBe(origin);
    expect(isReadonly(temp)).toBe(true);
  });

    it("should call warn when set",()=>{
      const temp = readonly({foo:1})
      console.warn = vi.fn()
      temp.foo++
      expect(console.warn).toHaveBeenCalled()
    })

    it("readonly nested",()=>{
      const origin = {
        foo:1,
        nested:{
          foo:2,
          nested:{
            foo:3
          }
        }
      }
      const temp = readonly(origin)
      expect(isReadonly(temp)).toBe(true)
      expect(isReadonly(temp.nested)).toBe(true)
      expect(isReadonly(temp.nested.nested)).toBe(true)

    })
});

import { describe, expect, it, vi } from "vitest";
import { isReadonly, shallowReadonly } from "../src/reactive";

describe("shallowReadonly", () => {
    it('nested',()=>{
        const origin= {foo:1,nested:{foo:2}}
        const temp =  shallowReadonly(origin)
        expect(temp).not.toBe(origin)
        expect(isReadonly(temp)).toBe(true)
        expect(isReadonly(temp.nested)).not.toBe(true)
    })

    it('should call warn when set',()=>{
        const temp = shallowReadonly({foo:1})
        console.warn = vi.fn()
        temp.foo++
        expect(console.warn).toHaveBeenCalled()
    })
    
})
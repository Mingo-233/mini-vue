import {reactive,isReactive} from '../src/reactive'
import {describe, it,expect} from 'vitest'


describe('reactive module',()=>{
    it('reactive get',()=>{
        const mockObj = {name:'zhangsan',age:10}
        const formData = reactive(mockObj)
        // toBe 检测对象引用地址是否相同 
        // toEqual 检测结构是否相同,递归比较
        expect(formData.name).toBe('zhangsan')
        expect(formData.age).toBe(10)
        expect(formData).not.toBe(mockObj)
        expect(isReactive(formData)).toBe(true)

    })
    it('reactive nested',()=>{
        const originObj =  {
            name:'zhangsan',
            age:10,
            nested:{
                name:'lisi',
                age:20,
                nested:{
                    name:'wangwu',
                    age:30
                }
            }
        }
        const  temp = reactive(originObj)
        expect(isReactive(temp)).toBe(true)
        expect(isReactive(temp.nested)).toBe(true)
        expect(isReactive(temp.nested.nested)).toBe(true)
    })
})
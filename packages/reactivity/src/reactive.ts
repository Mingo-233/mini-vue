
export function reactive(val){
    return new Proxy(val,{
        get(target,key){
            return Reflect.get(target,key)
        },
        set(target,key,value){
            return Reflect.set(target,key,value)
        }
    })
}
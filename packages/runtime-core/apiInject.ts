import { getCurrentInstance } from "./component";
export function inject(key, defaultVal?) {
  const instance: any = getCurrentInstance();
  if (instance) {
    let provides = instance.parent.provides;
    if (key in provides) {
      return provides[key];
    } else if (defaultVal) {
      if (typeof defaultVal === "function") {
        return defaultVal();
      } else {
        return defaultVal;
      }
    }
  }
}

export function provide(key, value) {
  const instance: any = getCurrentInstance();
  if (instance) {
    const { parent } = instance;
    //   Note: 因为在初始化组件实例的时候，会去继承父级的provides。 这个继承，赋值的就是父级上的provides这个对象的地址。
    //         所以这里如果等于，说明当前实例还没有自己的provides属性，需要重新创建一个provides对象来存储子组件自己的依赖项。
    //         确保子组件有独立的 provides 对象，避免污染和副作用
    if (parent.provides === instance.provides) {
      instance.provides = Object.create(parent.provides);
    }
    instance.provides[key] = value;
  }
}

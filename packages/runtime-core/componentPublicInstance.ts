import { hasOwn } from "../shared";

const publicPropertiesMap = {
  $el: function (i) {
    return i.vnode.el;
  },
};

export const PublicInstanceProxyHandlers = {
  get(instance, key) {
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) return publicGetter(instance);
  },
};

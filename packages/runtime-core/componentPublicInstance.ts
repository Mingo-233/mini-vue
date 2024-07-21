const publicPropertiesMap = {
  $el: function (i) {
    return i.vnode.el;
  },
};

export const PublicInstanceProxyHandlers = {
  get(instance, key) {
    const { setupState } = instance;
    if (setupState[key]) return setupState[key];

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) return publicGetter();
  },
};

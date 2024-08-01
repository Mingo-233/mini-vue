import { shallowReadonly } from "../reactivity/src/reactive";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";
import { proxyRefs } from "../reactivity/src";
let currentInstance = null;
export function createComponentInstance(vnode, parent) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    setupState: {},
    slots: {},
    emit: () => {},
    provides: parent ? parent.provides : {},
    parent: parent,
    isMounted: false,
    subTree: {},
    nextVnode: null,
  };
  instance.emit = emit.bind(null, instance) as any;
  return instance;
}
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const component = instance.type;

  const { setup } = component;
  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
    instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers);
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const component = instance.type;
  instance.render = component.render;
}
export function getCurrentInstance() {
  return currentInstance;
}
function setCurrentInstance(instance) {
  currentInstance = instance;
}

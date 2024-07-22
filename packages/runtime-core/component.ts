import { shallowReadonly } from "../reactivity/src/reactive";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { emit } from "./componentEmit";
export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    setupState: {},
    emit: () => {},
  };
  instance.emit = emit.bind(null, instance) as any;
  return instance;
}
export function setupComponent(instance) {
  // TODO:    initSlots
  initProps(instance, instance.vnode.props);
  initSlots();
  setupStatefulComponent(instance);
}

function initSlots() {}

function setupStatefulComponent(instance) {
  const component = instance.type;

  const { setup } = component;
  if (setup) {
    console.log("instance.props", instance.props);

    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    handleSetupResult(instance, setupResult);
    instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers);
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const component = instance.type;
  instance.render = component.render;
}

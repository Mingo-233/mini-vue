export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
  };

  return instance;
}
export function setupComponent(instance) {
  // TODO:   initProps initSlots
  initProps();
  initSlots();
  setupStatefulComponent(instance);
}

function initProps() {}

function initSlots() {}

function setupStatefulComponent(instance) {
  const component = instance.type;
  const { setup } = component;
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
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

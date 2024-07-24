import { createRenderer, createVNode } from "../runtime-core";
function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, value) {
  const isOn = (k: string) => /^on[A-Z]/.test(k);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, value);
  } else {
    el.setAttribute(key, value);
  }
}

function insert(container, el) {
  container.append(el);
}
const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
});
export function createApp(component) {
  const app = renderer.createApp(component);
  app.mount = (id) => {
    // TODO: normalizeContainer
    const rootContainer = document.querySelector(id);
    renderer.render(createVNode(component), rootContainer);
  };
  return app;
}

export * from "../runtime-core/index";
export * from "../reactivity/src/index";

import { createRenderer, createVNode } from "../runtime-core";
function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, oldValue, newValue) {
  const isOn = (k: string) => /^on[A-Z]/.test(k);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();

    el.addEventListener(event, newValue);
  } else {
    if (newValue === null || newValue === undefined) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, newValue);
    }
  }
}

function insert(container, el, anchor = null) {
  container.insertBefore(el, anchor);
}
function setElementText(node, text) {
  node.textContent = text;
}
function remove(el) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}
const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
  setElementText,
  remove,
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

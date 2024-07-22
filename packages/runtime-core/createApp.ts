import createVNode from "./vnode";
import { render } from "./render";
export function createApp(rootComponent) {
  const vnode = createVNode(rootComponent);

  function mount(rootContainer) {
    const dom = document.querySelector(rootContainer);
    render(vnode, dom);
  }
  return {
    mount,
  };
}

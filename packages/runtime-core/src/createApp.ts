import { createVNode } from "./vnode";

export function createAppApi(render) {
  return function createApp(rootComponent) {
    const vnode = createVNode(rootComponent);
    function mount(rootContainer) {
      render(vnode, rootContainer);
    }
    return {
      mount,
    };
  };
}

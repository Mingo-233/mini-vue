import { createVNode, Fragment } from "../vnode";
export function renderSlots(slots, slotName, params) {
  const slot = slots[slotName];
  if (slot && typeof slot === "function") {
    return createVNode(Fragment, {}, slot(params));
  }
}

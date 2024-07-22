import { createVNode } from "../vnode";
export function renderSlots(slots, slotName, params) {
  const slot = slots[slotName];
  if (slot && typeof slot === "function") {
    return createVNode("div", {}, slot(params));
  }
}

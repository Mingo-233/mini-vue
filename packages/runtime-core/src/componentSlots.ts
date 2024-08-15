import { ShapeFlags } from "@mini-vue/shared";
export function initSlots(instance, children) {
  const { vnode } = instance;
  if (ShapeFlags.SLOTS_CHILDREN & vnode.ShapeFlag) {
    normalizeObjectSlots(instance, children);
  }
}

function normalizeObjectSlots(instance, children) {
  for (const key in children) {
    let generateSlotFn = children[key];
    instance.slots[key] = (params) =>
      normalizeSlotValue(generateSlotFn(params));
    //   generateSlotFn(params);
  }
}

function normalizeSlotValue(value) {
  // 这里调用插槽函数，已经生成普通元素的节点内容，需要返回数组。如果还是返回对象，按逻辑仍然会识别为插槽节点
  return Array.isArray(value) ? value : [value];
}

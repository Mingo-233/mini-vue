import { ShapeFlags } from "../shared/shapeFlags";

export default function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    ShapeFlag:
      typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT,
    el: undefined,
  };

  if (typeof children === "string") {
    // 按位或赋值运算符
    vnode.ShapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.ShapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

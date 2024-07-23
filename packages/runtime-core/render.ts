import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;
  function render(vnode, container) {
    patch(vnode, container, null);
  }

  function patch(vnode, container, parent) {
    const { ShapeFlag, type } = vnode;
    switch (type) {
      case Text:
        processText(vnode, container);
        break;
      case Fragment:
        processFragment(vnode, container, parent);
        break;
      default:
        // 与运算符
        if (ShapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parent);
        } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parent);
        }
        break;
    }
  }
  function processText(vnode, container) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.append(el);
  }
  function processFragment(vnode, container, parent) {
    mountChildren(vnode, container, parent);
  }
  function processComponent(vnode, container, parent) {
    mountComponent(vnode, container, parent);
  }
  function mountElement(vnode, container, parent) {
    const el = hostCreateElement(vnode.type);
    vnode.el = el;
    const { children, ShapeFlag } = vnode;
    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = vnode.children;
    } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parent);
    }
    // props
    const { props } = vnode;

    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, val);
    }
    hostInsert(container, el);
  }
  function processElement(vnode, container, parent) {
    mountElement(vnode, container, parent);
  }

  function mountComponent(initialVNode, container, parent) {
    const instance = createComponentInstance(initialVNode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }
  function mountChildren(vnode, container, parent) {
    vnode.children.forEach((v) => {
      patch(v, container, parent);
    });
  }
  function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // Note: 当前实例作为下一个组件的父级
    patch(subTree, container, instance);
    // Note: 组件会找到一个真实dom内容的节点，作为它根元素。而这必须在patch之后，因为patch之后才会有el属性
    initialVNode.el = subTree.el;
  }
  return {
    createApp: createAppApi(render),
  };
}

import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";
import { effect } from "../reactivity/src";
import { isEmptyObject, EMPTY_OBJ } from "../shared";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;
  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  function patch(oldVnode, newVnode, container, parent) {
    const { ShapeFlag, type } = newVnode;
    switch (type) {
      case Text:
        processText(oldVnode, newVnode, container);
        break;
      case Fragment:
        processFragment(oldVnode, newVnode, container, parent);
        break;
      default:
        // 与运算符
        if (ShapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVnode, newVnode, container, parent);
        } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(oldVnode, newVnode, container, parent);
        }
        break;
    }
  }
  function processText(oldVnode, newVnode, container) {
    const el = document.createTextNode(newVnode.children);
    newVnode.el = el;
    container.append(el);
  }
  function processFragment(oldVnode, newVnode, container, parent) {
    mountChildren(newVnode, container, parent);
  }
  function processComponent(oldVnode, newVnode, container, parent) {
    mountComponent(newVnode, container, parent);
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
      hostPatchProp(el, key, null, val);
    }
    hostInsert(container, el);
  }
  function patchElement(oldVnode, newVnode) {
    console.log("updateElement");
    console.log("oldVnode", oldVnode);
    console.log("newVnode", newVnode);
    const oldProps = oldVnode.props || EMPTY_OBJ;
    const newProps = newVnode.props || EMPTY_OBJ;
    const el = (newVnode.el = oldVnode.el);
    patchProps(el, oldProps, newProps);
  }
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }
  function processElement(oldVnode, newVnode, container, parent) {
    if (!oldVnode) {
      mountElement(newVnode, container, parent);
    } else {
      patchElement(oldVnode, newVnode);
    }
  }

  function mountComponent(initialVNode, container, parent) {
    const instance = createComponentInstance(initialVNode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }
  function mountChildren(vnode, container, parent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parent);
    });
  }
  function setupRenderEffect(instance, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("mount");

        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        // Note: 当前实例作为下一个组件的父级
        patch(null, subTree, container, instance);
        // Note: 组件会找到一个真实dom内容的节点，作为它根元素。而这必须在patch之后，因为patch之后才会有el属性
        initialVNode.el = subTree.el;
        instance.subTree = subTree;
        instance.isMounted = true;
      } else {
        console.log("update");
        const { proxy } = instance;
        const oldSubTree = instance.subTree;
        const newSubTree = instance.render.call(proxy);
        instance.subTree = newSubTree;
        // Note: 当前实例作为下一个组件的父级
        patch(oldSubTree, newSubTree, container, instance);
      }
    });
  }
  return {
    createApp: createAppApi(render),
    render,
  };
}

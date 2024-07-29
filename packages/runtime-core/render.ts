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
    setElementText: hostSetElementText,
    remove: hostRemove,
  } = options;
  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  function patch(oldVnode, newVnode, container, parentComponent, anchor) {
    const { ShapeFlag, type } = newVnode;
    switch (type) {
      case Text:
        processText(oldVnode, newVnode, container);
        break;
      case Fragment:
        processFragment(oldVnode, newVnode, container, parentComponent, anchor);
        break;
      default:
        // 与运算符
        if (ShapeFlag & ShapeFlags.ELEMENT) {
          processElement(
            oldVnode,
            newVnode,
            container,
            parentComponent,
            anchor
          );
        } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(
            oldVnode,
            newVnode,
            container,
            parentComponent,
            anchor
          );
        }
        break;
    }
  }
  function processText(oldVnode, newVnode, container) {
    const el = document.createTextNode(newVnode.children);
    newVnode.el = el;
    container.append(el);
  }
  function processFragment(
    oldVnode,
    newVnode,
    container,
    parentComponent,
    anchor
  ) {
    mountChildren(newVnode.children, container, parentComponent, anchor);
  }
  function processComponent(
    oldVnode,
    newVnode,
    container,
    parentComponent,
    anchor
  ) {
    mountComponent(newVnode, container, parentComponent, anchor);
  }
  function mountElement(vnode, container, parentComponent, anchor) {
    const el = hostCreateElement(vnode.type);
    vnode.el = el;
    const { children, ShapeFlag } = vnode;
    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = vnode.children;
    } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }
    // props
    const { props } = vnode;

    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    hostInsert(container, el);
  }
  function patchElement(
    oldVnode,
    newVnode,
    container,
    parentComponent,
    anchor
  ) {
    console.log("updateElement");
    console.log("oldVnode", oldVnode);
    console.log("newVnode", newVnode);
    const oldProps = oldVnode.props || EMPTY_OBJ;
    const newProps = newVnode.props || EMPTY_OBJ;
    const el = (newVnode.el = oldVnode.el);
    patchChildren(oldVnode, newVnode, el, parentComponent, anchor);
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
  function patchChildren(
    oldVnode,
    newVnode,
    container,
    parentComponent,
    anchor
  ) {
    const { children: newChildren, ShapeFlag: newShapeFlag } = newVnode;
    const { children: oldChildren, ShapeFlag: oldShapeFlag } = oldVnode;

    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // TODO: oldShapeFlag ARRAY_CHILDREN
      // if(oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {}
      if (newChildren !== oldChildren) {
        hostSetElementText(container, newChildren);
      }
    } else {
      // 这里都是n2 为数组的情况
      console.log("oldShapeFlag", oldShapeFlag);
      if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(newChildren, container, parentComponent, anchor);
      } else {
        console.log("array children patch");
        patchKeyedChildren(
          oldChildren,
          newChildren,
          container,
          parentComponent,
          anchor
        );
      }
    }
  }
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor // 插入的参考节点
  ) {
    const l2 = c2.length;
    //   - `i`: 当前比较的起始索引，用于头部开始的对比。
    let i = 0;
    //   - `e1`: 旧节点数组（`c1`）的尾部索引，表示旧节点的结束位置。
    let e1 = c1.length - 1;
    //   - `e2`: 新节点数组（`c2`）的尾部索引，表示新节点的结束位置。
    let e2 = l2 - 1;

    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
    // 循环从头开始比较，直到遇到不同的节点为止。
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }
    // 循环从尾部开始比较，直到遇到不同的节点为止。
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    if (i > e1) {
      if (i <= e2) {
        // 有 anchor 的情况：新节点会被插入到 anchor 节点之前，这样可以保持节点顺序。
        // 无 anchor 的情况：新节点会被插入到容器的末尾。
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        console.log("e2", e2);
        console.log("anchor", anchor);

        while (i <= e2) {
          // 如果旧节点数组已经遍历完，但新节点数组还有剩余，则将剩余的新节点插入 DOM 中。
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        // 如果新节点数组已经遍历完，但旧节点数组还有剩余，则将剩余的旧节点从 DOM 中移除。
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      //   - `s1`: 中间部分旧节点的开始索引。
      //   - `s2`: 中间部分新节点的开始索引。
      let s1 = i;
      let s2 = i;

      // toBePatched：需要更新的新节点数量。
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      // keyToNewIndexMap：映射新节点的 key 到其索引。
      const keyToNewIndexMap = new Map();
      // newIndexToOldIndexMap：映射新旧节点的索引关系，用于确定节点是否需要移动。
      const newIndexToOldIndexMap = new Array(toBePatched);
      // moved：标记是否有节点需要移动。
      let moved = false;
      // maxNewIndexSoFar：记录遍历过程中遇到的最大新节点索引，用于判断是否有节点移动。

      let maxNewIndexSoFar = 0;
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;

              break;
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }
  function processElement(
    oldVnode,
    newVnode,
    container,
    parentComponent,
    anchor
  ) {
    if (!oldVnode) {
      mountElement(newVnode, container, parentComponent, anchor);
    } else {
      patchElement(oldVnode, newVnode, container, parentComponent, anchor);
    }
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }
  function setupRenderEffect(instance, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("mount");

        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        // Note: 当前实例作为下一个组件的父级
        patch(null, subTree, container, instance, anchor);
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
        patch(oldSubTree, newSubTree, container, instance, anchor);
      }
    });
  }

  // getSequence：计算最长递增子序列，用于确定哪些节点可以不移动。
  function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = (u + v) >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p[v];
    }
    return result;
  }

  return {
    createApp: createAppApi(render),
    render,
  };
}

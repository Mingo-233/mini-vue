import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";
import { effect } from "../reactivity/src";
import { isEmptyObject, EMPTY_OBJ } from "../shared";
import { shouldUpdateComponent } from "./componentUpdateUtils";

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
    if (!oldVnode) {
      mountComponent(newVnode, container, parentComponent, anchor);
    } else {
      updateComponent(oldVnode, newVnode);
    }
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

    hostInsert(container, el, anchor);
  }
  function updateComponent(oldVnode, newVnode) {
    const instance = (newVnode.component = oldVnode.component);

    if (shouldUpdateComponent(oldVnode, newVnode)) {
      instance.nextVnode = newVnode;
      instance.update();
      console.warn("m1-", "updateComponent");
    } else {
      // 这里同步的原因
      // 如果 vnode 没有更新，当后续更新发生时，组件实例会持有一个过时的 vnode，这可能会导致渲染逻辑错误。
      newVnode.el = oldVnode.el;
      instance.vnode = newVnode;
    }
  }
  function updateElement(
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
    const l1 = c1.length;
    const l2 = c2.length;
    let i = 0;
    let e1 = l1 - 1;
    let e2 = l2 - 1;
    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
    // 左侧比较
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

    // 右侧比较
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

    // 新的比老的长-新增
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        ///Note:  这里e2一定是比e1大，e2+1，就是当前索引i的后面一个节点。
        //  如果这个节点存在（即小于l2这个总长度）,那么插入的参考节点就是后面这个节点
        //  如果这个节点不存在，说明当前节点就是新节点中的最后一个节点了
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          const newNode = c2[i];
          patch(null, newNode, container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 老的比新的长-删除
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      //   s1 中间部分旧节点的开始索引。
      //   s2 中间部分新节点的开始索引。
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = new Map();
      // 建立hashMap，存储新节点，后面在节点绑定了key的情况用于快速判断老节点在新节点中是否存在
      for (let i = s2; i <= e2; i++) {
        const nextNode = c2[i];
        keyToNewIndexMap.set(nextNode.key, i);
      }
      // 需要更新的新节点数
      let toBePatched = e2 - s2 + 1;
      // 当前已经处理更新的数量
      let patched = 0;
      // 是否需要移动标记
      let moved = false;
      // 保持最大升序序列的索引，用于判断 移动标记是否发生变化
      let maxNewIndexSoFar = 0;
      // 新老索引的映射表,数组的索引为新节点的索引，value为这个同节点在老节点c1中的的索引
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      // 遍历老节点
      // 1. 需要找出老节点有，而新节点没有的 -> 需要把这个节点删除掉
      // 2. 新老节点都有的，—> 需要 patch
      for (let i = s1; i <= e1; i++) {
        const preNode = c1[i];
        // 如果老的节点大于新节点的数量的话，那么这里在处理老节点的时候就直接删除即可
        if (patched >= toBePatched) {
          hostRemove(preNode.el);
          container;
        }
        // 在新节点中存在同样值的索引值
        let newIndex: any = undefined;
        // key 存在就可以从map中去找。时间复杂度是o(1)
        if (preNode.key) {
          newIndex = keyToNewIndexMap.get(preNode.key);
        } else {
          // 如果不存在，只能重新遍历。 时间复杂度是o(n)
          for (let j = s2; j <= e2; j++) {
            const nextNode = c2[j];
            if (isSomeVNodeType(preNode, nextNode)) {
              newIndex = j;
              break;
            }
          }
        }

        // 说明在新节点中没有找到值一样的老节点，则将老节点删除
        if (newIndex! === undefined) {
          hostRemove(preNode.el);
        } else {
          // 新老节点都存在
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          // 新的 newIndex 如果一直是升序的话，那么就说明没有移动
          // 所以我们可以记录最后一个节点在新的里面的索引，然后看看是不是升序的
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(preNode, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      // example:increasingNewIndexSequence【1,2】 toBePatched = 2
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      // 最长递增子序列的索引
      let sequenceIndex = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextNode = c2[nextIndex];
        // 判断这个新增节点后面还有没有节点，如果有的话，就插入到这个节点的前面，如果没有的话，就插入到最后
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        // 说明节点在旧的节点中不存在，所以是新增节点
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextNode, container, parentComponent, anchor);
        } else if (moved) {
          // 需要移动
          // 1. sequenceIndex 已经没有了 说明剩下的都需要移动了
          // 2. increasingNewIndexSequence[sequenceIndex] !== i 说明当前的索引不在最长递增子序列中，需要移动
          if (
            sequenceIndex < 0 ||
            increasingNewIndexSequence[sequenceIndex] !== i
          ) {
            console.log("move");
            hostInsert(container, nextNode.el, anchor);
          } else {
            // 走到这一步说明，当前新节点的索引顺序和稳定序列中一致，命中了，则保持不动，继续下一步
            sequenceIndex--;
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
      updateElement(oldVnode, newVnode, container, parentComponent, anchor);
    }
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    initialVNode.component = instance;
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }
  function setupRenderEffect(instance, initialVNode, container, anchor) {
    instance.update = effect(() => {
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
        const { proxy, nextVnode } = instance;
        if (nextVnode) {
          // 这步el赋值感觉不做也没有影响，后面的patch的时候也会把旧的el赋值给新的vnode
          instance.el = nextVnode.el;
          updateComponentPreRender(instance, nextVnode);
        }
        const oldSubTree = instance.subTree;
        const newSubTree = instance.render.call(proxy);
        instance.subTree = newSubTree;
        // Note: 当前实例作为下一个组件的父级
        patch(oldSubTree, newSubTree, container, instance, anchor);
      }
    });
  }
  function updateComponentPreRender(instance, nextVnode) {
    instance.vnode = nextVnode;
    instance.nextVnode = null;
    instance.props = nextVnode.props;
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

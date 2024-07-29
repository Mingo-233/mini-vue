// 1. 头尾的对比只是为了尽快缩小需要进一步处理的范围pa
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

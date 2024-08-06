import { NodeTypes } from "../ast";
import { isText } from "../utils";

export function transformText(node) {
  return () => {
    // 把 普通文字内容和合并，例如文字+插值
    if (node.type === NodeTypes.ELEMENT) {
      // 容器存储
      let currentContainer;
      // 循环children
      let child = node.children;
      for (let i = 0; i < child.length; i++) {
        const node = child[0];
        // 当前节点是否是文字

        if (isText(node)) {
          for (let j = i + 1; j < child.length; j++) {
            const nextNode = child[j];
            // 下一个节点是否是文字
            if (isText(nextNode)) {
              if (!currentContainer) {
                // 初始化容器 - 类型为复合节点

                currentContainer = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [node],
                };
                // 和ast节点关联上
                child[i] = currentContainer;
              }
              // 进行拼接
              currentContainer.children.push("+");
              currentContainer.children.push(nextNode);
              // 在原数组中移除掉刚拼接的一项
              child.splice(j, 1);
              // 因为移除了一项，索引减1，如果不变化，那么后面前移的一项会丢失
              j--;
            } else {
              // 如果不是文字 直接结束循环
              currentContainer = undefined;
              break;
            }
          }
        }
      }
    }
  };
}

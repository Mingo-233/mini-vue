import { NodeTypes } from "../ast";

export function transformExpression(node) {
  // 处理插值表达式的content值
  if (node.type === NodeTypes.INTERPOLATION) {
    // 去处理 插值的content内容
    console.log("_ctx_ctx_ctx");

    node.content = processExpression(node.content);
  }
}

function processExpression(node) {
  node.content = `_ctx.${node.content}`;
  return node;
}

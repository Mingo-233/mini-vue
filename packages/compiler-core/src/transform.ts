export function transform(ast, options) {
  // 1 深度优先搜索找到目标节点
  // 2 通过外界传入行为，处理修改节点数据
  const context = createTransformContext(ast, options);
  traverseNode(ast, context);
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}

function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const fn = nodeTransforms[i];
    fn(node);
  }
  traverseChildren(node, context);
}
function traverseChildren(node, context) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      traverseNode(child, context);
    }
  }
}

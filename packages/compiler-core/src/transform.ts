import { TO_DISPLAY_STRING } from "./runtimeHelpers";
import { NodeTypes } from "./ast";
export function transform(ast, options = {}) {
  // 1 深度优先搜索找到目标节点
  // 2 通过外界传入行为，处理修改节点数据
  const context = createTransformContext(ast, options);
  traverseNode(ast, context);
  // 生成codeGenNode属性，供generate code 的时候入口
  createRootCodeGen(ast);
  ast.helpers = [...context.helpers.keys()];
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    addHelper: function (key) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}

function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms;
  const exitsFns: any[] = [];
  for (let i = 0; i < nodeTransforms.length; i++) {
    const fn = nodeTransforms[i];
    const exitsFn = fn(node, context);
    exitsFn && exitsFns.push(exitsFn);
  }
  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      context.addHelper(TO_DISPLAY_STRING);
      break;

    default:
      break;
  }
  let len = exitsFns.length;
  while (len--) {
    exitsFns[len]();
  }
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

function createRootCodeGen(root) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codeGenNode = child.codeGenNode;
  } else {
    root.codeGenNode = root.children[0];
  }
}

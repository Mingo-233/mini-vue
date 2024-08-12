import {
  TO_DISPLAY_STRING,
  CREATE_ELEMENT_VNODE,
  helperMapName,
} from "./runtimeHelpers";
import { NodeTypes } from "./ast";
import { isString } from "../../shared";

export function generate(ast) {
  // 创建上下文
  const context = createCodeGenContext();
  const { push } = context;
  genFunctionPreamble(ast, context);

  // 定义函数名
  const functionName = "render";
  // 定义参数签名
  const args = ["_ctx", "_cache"];
  const signature = args.join(",");
  push(`function ${functionName}(${signature}) {`);

  push(`return `);
  // 拼接代码内容
  genNode(ast.codeGenNode, context);
  push(`}`);

  return {
    code: context.code,
  };
}
function genFunctionPreamble(ast, context) {
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
  if (ast.helpers.length) {
    push(`const {${ast.helpers.map(aliasHelper).join(",")}} = ${VueBinging}`);
  }
  push(`\n`);

  push(`return `);
}

function createCodeGenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };

  return context;
}
function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;

    default:
      break;
  }
}
function genCompoundExpression(node, context) {
  const { push } = context;
  const child = node.children;
  for (let i = 0; i < child.length; i++) {
    const node = child[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }
  }
}
function genElement(node, context) {
  //example: <div>123</div> -> _createElementVnode('div','null',123)
  const { push, helper } = context;
  const { tag, props, children } = node;
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullable([tag, props, children]), context);
  push(`)`);
}
function genNodeList(nodes, context) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }
    // 参数位之间分割，最后一位的时候不用加，所以-1
    if (i < nodes.length - 1) {
      push(",");
    }
  }
}
function genNullable(arr) {
  return arr.map((item) => item || "null");
}
function genText(node, context) {
  const { push } = context;
  push(`'${node.content}'`);
}

function genInterpolation(node, context) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  // 去解析插值的content内容，即{{}}里面的内容
  genNode(node.content, context);
  push(`)`);
}

function genExpression(node, context) {
  const { push } = context;
  push(`${node.content}`);
}

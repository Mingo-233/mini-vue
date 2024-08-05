import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";
import { NodeTypes } from "./ast";

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
  //   push(`\n`);

  push(`return `);
  // 拼接代码内容
  genNode(ast.codeGenNode, context);
  //   push(`\n`);
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
    push(
      `const {${ast.helpers.map(aliasHelper).join(",")}} from ${VueBinging}`
    );
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
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;

    default:
      break;
  }
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

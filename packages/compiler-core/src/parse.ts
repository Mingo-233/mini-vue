// baseParse 函数是解析模板的入口函数，接收模板内容字符串作为参数。

import { NodeTypes } from "./ast";
const enum TagType {
  Start,
  End,
}
export function baseParse(content: string) {
  const context = createParserContext(content);
  const children = parseChildren(context);
  return createRoot(children);
}

function parseChildren(context) {
  const nodes: any[] = [];
  const source = context.source;
  let node;
  if (source.startsWith("{{")) {
    node = parseInterpolation(context);
    nodes.push(node);
  } else if (source[0] === "<") {
    if (/[a-z]/i.test(source[1])) {
      node = parseElement(context);
      nodes.push(node);
    }
  }
  if (!node) {
    node = parseText(context);
    nodes.push(node);
  }
  return nodes;
}
function parseElement(context) {
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);
  return element;
}
function parseText(context) {
  const length = context.source.length;
  const content = parseTextData(context, length);
  return {
    type: NodeTypes.TEXT,
    content: content,
  };
}
function parseTextData(context, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}
function parseTag(context, type: TagType) {
  // <div></div>
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  //   ['<div', 'div', index: 0, input: '<div></div>', groups: undefined]
  const tag = match[1]; // 提取标签名。
  // 前进解析上下文，跳过匹配的部分。
  advanceBy(context, match[0].length);
  // 跳过 '>' 字符。
  advanceBy(context, 1);
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
}
function parseInterpolation(context) {
  const openDelimiter = "{{"; // 插值表达式的起始定界符。
  const closeDelimiter = "}}"; // 插值表达式的结束定界符。
  // 查找插值表达式结束定界符的位置。
  const closeIndex = context.source.indexOf(closeDelimiter);
  // 跳过起始定界符。
  advanceBy(context, openDelimiter.length);
  // 计算原始内容的长度。
  const rawContentLength = closeIndex - openDelimiter.length;

  // 提取原始内容。
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();
  // 返回解析后的插值节点。
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
// advanceBy 函数用于前进解析上下文的指针。
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}
// createParserContext 函数创建解析上下文。
function createParserContext(content: string) {
  return {
    source: content,
  };
}

// createRoot 函数创建根节点。
function createRoot(children) {
  return {
    children,
  };
}

// baseParse 函数是解析模板的入口函数，接收模板内容字符串作为参数。

import { NodeTypes } from "./ast";
const enum TagType {
  Start,
  End,
}
export function baseParse(content: string) {
  const context = createParserContext(content);
  const children = parseChildren(context, []);
  return createRoot(children);
}

function parseChildren(context, ancestors) {
  const nodes: any[] = [];
  while (!isEnd(context, ancestors)) {
    const source = context.source;
    let node;
    if (source.startsWith("{{")) {
      node = parseInterpolation(context);
      nodes.push(node);
    } else if (source[0] === "<") {
      if (/[a-z]/i.test(source[1])) {
        node = parseElement(context, ancestors);
        nodes.push(node);
      }
    }
    if (!node) {
      node = parseText(context);
      nodes.push(node);
    }
  }

  return nodes;
}
function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  console.log("element", element);
  console.log("context.source", context.source);

  if (isStartsWithEndTag(context.source, element.tag)) {
    // 消费结束标签
    parseTag(context, TagType.End);
  } else {
    throw Error(`缺少结束标签:${element.tag}`);
  }

  return element;
}
function parseText(context) {
  // example: 'hi,{{message}}</div>' 解析到这种情况的时候，应该取的是'hi,'
  let endIndex = context.source.length;
  const endTokens = ["{{", "<"];
  for (let i = 0; i < endTokens.length; i++) {
    const endI = context.source.indexOf(endTokens[i]);
    if (endI !== -1 && endIndex > endI) {
      endIndex = endI;
    }
  }
  const content = parseTextData(context, endIndex);
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
  if (type === TagType.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
    children: [],
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
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();
  advanceBy(context, closeDelimiter.length);
  // 返回解析后的插值节点。
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
function isEnd(context, ancestors) {
  const s = context.source;
  // 1.判断是否是结束标签
  if (s.startsWith("</")) {
    // Note: 这里为什么用数组去循环找，就是为了找到一个结束标签，保证一定能退出外层的while循环
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (isStartsWithEndTag(s, tag)) {
        return true;
      }
    }
  }
  // 2.source是否存存在
  return !s;
}
// 判断当前这个结束标签和前序的开始标签是否一致
function isStartsWithEndTag(source, tag) {
  return source.startsWith(`</`) && source.slice(2, 2 + tag.length) === tag;
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
    type: NodeTypes.ROOT,
  };
}

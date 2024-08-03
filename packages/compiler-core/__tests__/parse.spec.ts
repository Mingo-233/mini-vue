import { describe, expect, it } from "vitest";
import { baseParse } from "../src/parse";
import { NodeTypes } from "../src/ast";

describe("parse", () => {
  it("should parse simple expression", () => {
    const ast = baseParse("{{message}}");
    expect(ast.children[0]).toEqual({
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: "message",
      },
    });
  });

  it("parse element", () => {
    const ast = baseParse("<div></div>");
    expect(ast.children[0]).toEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [],
    });
  });

  it("parse text", () => {
    const ast = baseParse("text123");
    expect(ast.children[0]).toEqual({
      type: NodeTypes.TEXT,
      content: "text123",
    });
  });

  it("hello world", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");

    expect(ast.children[0]).toEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });

  it("Nested element ", () => {
    const ast = baseParse("<div><p>hi</p>{{message}}</div>");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hi",
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });

  it("should throw error when lack end tag", () => {
    expect(() => {
      baseParse("<div><span></div>");
    }).toThrowError(`缺少结束标签:span`);
  });
});

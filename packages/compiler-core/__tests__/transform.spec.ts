import { describe, expect, it } from "vitest";
import { baseParse } from "../src/parse";
import { NodeTypes } from "../src/ast";
import { transform } from "../src/transform";

describe("transform plugin", () => {
  it("transform plugin", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + " mini-vue";
      }
    };
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe("hi, mini-vue");
  });
});

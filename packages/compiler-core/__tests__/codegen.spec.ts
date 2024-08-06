import { describe, expect, it } from "vitest";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
import { generate } from "../src/codegen";
import { transformExpression } from "../src/transforms/transformExpression";
import { transformElement } from "../src/transforms/transformElement";
import { transformText } from "../src/transforms/transformText";

describe("codegen", () => {
  it("string", () => {
    const ast = baseParse("abc");
    transform(ast);
    const { code } = generate(ast);

    expect(code).toMatchSnapshot();
  });

  it("interpolation", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
  it("element", () => {
    const ast: any = baseParse("<div>hi,{{message}}</div>");
    transform(ast, {
      // nodeTransforms: [transformExpression, transformText, transformElement],
      //Note: 因为后面2个转换函数是退出执行的，所以这边的实际执行顺序是 1transformExpression 2transformText 3transformElement
      // 为什么要做退出执行，是因为 element类型节点在transformText环节结构会改变，内部的差值类型会被并入复合类型中，后面就无法对这个差值类型处理了
      //  所以做尾执行 ，让前面的transformExpression都先走完
      nodeTransforms: [transformExpression, transformElement, transformText],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});

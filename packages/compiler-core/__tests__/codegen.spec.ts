import { describe, expect, it } from "vitest";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
import { generate } from "../src/codegen";
import { transformExpression } from "../src/transforms/transformExpression";
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
});

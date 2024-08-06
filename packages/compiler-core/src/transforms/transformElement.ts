import { NodeTypes, createVNodeCal } from "../ast";
export function transformElement(node, context) {
  return () => {
    if (node.type === NodeTypes.ELEMENT) {
      const tag = node.tag;
      let props;
      // TODO: ?
      const child = node.children[0];

      node.codeGenNode = createVNodeCal(context, tag, props, child);
    }
  };
}

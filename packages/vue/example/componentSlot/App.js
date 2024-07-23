import { h, createTextVNode } from "../../dist/mini-vue.esm-bundler.js";
import Foo from "./Foo.js";
export default {
  name: "App",
  render() {
    return h(
      "div",
      {
        id: "root",
      },
      [
        h(
          Foo,
          {},
          {
            header: ({ age }) =>
              h("p", {}, [
                h("div", {}, "header:" + age),
                createTextVNode("这是一个createTextVNod创建的内容"),
              ]),
            footer: () => h("p", {}, "footer"),
          }
        ),
      ]
    );
  },
  setup() {
    return {};
  },
};

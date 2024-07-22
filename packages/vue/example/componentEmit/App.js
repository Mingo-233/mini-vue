import { h } from "../../dist/mini-vue.esm-bundler.js";
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
        h(Foo, {
          count: 1,
          onAdd: () => {
            console.log("onAdd");
          },
        }),
      ]
    );
  },
  setup() {
    return {};
  },
};

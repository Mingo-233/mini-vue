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
        }, {
          header: ({ age }) => h('p', {}, 'header:' + age),
          footer: () => h('p', {}, 'footer')

        }),
      ]
    );
  },
  setup() {
    return {};
  },
};

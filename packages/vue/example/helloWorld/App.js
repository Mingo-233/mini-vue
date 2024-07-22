import { h } from "../../dist/mini-vue.esm-bundler.js";
import Foo from "./Foo.js";
window.self = null;
export default {
  name: "App",
  render() {
    window.self = this;
    return h(
      "div",
      {
        class: "red",
        id: "root",
        onClick: () => {
          console.log("click");
        },
      },
      // this.word
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
      [h(Foo, { count: 1 })]
    );
  },
  setup() {
    return {
      word: "hello",
    };
  },
};

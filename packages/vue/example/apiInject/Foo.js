import { h, getCurrentInstance } from "../../dist/mini-vue.esm-bundler.js";
export default {
  name: "Foo",
  setup() {
    const instance = getCurrentInstance();
    console.log("Foo:", instance);
  },
  render() {
    return h("div", {}, "foo");
  },
};

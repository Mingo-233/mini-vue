import { h, getCurrentInstance } from "../../dist/mini-vue.esm-bundler.js";
import Foo from "./Foo.js";
export default {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "currentInstance demo"), h(Foo)]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("App:", instance);
    return {};
  },
};

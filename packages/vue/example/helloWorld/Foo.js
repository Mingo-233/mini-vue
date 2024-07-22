import { h } from "../../dist/mini-vue.esm-bundler.js";
export default {
  name: "Foo",
  render() {
    return h("div", {}, "foo-props:" + this.count);
  },
  setup(props) {
    console.log(props);
    // 测试更改props,props是只读的
    props.count = 2;
    console.log(props);
  },
};

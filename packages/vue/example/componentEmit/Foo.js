import { h } from "../../dist/mini-vue.esm-bundler.js";
export default {
  name: "Foo",
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log("emitAdd 触发");
      emit("add", "prams1", "prams2");
    };
    return {
      emitAdd,
    };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "this is btn"
    );
    return h("div", {}, [btn]);
  },
};

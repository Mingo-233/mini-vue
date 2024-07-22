import { h, renderSlots } from "../../dist/mini-vue.esm-bundler.js";
export default {
  name: "Foo",
  setup() {
    return {
    };
  },
  render() {
    const age = 18;
    console.log(this.$slots);
    return h("div", {}, [
      renderSlots(this.$slots, 'header', { age }),
      renderSlots(this.$slots, 'footer')

    ]);
  },
};

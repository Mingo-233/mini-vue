import { h, ref } from "../../dist/mini-vue.esm-bundler.js";
const App = {
  name: "App",
  template: `<div>hi,{{count}}</div>`,
  // template: `<div>hi,abc</div>`,
  setup() {
    const count = ref(1)
    window.count = count
    return {
      count,
    };
  },
};

export default App;

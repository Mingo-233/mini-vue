import { h } from "../../dist/mini-vue.esm-bundler.js";
export default {
    name: "App",
    render() {
        return h("div", { class: "red" }, [
            h("p", { class: "red" }, "hi"),
            h("p", { class: "blue" }, "mini-vue"),
        ]);
    },
    setup() {
        return {
            word: "hello",
        };
    },
};

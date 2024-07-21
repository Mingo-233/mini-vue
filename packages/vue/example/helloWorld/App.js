import { h } from "../../dist/mini-vue.esm-bundler.js";
window.self = null
export default {
    name: "App",
    render() {
        window.self = this
        return h("div", { class: "red", id: 'root' }, this.word
            //     [
            //     h("p", { class: "red" }, "hi"),
            //     h("p", { class: "blue" }, "mini-vue"),
            // ]
        );
    },
    setup() {
        return {
            word: "hello",
        };
    },
};

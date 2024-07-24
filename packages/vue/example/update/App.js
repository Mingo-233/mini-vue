
import { h, ref } from "../../dist/mini-vue.esm-bundler.js";
const App = {
    setup() {
        const count = ref(1)
        function add() {
            count.value++
            console.log('add - count value', count.value);
        }
        return {
            count,
            add
        };
    },
    render() {
        return h(
            "div",
            {
                id: "root",
            },
            [
                h("div", {}, "count:" + this.count), // 依赖收集
                h(
                    "button",
                    {
                        onClick: this.add,
                    },
                    "click"
                ),
            ]
        );
    },
};

export default App
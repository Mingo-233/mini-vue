import { h, ref } from "../../dist/mini-vue.esm-bundler.js";
const App = {
  setup() {
    const count = ref(1);
    function add() {
      count.value++;
      console.log("add - count value", count.value);
    }
    const mockData = ref({
      age: 1,
      name: "Ac",
    });
    function changeMockData() {
      mockData.value.age = 2;
    }
    function deleteMockData() {
      mockData.value.age = null;
    }
    function reMockData() {
      mockData.value = {
        name: "Mc",
      };
    }
    return {
      count,
      add,
      mockData,
      changeMockData,
      deleteMockData,
      reMockData,
    };
  },
  render() {
    return h(
      "div",
      {
        id: "root",
        ...this.mockData
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
        h(
          "button",
          {
            onClick: this.changeMockData,
          },
          "changeMockData - 值改变了 - 修改"
        ),

        h(
          "button",
          {
            onClick: this.deleteMockData,
          },
          "deleteMockData - 值变成了 undefined - 删除"
        ),

        h(
          "button",
          {
            onClick: this.reMockData,
          },
          "reMockData - key 在新的里面没有了 - 删除"
        ),
      ]
    );
  },
};

export default App;

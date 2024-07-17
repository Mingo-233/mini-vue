export default {
  input: "src/main.js",
  input:"./packages/vue/src/index.ts",
  output: [
    // {
    //     format: "cjs",
    //     file: "./packages/vue/dist/mini-vue.cjs.js",
    //     sourcemap: true,
    //   },
    {
      name: "vue",
      format: "es",
      file: "./packages/vue/dist/mini-vue.esm-bundler.js",
      sourcemap: true,
    },
  ],
};

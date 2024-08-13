import typescript from "@rollup/plugin-typescript";
export default {
  plugins: [typescript()],
  input: "./packages/vue/src/index.ts",
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
      sourcemap: false,
    },
  ],
};

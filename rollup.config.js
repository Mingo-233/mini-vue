import typescript from "@rollup/plugin-typescript";
export default {
  input: "./packages/runtime-core/index.ts",
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
  plugins: [typescript()],
};

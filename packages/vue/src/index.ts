// 这个文件充当 vue 模块
import * as runtimeDom from "@mini-vue/runtime-dom";
import { registerRuntimeCompiler } from "@mini-vue/runtime-dom";

import { baseCompile } from "@mini-vue/compiler-core";

export * from "@mini-vue/runtime-dom";

runtimeDom.createApp;
function compileToFunction(template) {
  const { code } = baseCompile(template);

  // let code = `
  // const {createElementVNode:_createElementVNode} = Vue
  // return function render(_ctx,_cache) {return _createElementVNode('div',null,'hi,'+_toDisplayString(_ctx.count))}
  // `;

  // 这个vue是一个形参，传入的实参是runtimeDom
  const render = new Function("Vue", code)(runtimeDom);

  return render;
}

// 由于Vue子包严格依赖关系，compiler-core 无法直接在 runtime-core中引用，需要在应用层封装传递一下。
// 不能直接引用的原因也是合理的，因为一般编译都是在打包构建的时候做的，不需要放入到运行时包中，所以compile的相关代码也不会在浏览器中去
registerRuntimeCompiler(compileToFunction);

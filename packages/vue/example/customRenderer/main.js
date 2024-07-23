import { createRenderer } from "../../dist/mini-vue.esm-bundler.js";
import { App } from "./App.js";
(async () => {
    // Create a PixiJS application.
    const app = new PIXI.Application();

    // Intialize the application.
    await app.init({
        background: '#1099bb', resizeTo: window,
        width: 500,
        height: 500,
    });

    // Then adding the application's canvas to the DOM body.
    document.body.appendChild(app.canvas);

    const renderer = createRenderer({
        createElement(type) {
            if (type === "rect") {
                const rect = new PIXI.Graphics();
                rect.beginFill(0xff0000);
                rect.drawRect(0, 0, 100, 100);
                rect.endFill();

                return rect;
            }
        },
        patchProp(el, key, val) {
            el[key] = val;
        },
        insert(el, parent) {
            parent.addChild(el);
        },
    });

    renderer.createApp(App).mount(app.stage);
})();


function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

const isObject = (val) => val !== null && typeof val === "object";

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
    };
    return instance;
}
function setupComponent(instance) {
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    instance.render = component.render;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // TODO 判断vnode 是不是一个 element
    // 是 element 那么就应该处理 element
    // 思考题： 如何去区分是 element 还是 component 类型呢？
    // processElement();
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function processElement(vnode, container) {
    const el = document.createElement(vnode.type);
    if (typeof vnode.children === "string") {
        el.textContent = vnode.children;
    }
    else if (Array.isArray(vnode.children)) {
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render && instance.render();
    patch(subTree, container);
}

function createApp(rootComponent) {
    const vnode = createVNode(rootComponent);
    function mount(rootContainer) {
        const dom = document.querySelector(rootContainer);
        render(vnode, dom);
    }
    return {
        mount,
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };

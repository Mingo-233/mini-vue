function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
    };
    return vnode;
}

const isObject = (val) => val !== null && typeof val === "object";

const publicPropertiesMap = {
    $el: function (i) {
        return i.vnode.el;
    },
};
const PublicInstanceProxyHandlers = {
    get(instance, key) {
        const { setupState } = instance;
        if (setupState[key])
            return setupState[key];
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter)
            return publicGetter();
    },
};

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupResult: {},
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
        instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers);
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
    vnode.el = el;
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
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    console.log("subTree", subTree);
    patch(subTree, container);
    // instance.el = subTree.el;
    initialVNode.el = subTree.el;
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

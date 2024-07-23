const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === "object";
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
    ShapeFlags[ShapeFlags["TELEPORT"] = 64] = "TELEPORT";
    ShapeFlags[ShapeFlags["SUSPENSE"] = 128] = "SUSPENSE";
    ShapeFlags[ShapeFlags["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
    ShapeFlags[ShapeFlags["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
    ShapeFlags[ShapeFlags["COMPONENT"] = 6] = "COMPONENT";
})(ShapeFlags || (ShapeFlags = {}));

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        ShapeFlag: typeof type === "string"
            ? ShapeFlags.ELEMENT
            : ShapeFlags.STATEFUL_COMPONENT,
        el: undefined,
    };
    if (typeof children === "string") {
        // 按位或赋值运算符
        vnode.ShapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.ShapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    else if (isObject(children)) {
        vnode.ShapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, null, text);
}

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let deps = depsMap.get(key);
    triggerEffects(deps);
}
function triggerEffects(deps) {
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const Getter = createGetter();
const readonlyGetter = createGetter({
    isReadonly: true,
    isShallow: false,
});
const shallowReadonlyGetter = createGetter({
    isReadonly: true,
    isShallow: true,
});
const Setter = createSetter();
function createGetter(option = {
    isReadonly: false,
    isShallow: false,
}) {
    return function get(target, key) {
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return option.isReadonly;
        }
        else if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !option.isReadonly;
        }
        const res = Reflect.get(target, key);
        if (option.isShallow)
            return res;
        if (isObject(res)) {
            return option.isReadonly ? readonly(res) : reactive(res);
        }
        if (!option.isReadonly) ;
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        // Note: 先set值，在拿新值去更新
        const res = Reflect.set(target, key, value);
        //Done: 触发更新
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get: Getter,
    set: Setter,
};
const readonlyHandler = {
    get: readonlyGetter,
    set: function set(target, key, value) {
        console.warn(`set on key ${key} failed, because it is readonly`, target);
        return true;
    },
};
const shallowReadonlyHandler = extend({}, readonlyHandler, { get: shallowReadonlyGetter, });

function reactive(val) {
    return createReactiveObject(val, mutableHandlers);
}
function readonly(val) {
    return createReactiveObject(val, readonlyHandler);
}
function shallowReadonly(val) {
    return createReactiveObject(val, shallowReadonlyHandler);
}
function createReactiveObject(val, handler) {
    if (!isObject(val)) {
        console.warn(`target ${val} 必须是一个对象`);
        return val;
    }
    return new Proxy(val, handler);
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get(instance, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter)
            return publicGetter(instance);
    },
};

function initProps(instance, props) {
    props && (instance.props = props);
}

function emit(instance, event, ...arg) {
    const { props } = instance;
    const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    const fn = props[eventName];
    fn && fn(...arg);
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (ShapeFlags.SLOTS_CHILDREN & vnode.ShapeFlag) {
        normalizeObjectSlots(instance, children);
    }
}
function normalizeObjectSlots(instance, children) {
    for (const key in children) {
        let generateSlotFn = children[key];
        instance.slots[key] = (params) => normalizeSlotValue(generateSlotFn(params));
        //   generateSlotFn(params);
    }
}
function normalizeSlotValue(value) {
    // 这里调用插槽函数，已经生成普通元素的节点内容，需要返回数组。如果还是返回对象，按逻辑仍然会识别为插槽节点
    return Array.isArray(value) ? value : [value];
}

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        props: {},
        setupState: {},
        slots: {},
        emit: () => { },
        provides: parent ? parent.provides : {},
        parent: parent,
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
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
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function render(vnode, container) {
    patch(vnode, container, null);
}
function patch(vnode, container, parent) {
    const { ShapeFlag, type } = vnode;
    switch (type) {
        case Text:
            processText(vnode, container);
            break;
        case Fragment:
            processFragment(vnode, container, parent);
            break;
        default:
            // 与运算符
            if (ShapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parent);
            }
            else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parent);
            }
            break;
    }
}
function processText(vnode, container) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.append(el);
}
function processFragment(vnode, container, parent) {
    mountChildren(vnode, container, parent);
}
function processComponent(vnode, container, parent) {
    mountComponent(vnode, container, parent);
}
function mountElement(vnode, container, parent) {
    const el = document.createElement(vnode.type);
    vnode.el = el;
    const { children, ShapeFlag } = vnode;
    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = vnode.children;
    }
    else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el, parent);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const isOn = (key) => /^on[A-Z]/.test(key);
        const val = props[key];
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function processElement(vnode, container, parent) {
    mountElement(vnode, container, parent);
}
function mountComponent(initialVNode, container, parent) {
    const instance = createComponentInstance(initialVNode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function mountChildren(vnode, container, parent) {
    vnode.children.forEach((v) => {
        patch(v, container, parent);
    });
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // Note: 当前实例作为下一个组件的父级
    patch(subTree, container, instance);
    // Note: 组件会找到一个真实dom内容的节点，作为它根元素。而这必须在patch之后，因为patch之后才会有el属性
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

function renderSlots(slots, slotName, params) {
    const slot = slots[slotName];
    if (slot && typeof slot === "function") {
        return createVNode(Fragment, {}, slot(params));
    }
}

function inject(key, defaultVal) {
    const instance = getCurrentInstance();
    if (instance) {
        let provides = instance.parent.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultVal) {
            if (typeof defaultVal === "function") {
                return defaultVal();
            }
            else {
                return defaultVal;
            }
        }
    }
}
function provide(key, value) {
    const instance = getCurrentInstance();
    if (instance) {
        const { parent } = instance;
        //   Note: 因为在初始化组件实例的时候，会去继承父级的provides。 这个继承，赋值的就是父级上的provides这个对象的地址。
        //         所以这里如果等于，说明当前实例还没有自己的provides属性，需要重新创建一个provides对象来存储子组件自己的依赖项。
        //         确保子组件有独立的 provides 对象，避免污染和副作用
        if (parent.provides === instance.provides) {
            instance.provides = Object.create(parent.provides);
        }
        instance.provides[key] = value;
    }
}

export { createApp, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };

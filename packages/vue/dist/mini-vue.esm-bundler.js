const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === "object";
const isSameValue = (a, b) => Object.is(a, b);
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

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, slotName, params) {
    const slot = slots[slotName];
    if (slot && typeof slot === "function") {
        return createVNode(Fragment, {}, slot(params));
    }
}

const targetMap = new Map();
let activeEffect = null;
let shouldTrack = false;
class ReactiveEffect {
    _fn;
    isActive = true;
    deps = [];
    scheduler = null;
    onStop = null;
    constructor(fn, scheduler) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.isActive) {
            return this._fn();
        }
        // Note: 这里通过shouldTrack把收集范围框定起来，只有在effect中访问getter才会收集依赖
        shouldTrack = true;
        activeEffect = this;
        const r = this._fn();
        // 重置
        shouldTrack = false;
        return r;
    }
    stop() {
        cleanupEffect(this);
        this.onStop && this.onStop();
        this.isActive = false;
    }
}
function effect(fn, option = {}) {
    const _effect = new ReactiveEffect(fn, option.scheduler);
    extend(_effect, option);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    //Note: js中函数是头等 (first-class)对象，因为它们可以像任何其他对象一样具有属性和方法。
    runner.effect = _effect;
    return runner;
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
function track(target, key) {
    if (!isTracking())
        return;
    // Note: target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    // dep里面存的实际就是reactiveEffect的实例
    dep.add(activeEffect);
    // 反向存储dep，用于后续clear
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== null;
}
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
        if (!option.isReadonly) {
            //Note: 只读不会更改，所以也没有依赖收集的必要
            //Done: 依赖收集
            track(target, key);
        }
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

class RefImpl {
    _value;
    _rawValue;
    __v_isRef = true;
    deps = new Set();
    constructor(value) {
        this._value = covert(value);
    }
    get value() {
        const r = this._value;
        if (isTracking()) {
            trackEffects(this.deps);
        }
        return r;
    }
    set value(v) {
        if (isSameValue(v, this._rawValue))
            return;
        this._value = covert(v);
        this._rawValue = v;
        triggerEffects(this.deps);
    }
}
function covert(val) {
    return isObject(val) ? reactive(val) : val;
}
function ref(val) {
    return new RefImpl(val);
}
function isRef(val) {
    return !!val.__v_isRef;
}
function unRef(val) {
    return isRef(val) ? val.value : val;
}
// 自动解包和自动设置ref.value
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
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
        isMounted: false,
        subTree: {},
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
        const setupResult = proxyRefs(setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        }));
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

function createAppApi(render) {
    return function createApp(rootComponent) {
        const vnode = createVNode(rootComponent);
        function mount(rootContainer) {
            render(vnode, rootContainer);
        }
        return {
            mount,
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    function patch(oldVnode, newVnode, container, parent) {
        const { ShapeFlag, type } = newVnode;
        switch (type) {
            case Text:
                processText(oldVnode, newVnode, container);
                break;
            case Fragment:
                processFragment(oldVnode, newVnode, container, parent);
                break;
            default:
                // 与运算符
                if (ShapeFlag & ShapeFlags.ELEMENT) {
                    processElement(oldVnode, newVnode, container, parent);
                }
                else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(oldVnode, newVnode, container, parent);
                }
                break;
        }
    }
    function processText(oldVnode, newVnode, container) {
        const el = document.createTextNode(newVnode.children);
        newVnode.el = el;
        container.append(el);
    }
    function processFragment(oldVnode, newVnode, container, parent) {
        mountChildren(newVnode, container, parent);
    }
    function processComponent(oldVnode, newVnode, container, parent) {
        mountComponent(newVnode, container, parent);
    }
    function mountElement(vnode, container, parent) {
        const el = hostCreateElement(vnode.type);
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
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        hostInsert(container, el);
    }
    function updateElement(oldVnode, newVnode, container, parent) {
        console.log("updateElement");
    }
    function processElement(oldVnode, newVnode, container, parent) {
        if (!oldVnode) {
            mountElement(newVnode, container, parent);
        }
        else {
            updateElement();
        }
    }
    function mountComponent(initialVNode, container, parent) {
        const instance = createComponentInstance(initialVNode, parent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function mountChildren(vnode, container, parent) {
        vnode.children.forEach((v) => {
            patch(null, v, container, parent);
        });
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("mount");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                // Note: 当前实例作为下一个组件的父级
                patch(null, subTree, container, instance);
                // Note: 组件会找到一个真实dom内容的节点，作为它根元素。而这必须在patch之后，因为patch之后才会有el属性
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { proxy } = instance;
                const oldSubTree = instance.subTree;
                const newSubTree = instance.render.call(proxy);
                instance.subTree = newSubTree;
                // Note: 当前实例作为下一个组件的父级
                patch(oldSubTree, newSubTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render),
        render,
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, value) {
    const isOn = (k) => /^on[A-Z]/.test(k);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
    }
    else {
        el.setAttribute(key, value);
    }
}
function insert(container, el) {
    container.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
function createApp(component) {
    const app = renderer.createApp(component);
    app.mount = (id) => {
        // TODO: normalizeContainer
        const rootContainer = document.querySelector(id);
        renderer.render(createVNode(component), rootContainer);
    };
    return app;
}

export { createApp, createRenderer, createTextVNode, createVNode, effect, getCurrentInstance, h, inject, provide, proxyRefs, reactive, ref, renderSlots };

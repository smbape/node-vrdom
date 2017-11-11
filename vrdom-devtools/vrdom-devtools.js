/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */

/* eslint-disable valid-jsdoc, no-empty-function */

const vrdom = require("vrdom"),
    expando = vrdom.expando,
    nodeMap = vrdom.nodeMap,
    functions = vrdom.functions,
    getDisplayName = functions.getDisplayName,
    hasProp = functions.hasProp,
    hooks = vrdom.hooks;

const defineGetSetProperty = (obj, prop, getter, setter) => {
    Object.defineProperty(obj, prop, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: typeof setter === "function" ? setter : function(value) {
            Object.define(this, prop, {
                configurable: true,
                enumerable: true,
                writable: true,
                value
            });
            return value;
        }
    });
};

const INTERFACE_PROPERTIES = [];

const addInterface = _INTERFACE_PROPERTIES => {
    Object.keys(_INTERFACE_PROPERTIES).forEach(prop => {
        if (INTERFACE_PROPERTIES.indexOf(prop) === -1) {
            INTERFACE_PROPERTIES.push(prop);
        }
    });

    return _INTERFACE_PROPERTIES;
};

/**
 * Transform a virtual node to a ReactDOMComponent compatible object
 * @type {Object}
 */
const ReactDOMComponentInterface = addInterface({
    getName: {
        getter() {
            return this.vnode.type;
        }
    },

    _currentElement: {
        getter() {
            return this.vnode.element;
        }
    },

    _renderedChildren: {
        getter() {
            const children = this.vnode.children;
            let _renderedChildren;

            if (children !== null && "object" === typeof children) {
                _renderedChildren = [];

                // eslint-disable-next-line guard-for-in
                for (let canonicalKey in children) {
                    _renderedChildren.push(toReactComponent(children[canonicalKey]));
                }
            }

            return _renderedChildren;
        }
    }
});

/**
 * Transform a virtual node to a ReactCompositeComponent compatible object
 * @type {Object}
 */
const ReactCompositeComponentInterface = addInterface({
    getName: {
        getter() {
            return getDisplayName(this.vnode.element.type);
        }
    },

    _currentElement: {
        getter() {
            return this.vnode.element;
        },

        // forceUpdate set _currentElement
        setter(element) {
            this.vnode.element = element;
            return element;
        }
    },

    _renderedComponent: {
        getter() {
            return toReactComponent(this.vnode.thunk.vnode);
        }
    },

    _context: {
        getter() {
            if (this.stateless) {
                return this.vnode.context;
            }

            return undefined;
        }
    },

    _instance: {
        getter() {
            if (this.stateless) {
                return {
                    context: this._context,
                    props: this.vnode.element.props,
                    refs: {},
                    state: null
                };
            }

            return this.vnode.thunk.component;
        }
    },

    stateless: {
        getter() {
            return this.vnode.thunk._type === "Stateless";
        }
    }
});

/**
 * Transform a virtual node to a ReactTextComponent compatible object
 * @type {Object}
 */
const ReactTextComponentInterface = addInterface({
    _currentElement: {
        getter() {
            return this.vnode.text;
        }
    },

    _stringText: {
        getter() {
            return this.vnode.text;
        }
    }
});

const defineComponentProperties = (inst, vnode) => {
    inst.vnode = vnode;
    inst._inDevTools = false;

    defineGetSetProperty(inst, "_hostNode", function() {
        // eslint-disable-next-line no-invalid-this
        return this.vnode.node;
    });

    defineGetSetProperty(inst, "isWidget", function() {
        // eslint-disable-next-line no-invalid-this
        return this.vnode.isWidget;
    });

    defineGetSetProperty(inst, "isVNode", function() {
        // eslint-disable-next-line no-invalid-this
        return this.vnode.isVNode;
    });

    defineGetSetProperty(inst, "isVText", function() {
        // eslint-disable-next-line no-invalid-this
        return this.vnode.isVText;
    });

    INTERFACE_PROPERTIES.forEach(prop => {
        defineGetSetProperty(inst, prop, function() {
            // eslint-disable-next-line no-invalid-this
            const {vnode} = this;

            if (vnode.isWidget) {
                if (hasProp.call(ReactCompositeComponentInterface, prop) && typeof ReactCompositeComponentInterface[prop].getter === "function") {
                    return ReactCompositeComponentInterface[prop].getter.call(this);
                }

                return undefined;
            }

            if (vnode.isVNode) {
                if (hasProp.call(ReactDOMComponentInterface, prop) && typeof ReactDOMComponentInterface[prop].getter === "function") {
                    return ReactDOMComponentInterface[prop].getter.call(this);
                }

                return undefined;
            }

            if (hasProp.call(ReactTextComponentInterface, prop) && typeof ReactTextComponentInterface[prop].getter === "function") {
                return ReactTextComponentInterface[prop].getter.call(this);
            }

            return undefined;
        }, function(value) {
            // eslint-disable-next-line no-invalid-this
            const {vnode} = this;

            if (vnode.isWidget) {
                if (hasProp.call(ReactCompositeComponentInterface, prop) && typeof ReactCompositeComponentInterface[prop].setter === "function") {
                    return ReactCompositeComponentInterface[prop].setter.call(this, value);
                }

                return value;
            }

            if (vnode.isVNode) {
                if (hasProp.call(ReactDOMComponentInterface, prop) && typeof ReactDOMComponentInterface[prop].setter === "function") {
                    return ReactDOMComponentInterface[prop].setter.call(this, value);
                }

                return value;
            }

            if (hasProp.call(ReactTextComponentInterface, prop) && typeof ReactTextComponentInterface[prop].setter === "function") {
                return ReactTextComponentInterface[prop].setter.call(this, value);
            }

            return value;
        });
    });
};

class ReactTopLevelWrapper extends vrdom.Component {
    render() {
        return this.props.child;
    }
}

ReactTopLevelWrapper.isReactTopLevelWrapper = true;

/**
 * Transform a virtual node to a ReactTopLevelWrapper compatible object
 * 
 * @param  {VirtualNode|VirtualText|ComponentWidget} vnode      virtual node to transform
 * @param  {Object}                                  roots      roots dictionary
 * @param  {Object}                                  Mount      Mount object
 * @param  {Object}                                  Reconciler Reconciler object
 * 
 * @return {ReactTopLevelWrapper}                    ReactTopLevelWrapper compatible object
 */
function toReactTopLevelWrapper(vnode, roots, Mount, Reconciler) {
    let _renderedComponent = toReactWrapper(vnode, Mount, Reconciler);
    if (_renderedComponent.wrapper) {
        return _renderedComponent.wrapper;
    }

    let wrapper = {
        _rootID: vnode.key,
        _renderedComponent: _renderedComponent,
        _currentElement: {
            type: ReactTopLevelWrapper,
            props: {
                child: _renderedComponent._currentElement
            },
            key: null,
            ref: null
        },
        _instance: {
            context: vnode.context,
            props: {
                child: _renderedComponent._currentElement
            },
            refs: {},
            rootID: vnode.key,
            state: null
        }
    };

    roots[wrapper._rootID] = wrapper;
    _renderedComponent.wrapper = wrapper;
    Mount._renderNewRootComponent(wrapper._currentElement, vnode.node.parentNode, null, vnode.context, wrapper);
    Reconciler.mountComponent(wrapper);
    return wrapper;
}

/**
 * [toReactWrapper description]
 * 
 * @param  {VirtualNode|VirtualText|ComponentWidget} vnode      virtual node to transform
 * @param  {Object}                                  Mount      Mount object
 * @param  {Object}                                  Reconciler Reconciler object
 * 
 * @return {[type]}            [description]
 */
function toReactWrapper(vnode, Mount, Reconciler) {
    let instance = toReactComponent(vnode);

    visitNonCompositeChildren(instance, childInst => {
        childInst._inDevTools = true;
        Reconciler.mountComponent(childInst);
    });
    Reconciler.mountComponent(instance);

    return instance;
}

/**
 * Map of Component|Node to ReactDOMComponent|ReactCompositeComponent-like
 * object.
 *
 * The same React*Component instance must be used when notifying devtools
 * about the initial mount of a component and subsequent updates.
 */
let instanceMap = new Map();

/**
 * Transform a virtual node to a ReactComponent compatible object
 * 
 * @param  {VirtualNode|VirtualText|ComponentWidget} vnode    virtual node to transform
 * @param  {Boolean}                                 noUpdate do not update
 * 
 * @return {[type]}                                  ReactComponent compatible object
 */
function toReactComponent(vnode, noUpdate) {
    if (vnode == null) {
        return null;
    }

    if (noUpdate) {
        return vnode._reactInternalDevToolInstance;
    }

    let inst;

    if (instanceMap.has(vnode.key)) {
        inst = instanceMap.get(vnode.key);
    } else {
        inst = {};
        instanceMap.set(vnode.key, inst);
    }

    defineComponentProperties(inst, vnode);

    vnode._reactInternalDevToolInstance = inst;
    return inst;
}
/**
 * Find all root component instances rendered by vrdom in `node`'s children
 * and add them to the `roots` map.
 *
 * @param {DOMElement} node
 * @param {[key: string] => ReactDOMComponent|ReactCompositeComponent}
 */
function findRoots(childNodes, roots, Mount, Reconciler) {
    for (let i = 0, len = childNodes.length; i < len; i++) {
        const child = childNodes[i];

        if (hasProp.call(child, expando) && hasProp.call(child[expando], "rootVNode")) {
            let rootVNode = child[expando].rootVNode;
            toReactTopLevelWrapper(rootVNode, roots, Mount, Reconciler);
        }

        let nestedChildNodes = child.childNodes;
        if (child.nodeName && child.nodeName.toUpperCase() === "IFRAME") {
            try {
                nestedChildNodes = [child.contentDocument];
            } catch ( e ) {
                // Nothing to do
            }
        }
        findRoots(nestedChildNodes, roots, Mount, Reconciler);
    }
}

/**
 * Create a bridge for exposing vrdom's component tree to React DevTools.
 *
 * It creates implementations of the interfaces that ReactDOM passes to
 * devtools to enable it to query the component tree and hook into component
 * updates.
 *
 * See https://github.com/facebook/react/blob/59ff7749eda0cd858d5ee568315bcba1be75a1ca/src/renderers/dom/ReactDOM.js
 * for how ReactDOM exports its internals for use by the devtools and
 * the `attachRenderer()` function in
 * https://github.com/facebook/react-devtools/blob/e31ec5825342eda570acfc9bcb43a44258fceb28/backend/attachRenderer.js
 * for how the devtools consumes the resulting objects.
 */
function createDevToolsBridge(global) {
    const document = global.document;

    // The devtools has different paths for interacting with the renderers from
    // React Native, legacy React DOM and current React DOM.
    //
    // Here we emulate the interface for the current React DOM (v15+) lib.

    // Map of root ID (the ID is unimportant) to component instance.
    let roots = {};

    // ReactMount-like object
    //
    // Used by devtools to discover the list of root component instances and get
    // notified when new root components are rendered.
    const Mount = {
        _instancesByReactRootID: roots,

        // Stub - React DevTools expects to find this method and replace it
        // with a wrapper in order to observe new root components being added
        _renderNewRootComponent(nextElement, container, shouldReuseMarkup, context, wrapper) {
            return wrapper;
        }
    };

    // ReactReconciler-like object
    const Reconciler = {
        // Stubs - React DevTools expects to find these methods and replace them
        // with wrappers in order to observe components being mounted, updated and
        // unmounted
        mountComponent( /* instance, ... */ ) {},
        performUpdateIfNecessary( /* instance, ... */ ) {},
        receiveComponent( /* instance, ... */ ) {},
        unmountComponent( /* instance, ... */ ) {}
    };

    findRoots(document.body.childNodes, roots, Mount, Reconciler);

    // ReactDOMComponentTree-like object
    const ComponentTree = {
        getNodeFromInstance(instance) {
            return instance._hostNode;
        },
        getClosestInstanceFromNode(node) {
            while (node && !hasProp.call(node, expando)) {
                node = node.parentNode;
            }

            if (node == null) {
                return null;
            }

            if (node[expando].rootVNode) {
                return toReactTopLevelWrapper(node[expando].rootVNode, roots, Mount, Reconciler);
            }

            let map = nodeMap[node[expando].vrdomID];
            if (map == null) {
                return null;
            }

            return toReactComponent(map.vnode, true);
        }
    };

    const componentDidMount = vnode => {
        if (isRootVNode(vnode)) {
            toReactTopLevelWrapper(vnode, roots, Mount, Reconciler);
            return;
        }

        toReactWrapper(vnode, Mount, Reconciler);
    };

    const componentDidUpdate = vnode => {
        const prevRenderedChildren = [];
        visitNonCompositeChildren(instanceMap.get(vnode.key), childInst => {
            prevRenderedChildren.push(childInst);
        });

        // Notify devtools about updates to this vnode and any non-composite
        // children
        const instance = toReactComponent(vnode);
        Reconciler.receiveComponent(instance);
        visitNonCompositeChildren(instance, childInst => {
            if (!childInst._inDevTools) {
                // New DOM child vnode
                childInst._inDevTools = true;
                Reconciler.mountComponent(childInst);
            } else {
                // Updated DOM child vnode
                Reconciler.receiveComponent(childInst);
            }
        });

        // For any non-composite children that were removed by the latest render,
        // remove the corresponding ReactDOMComponent-like instances and notify
        // the devtools
        prevRenderedChildren.forEach(childInst => {
            if (!document.body.contains(childInst._hostNode)) {
                instanceMap.delete(childInst.vnode);
                Reconciler.unmountComponent(childInst);
                delete childInst._hostNode;
                delete childInst.vnode;
            }
        });
    };

    const componentWillUnmount = vnode => {
        let instance = toReactComponent(vnode);
        let rootInstance;

        if (isRootVNode(vnode)) {
            rootInstance = toReactTopLevelWrapper(instance.vnode, roots, Mount, Reconciler);
            Reconciler.unmountComponent(instance);
        }

        visitNonCompositeChildren(childInst => {
            instanceMap.delete(childInst.vnode);
            Reconciler.unmountComponent(childInst);
            delete childInst._hostNode;
            delete childInst.vnode;
        });

        Reconciler.unmountComponent(instance);

        instanceMap.delete(vnode.key);
        if (instance._rootID) {
            delete roots[instance._rootID];
        }
        delete instance._hostNode;
        delete instance.vnode;
        delete vnode._reactInternalDevToolInstance;

        if (rootInstance) {
            delete rootInstance._hostNode;
            delete rootInstance.vnode;
            delete vnode._reactInternalDevToolInstance;
        }
    };

    return {
        componentDidMount,
        componentDidUpdate,
        componentWillUnmount,

        // Interfaces passed to devtools via __REACT_DEVTOOLS_GLOBAL_HOOK__.inject()
        ComponentTree,
        Mount,
        Reconciler
    };
}

/**
 * Visit all child instances of a ReactCompositeComponent-like object that are
 * not composite components (ie. they represent DOM elements or text)
 *
 * @param {ReactInternalComponent} instance
 * @param {(ReactInternalComponent) => void} visitor
 */
function visitNonCompositeChildren(instance, visitor) {
    if (instance.isWidget) {
        visitNonCompositeChildren(instance._renderedComponent, visitor);
    } else if (instance.isVNode) {
        visitor(instance);

        if (Array.isArray(instance._renderedChildren)) {
            instance._renderedChildren.forEach(childInst => {
                visitNonCompositeChildren(childInst, visitor);
            });
        }
    }
}

/**
 * Return `true` if a vrdom vnode is a top level vnode rendered by
 * `render()` into a container Element.
 */
function isRootVNode(vnode) {
    return !vnode.parent;
}

let registered = false;
let componentDidMountHook, componentDidUpdateHook, componentWillUnmountHook;

/**
 * Create a bridge between the vrdom component tree and React's dev tools
 * and register it.
 *
 * After this function is called, the React Dev Tools should be able to detect
 * "React" on the page and show the component tree.
 *
 * This function hooks into vrdom VNode creation in order to expose functional
 * components correctly, so it should be called before the root component(s)
 * are rendered.
 */
export function register(global) {
    if (global == null) {
        global = window;
    }

    const __REACT_DEVTOOLS_GLOBAL_HOOK__ = global.__REACT_DEVTOOLS_GLOBAL_HOOK__;

    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || registered) {
        // React DevTools are not installed
        return;
    }

    const bridge = createDevToolsBridge(global);
    componentDidMountHook = bridge.componentDidMount;
    componentDidUpdateHook = bridge.componentDidUpdate;
    componentWillUnmountHook = bridge.componentWillUnmount;

    // Notify devtools about this instance of "React"
    registered = __REACT_DEVTOOLS_GLOBAL_HOOK__.inject(bridge);

    hooks.appendHook("componentDidMount", componentDidMountHook);
    hooks.appendHook("componentDidUpdate", componentDidUpdateHook);
    hooks.appendHook("componentWillUnmount", componentWillUnmountHook);
}

export function unregister() {
    if (registered) {
        hooks.removeHook("componentDidMount", componentDidMountHook);
        hooks.removeHook("componentDidUpdate", componentDidUpdateHook);
        hooks.removeHook("componentWillUnmount", componentWillUnmountHook);

        delete __REACT_DEVTOOLS_GLOBAL_HOOK__._renderers[registered];
        registered = false;
    }
}
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vrdom"));
	else if(typeof define === 'function' && define.amd)
		define(["vrdom"], factory);
	else if(typeof exports === 'object')
		exports["vrdomDevtools"] = factory(require("vrdom"));
	else
		root["vrdomDevtools"] = factory(root["vrdom"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	exports.register = register;
	exports.unregister = unregister;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	
	/* eslint-disable valid-jsdoc, no-empty-function */
	
	var vrdom = __webpack_require__(1),
	    expando = vrdom.expando,
	    nodeMap = vrdom.nodeMap,
	    functions = vrdom.functions,
	    getDisplayName = functions.getDisplayName,
	    hasProp = functions.hasProp,
	    hooks = vrdom.hooks;
	
	var defineGetSetProperty = function defineGetSetProperty(obj, prop, getter, setter) {
	    Object.defineProperty(obj, prop, {
	        configurable: true,
	        enumerable: true,
	        get: getter,
	        set: typeof setter === "function" ? setter : function (value) {
	            Object.define(this, prop, {
	                configurable: true,
	                enumerable: true,
	                writable: true,
	                value: value
	            });
	            return value;
	        }
	    });
	};
	
	var INTERFACE_PROPERTIES = [];
	
	var addInterface = function addInterface(iface) {
	    Object.keys(iface).forEach(function (prop) {
	        if (INTERFACE_PROPERTIES.indexOf(prop) === -1) {
	            INTERFACE_PROPERTIES.push(prop);
	        }
	
	        if (typeof iface[prop] === "function") {
	            iface[prop] = {
	                getter: iface[prop]
	            };
	        }
	    });
	
	    return iface;
	};
	
	/**
	 * Transform a virtual node to a ReactDOMComponent compatible object
	 * @type {Object}
	 */
	var ReactDOMComponentInterface = addInterface({
	    getName: function getName() {
	        return this.vnode.type;
	    },
	    _currentElement: function _currentElement() {
	        return this.vnode.element;
	    },
	    _renderedChildren: function _renderedChildren() {
	        var children = this.vnode.children;
	        var _renderedChildren = void 0;
	
	        if (children !== null && "object" === typeof children) {
	            _renderedChildren = [];
	
	            // eslint-disable-next-line guard-for-in
	            for (var canonicalKey in children) {
	                _renderedChildren.push(toReactComponent(children[canonicalKey]));
	            }
	        }
	
	        return _renderedChildren;
	    }
	});
	
	/**
	 * Transform a virtual node to a ReactCompositeComponent compatible object
	 * @type {Object}
	 */
	var ReactCompositeComponentInterface = addInterface({
	    getName: function getName() {
	        return getDisplayName(this.vnode.element.type);
	    },
	
	
	    _currentElement: {
	        getter: function getter() {
	            return this.vnode.element;
	        },
	
	
	        // forceUpdate set _currentElement
	        setter: function setter(element) {
	            this.vnode.element = element;
	            return element;
	        }
	    },
	
	    _renderedComponent: function _renderedComponent() {
	        return toReactComponent(this.vnode.thunk.vnode);
	    },
	    _context: function _context() {
	        if (this.stateless) {
	            return this.vnode.context;
	        }
	
	        return undefined;
	    },
	    _instance: function _instance() {
	        if (this.stateless) {
	            return {
	                context: this._context,
	                props: this.vnode.element.props,
	                refs: {},
	                state: null
	            };
	        }
	
	        return this.vnode.thunk.component;
	    },
	    stateless: function stateless() {
	        return this.vnode.thunk._type === "Stateless";
	    }
	});
	
	/**
	 * Transform a virtual node to a ReactTextComponent compatible object
	 * @type {Object}
	 */
	var ReactTextComponentInterface = addInterface({
	    _currentElement: function _currentElement() {
	        return this.vnode.text;
	    },
	    _stringText: function _stringText() {
	        return this.vnode.text;
	    }
	});
	
	var defineComponentProperties = function defineComponentProperties(inst, vnode) {
	    inst.vnode = vnode;
	    inst._inDevTools = false;
	
	    defineGetSetProperty(inst, "_hostNode", function () {
	        // eslint-disable-next-line no-invalid-this
	        return this.vnode.node;
	    });
	
	    defineGetSetProperty(inst, "isWidget", function () {
	        // eslint-disable-next-line no-invalid-this
	        return this.vnode.isWidget;
	    });
	
	    defineGetSetProperty(inst, "isVNode", function () {
	        // eslint-disable-next-line no-invalid-this
	        return this.vnode.isVNode;
	    });
	
	    defineGetSetProperty(inst, "isVText", function () {
	        // eslint-disable-next-line no-invalid-this
	        return this.vnode.isVText;
	    });
	
	    INTERFACE_PROPERTIES.forEach(function (prop) {
	        defineGetSetProperty(inst, prop, function () {
	            // eslint-disable-next-line no-invalid-this
	            var inst = this;
	            var vnode = inst.vnode;
	
	
	            if (vnode.isWidget) {
	                if (hasProp.call(ReactCompositeComponentInterface, prop) && typeof ReactCompositeComponentInterface[prop].getter === "function") {
	                    return ReactCompositeComponentInterface[prop].getter.call(inst);
	                }
	
	                return undefined;
	            }
	
	            if (vnode.isVNode) {
	                if (hasProp.call(ReactDOMComponentInterface, prop) && typeof ReactDOMComponentInterface[prop].getter === "function") {
	                    return ReactDOMComponentInterface[prop].getter.call(inst);
	                }
	
	                return undefined;
	            }
	
	            if (hasProp.call(ReactTextComponentInterface, prop) && typeof ReactTextComponentInterface[prop].getter === "function") {
	                return ReactTextComponentInterface[prop].getter.call(inst);
	            }
	
	            return undefined;
	        }, function (value) {
	            // eslint-disable-next-line no-invalid-this
	            var inst = this;
	            var vnode = inst.vnode;
	
	
	            if (vnode.isWidget) {
	                if (hasProp.call(ReactCompositeComponentInterface, prop) && typeof ReactCompositeComponentInterface[prop].setter === "function") {
	                    return ReactCompositeComponentInterface[prop].setter.call(inst, value);
	                }
	
	                return value;
	            }
	
	            if (vnode.isVNode) {
	                if (hasProp.call(ReactDOMComponentInterface, prop) && typeof ReactDOMComponentInterface[prop].setter === "function") {
	                    return ReactDOMComponentInterface[prop].setter.call(inst, value);
	                }
	
	                return value;
	            }
	
	            if (hasProp.call(ReactTextComponentInterface, prop) && typeof ReactTextComponentInterface[prop].setter === "function") {
	                return ReactTextComponentInterface[prop].setter.call(inst, value);
	            }
	
	            return value;
	        });
	    });
	};
	
	var ReactTopLevelWrapper = function (_vrdom$Component) {
	    _inherits(ReactTopLevelWrapper, _vrdom$Component);
	
	    function ReactTopLevelWrapper() {
	        _classCallCheck(this, ReactTopLevelWrapper);
	
	        return _possibleConstructorReturn(this, (ReactTopLevelWrapper.__proto__ || Object.getPrototypeOf(ReactTopLevelWrapper)).apply(this, arguments));
	    }
	
	    _createClass(ReactTopLevelWrapper, [{
	        key: "render",
	        value: function render() {
	            return this.props.child;
	        }
	    }]);
	
	    return ReactTopLevelWrapper;
	}(vrdom.Component);
	
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
	    var _renderedComponent = toReactWrapper(vnode, Mount, Reconciler);
	    if (_renderedComponent.wrapper) {
	        return _renderedComponent.wrapper;
	    }
	
	    var wrapper = {
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
	    var instance = toReactComponent(vnode);
	
	    visitNonCompositeChildren(instance, function (childInst) {
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
	var instanceMap = new Map();
	
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
	
	    var inst = void 0;
	
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
	    for (var i = 0, len = childNodes.length; i < len; i++) {
	        var child = childNodes[i];
	
	        if (hasProp.call(child, expando) && hasProp.call(child[expando], "rootVNode")) {
	            var rootVNode = child[expando].rootVNode;
	            toReactTopLevelWrapper(rootVNode, roots, Mount, Reconciler);
	        }
	
	        var nestedChildNodes = child.childNodes;
	        if (child.nodeName && child.nodeName.toUpperCase() === "IFRAME") {
	            try {
	                nestedChildNodes = [child.contentDocument];
	            } catch (e) {
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
	    var document = global.document;
	
	    // The devtools has different paths for interacting with the renderers from
	    // React Native, legacy React DOM and current React DOM.
	    //
	    // Here we emulate the interface for the current React DOM (v15+) lib.
	
	    // Map of root ID (the ID is unimportant) to component instance.
	    var roots = {};
	
	    // ReactMount-like object
	    //
	    // Used by devtools to discover the list of root component instances and get
	    // notified when new root components are rendered.
	    var Mount = {
	        _instancesByReactRootID: roots,
	
	        // Stub - React DevTools expects to find this method and replace it
	        // with a wrapper in order to observe new root components being added
	        _renderNewRootComponent: function _renderNewRootComponent(nextElement, container, shouldReuseMarkup, context, wrapper) {
	            return wrapper;
	        }
	    };
	
	    // ReactReconciler-like object
	    var Reconciler = {
	        // Stubs - React DevTools expects to find these methods and replace them
	        // with wrappers in order to observe components being mounted, updated and
	        // unmounted
	        mountComponent: function mountComponent() /* instance, ... */{},
	        performUpdateIfNecessary: function performUpdateIfNecessary() /* instance, ... */{},
	        receiveComponent: function receiveComponent() /* instance, ... */{},
	        unmountComponent: function unmountComponent() /* instance, ... */{}
	    };
	
	    findRoots(document.body.childNodes, roots, Mount, Reconciler);
	
	    // ReactDOMComponentTree-like object
	    var ComponentTree = {
	        getNodeFromInstance: function getNodeFromInstance(instance) {
	            return instance._hostNode;
	        },
	        getClosestInstanceFromNode: function getClosestInstanceFromNode(node) {
	            while (node && !hasProp.call(node, expando)) {
	                node = node.parentNode;
	            }
	
	            if (node == null) {
	                return null;
	            }
	
	            if (node[expando].rootVNode) {
	                return toReactTopLevelWrapper(node[expando].rootVNode, roots, Mount, Reconciler);
	            }
	
	            var map = nodeMap[node[expando].vrdomID];
	            if (map == null) {
	                return null;
	            }
	
	            return toReactComponent(map.vnode, true);
	        }
	    };
	
	    var componentDidMount = function componentDidMount(vnode) {
	        if (isRootVNode(vnode)) {
	            toReactTopLevelWrapper(vnode, roots, Mount, Reconciler);
	            return;
	        }
	
	        toReactWrapper(vnode, Mount, Reconciler);
	    };
	
	    var componentDidUpdate = function componentDidUpdate(vnode) {
	        var prevRenderedChildren = [];
	        visitNonCompositeChildren(instanceMap.get(vnode.key), function (childInst) {
	            prevRenderedChildren.push(childInst);
	        });
	
	        // Notify devtools about updates to this vnode and any non-composite
	        // children
	        var instance = toReactComponent(vnode);
	        Reconciler.receiveComponent(instance);
	        visitNonCompositeChildren(instance, function (childInst) {
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
	        prevRenderedChildren.forEach(function (childInst) {
	            if (!document.body.contains(childInst._hostNode)) {
	                instanceMap.delete(childInst.vnode);
	                Reconciler.unmountComponent(childInst);
	                delete childInst._hostNode;
	                delete childInst.vnode;
	            }
	        });
	    };
	
	    var componentWillUnmount = function componentWillUnmount(vnode) {
	        var instance = toReactComponent(vnode);
	        var rootInstance = void 0;
	
	        if (isRootVNode(vnode)) {
	            rootInstance = toReactTopLevelWrapper(instance.vnode, roots, Mount, Reconciler);
	            Reconciler.unmountComponent(instance);
	        }
	
	        visitNonCompositeChildren(function (childInst) {
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
	        componentDidMount: componentDidMount,
	        componentDidUpdate: componentDidUpdate,
	        componentWillUnmount: componentWillUnmount,
	
	        // Interfaces passed to devtools via __REACT_DEVTOOLS_GLOBAL_HOOK__.inject()
	        ComponentTree: ComponentTree,
	        Mount: Mount,
	        Reconciler: Reconciler
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
	    if (instance == null) {
	        return;
	    }
	
	    var stack = [[instance, visitor]];
	
	    var pushStack = function pushStack(childInst) {
	        if (childInst) {
	            stack.push([childInst, visitor]);
	        }
	    };
	
	    var args = void 0;
	    while (args = stack.pop()) {
	        instance = args[0];
	        visitor = args[1];
	
	        if (instance.isWidget) {
	            stack.push([instance._renderedComponent, visitor]);
	        } else if (instance.isVNode) {
	            visitor(instance);
	
	            if (Array.isArray(instance._renderedChildren)) {
	                instance._renderedChildren.forEach(pushStack);
	            }
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
	
	var registered = false;
	var componentDidMountHook = void 0,
	    componentDidUpdateHook = void 0,
	    componentWillUnmountHook = void 0;
	
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
	function register(global) {
	    if (global == null) {
	        global = window;
	    }
	
	    var __REACT_DEVTOOLS_GLOBAL_HOOK__ = global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
	
	    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || registered) {
	        // React DevTools are not installed
	        return;
	    }
	
	    var bridge = createDevToolsBridge(global);
	    componentDidMountHook = bridge.componentDidMount;
	    componentDidUpdateHook = bridge.componentDidUpdate;
	    componentWillUnmountHook = bridge.componentWillUnmount;
	
	    // Notify devtools about this instance of "React"
	    registered = __REACT_DEVTOOLS_GLOBAL_HOOK__.inject(bridge);
	
	    hooks.appendHook("componentDidMount", componentDidMountHook);
	    hooks.appendHook("componentDidUpdate", componentDidUpdateHook);
	    hooks.appendHook("componentWillUnmount", componentWillUnmountHook);
	}
	
	function unregister() {
	    if (registered) {
	        hooks.removeHook("componentDidMount", componentDidMountHook);
	        hooks.removeHook("componentDidUpdate", componentDidUpdateHook);
	        hooks.removeHook("componentWillUnmount", componentWillUnmountHook);
	
	        delete __REACT_DEVTOOLS_GLOBAL_HOOK__._renderers[registered];
	        registered = false;
	    }
	}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ })
/******/ ])
});
;
//# sourceMappingURL=vrdom-devtools.js.map
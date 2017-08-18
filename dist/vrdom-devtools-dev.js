(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vrdomDev"));
	else if(typeof define === 'function' && define.amd)
		define(["vrdom-dev"], factory);
	else if(typeof exports === 'object')
		exports["vrdomDevtoolsDev"] = factory(require("vrdomDev"));
	else
		root["vrdomDevtoolsDev"] = factory(root["vrdomDev"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_88__) {
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
	
	if (typeof Symbol !== "function" || !Symbol.iterator) {
	    __webpack_require__(1);
	}
	
	var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
	
	if (typeof Map !== "function" || typeof Map.prototype[ITERATOR_SYMBOL] !== "function") {
	    __webpack_require__(55);
	}
	
	var vrdom = __webpack_require__(88),
	    expando = vrdom.expando,
	    nodeMap = vrdom.nodeMap,
	    functions = vrdom.functions,
	    getDisplayName = functions.getDisplayName,
	    hasProp = functions.hasProp,
	    hooks = vrdom.hooks;
	
	/**
	 * Transform a virtual node to a ReactDOMComponent compatible object
	 * 
	 * @param  {VirtualNode|VirtualText|ComponentWidget} vnode Virtual node to transform
	 * @param  {ReactInternalInstance}                   inst  Transformed object
	 * 
	 * @return {ReactInternalInstance}                   Transformed object
	 */
	function toReactDOMComponent(vnode, inst) {
	    var _tag = vnode.type;
	    var _currentElement = vnode.element;
	    var children = vnode.children;
	    var _hostNode = vnode.node;
	    var _renderedChildren = void 0;
	
	    if (children !== null && "object" === typeof children) {
	        _renderedChildren = [];
	        for (var canonicalKey in children) {
	            // eslint-disable-line guard-for-in
	            _renderedChildren.push(toReactComponent(children[canonicalKey]));
	        }
	    }
	
	    Object.assign(inst, {
	        // --- ReactDOMComponent interface
	        getName: function getName() {
	            return _tag;
	        },
	
	        _currentElement: _currentElement,
	        _hostNode: _hostNode,
	        _renderedChildren: _renderedChildren,
	
	        _inDevTools: false,
	        vnode: vnode
	    });
	
	    return inst;
	}
	
	/**
	 * Transform a virtual node to a ReactTextComponent compatible object
	 * 
	 * @param  {VirtualNode|VirtualText|ComponentWidget} vnode Virtual node to transform
	 * @param  {ReactInternalInstance}                   inst  Transformed object
	 * 
	 * @return {ReactInternalInstance}                   Transformed object
	 */
	function toReactTextComponent(vnode, inst) {
	    Object.assign(inst, {
	        _currentElement: vnode.text,
	        _stringText: vnode.text,
	        _hostNode: vnode.node,
	
	        _inDevTools: false,
	        vnode: vnode
	    });
	
	    return inst;
	}
	
	/**
	 * Transform a virtual node to a ReactCompositeComponent compatible object
	 * 
	 * @param  {VirtualNode|VirtualText|ComponentWidget} vnode Virtual node to transform
	 * @param  {ReactInternalInstance}                   inst  Transformed object
	 * 
	 * @return {ReactInternalInstance}                   Transformed object
	 */
	function toReactCompositeComponent(vnode, inst) {
	    // forceUpdate set _currentElement
	    if (!hasProp.call(inst, "_currentElement")) {
	        Object.defineProperty(inst, "_currentElement", {
	            enumerable: true, // available in for ... in
	            configurable: true, // can be deleted and reconfigured
	
	            get: function get() {
	                return this.vnode && this.vnode.element;
	            },
	
	            set: function set(element) {
	                this.vnode.element = element;
	            }
	        });
	    }
	
	    var isStateless = vnode.thunk._type === "Stateless";
	    var _instance = vnode.thunk.component;
	    var _currentElement = vnode.element;
	    var _context = void 0;
	
	    if (isStateless) {
	        _context = vnode.context;
	        _instance = {
	            context: _context,
	            props: _currentElement.props,
	            refs: {},
	            state: null
	        };
	    }
	
	    var name = getDisplayName(_currentElement.type);
	
	    Object.assign(inst, {
	        getName: function getName() {
	            return name;
	        },
	
	        _hostNode: vnode.node,
	        _context: _context,
	        _instance: _instance,
	        _renderedComponent: toReactComponent(vnode.thunk.vnode),
	
	        vnode: vnode
	    });
	
	    return inst;
	}
	
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
	        // _hostContainerInfo: getHostContainerInfo(vnode)
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
	
	    if (vnode.isWidget) {
	        toReactCompositeComponent(vnode, inst);
	    } else if (vnode.isVNode) {
	        toReactDOMComponent(vnode, inst);
	    } else {
	        toReactTextComponent(vnode, inst);
	    }
	
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
	    if (instance._renderedComponent) {
	        visitNonCompositeChildren(instance._renderedComponent, visitor);
	    } else if (hasProp.call(instance, "_renderedChildren")) {
	        visitor(instance);
	
	        if (Array.isArray(instance._renderedChildren)) {
	            instance._renderedChildren.forEach(function (childInst) {
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
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(2);
	__webpack_require__(51);
	__webpack_require__(53);
	__webpack_require__(54);
	module.exports = __webpack_require__(8).Symbol;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	
	var global = __webpack_require__(3);
	var has = __webpack_require__(4);
	var DESCRIPTORS = __webpack_require__(5);
	var $export = __webpack_require__(7);
	var redefine = __webpack_require__(17);
	var META = __webpack_require__(21).KEY;
	var $fails = __webpack_require__(6);
	var shared = __webpack_require__(22);
	var setToStringTag = __webpack_require__(23);
	var uid = __webpack_require__(18);
	var wks = __webpack_require__(24);
	var wksExt = __webpack_require__(25);
	var wksDefine = __webpack_require__(26);
	var keyOf = __webpack_require__(28);
	var enumKeys = __webpack_require__(41);
	var isArray = __webpack_require__(44);
	var anObject = __webpack_require__(11);
	var toIObject = __webpack_require__(31);
	var toPrimitive = __webpack_require__(15);
	var createDesc = __webpack_require__(16);
	var _create = __webpack_require__(45);
	var gOPNExt = __webpack_require__(48);
	var $GOPD = __webpack_require__(50);
	var $DP = __webpack_require__(10);
	var $keys = __webpack_require__(29);
	var gOPD = $GOPD.f;
	var dP = $DP.f;
	var gOPN = gOPNExt.f;
	var $Symbol = global.Symbol;
	var $JSON = global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE = 'prototype';
	var HIDDEN = wks('_hidden');
	var TO_PRIMITIVE = wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = shared('symbol-registry');
	var AllSymbols = shared('symbols');
	var OPSymbols = shared('op-symbols');
	var ObjectProto = Object[PROTOTYPE];
	var USE_NATIVE = typeof $Symbol == 'function';
	var QObject = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
	
	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function () {
	  return _create(dP({}, 'a', {
	    get: function get() {
	      return dP(this, 'a', { value: 7 }).a;
	    }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD(ObjectProto, key);
	  if (protoDesc) delete ObjectProto[key];
	  dP(it, key, D);
	  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
	} : dP;
	
	var wrap = function wrap(tag) {
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};
	
	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};
	
	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if (has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _create(D, { enumerable: createDesc(0, false) });
	    }return setSymbolDesc(it, key, D);
	  }return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) {
	    $defineProperty(it, key = keys[i++], P[key]);
	  }return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = toIObject(it);
	  key = toPrimitive(key, true);
	  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
	  var D = gOPD(it, key);
	  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN(toIObject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  }return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto;
	  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
	  }return result;
	};
	
	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function $set(value) {
	      if (this === ObjectProto) $set.call(OPSymbols, value);
	      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
	    return this._k;
	  });
	
	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f = $defineProperty;
	  __webpack_require__(49).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(43).f = $propertyIsEnumerable;
	  __webpack_require__(42).f = $getOwnPropertySymbols;
	
	  if (DESCRIPTORS && !__webpack_require__(27)) {
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	
	  wksExt.f = function (name) {
	    return wrap(wks(name));
	  };
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });
	
	for (var es6Symbols =
	// 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'.split(','), j = 0; es6Symbols.length > j;) {
	  wks(es6Symbols[j++]);
	}for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) {
	  wksDefine(wellKnownSymbols[k++]);
	}$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function _for(key) {
	    return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key) {
	    if (isSymbol(key)) return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function useSetter() {
	    setter = true;
	  },
	  useSimple: function useSimple() {
	    setter = false;
	  }
	});
	
	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});
	
	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) {
	      args.push(arguments[i++]);
	    }replacer = args[1];
	    if (typeof replacer == 'function') $replacer = replacer;
	    if ($replacer || !isArray(replacer)) replacer = function replacer(key, value) {
	      if ($replacer) value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});
	
	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(9)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self
	// eslint-disable-next-line no-new-func
	: Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(6)(function () {
	  return Object.defineProperty({}, 'a', { get: function get() {
	      return 7;
	    } }).a != 7;
	});

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(3);
	var core = __webpack_require__(8);
	var hide = __webpack_require__(9);
	var redefine = __webpack_require__(17);
	var ctx = __webpack_require__(19);
	var PROTOTYPE = 'prototype';
	
	var $export = function $export(type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
	  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
	  var key, own, out, exp;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // extend global
	    if (target) redefine(target, key, out, type & $export.U);
	    // export
	    if (exports[key] != out) hide(exports, key, exp);
	    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
	  }
	};
	global.core = core;
	// type bitmap
	$export.F = 1; // forced
	$export.G = 2; // global
	$export.S = 4; // static
	$export.P = 8; // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	$export.U = 64; // safe
	$export.R = 128; // real proto method for `library`
	module.exports = $export;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	var core = module.exports = { version: '2.5.0' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(10);
	var createDesc = __webpack_require__(16);
	module.exports = __webpack_require__(5) ? function (object, key, value) {
	  return dP.f(object, key, createDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(11);
	var IE8_DOM_DEFINE = __webpack_require__(13);
	var toPrimitive = __webpack_require__(15);
	var dP = Object.defineProperty;
	
	exports.f = __webpack_require__(5) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return dP(O, P, Attributes);
	  } catch (e) {/* empty */}
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	module.exports = function (it) {
	  if (!isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	module.exports = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(5) && !__webpack_require__(6)(function () {
	  return Object.defineProperty(__webpack_require__(14)('div'), 'a', { get: function get() {
	      return 7;
	    } }).a != 7;
	});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	var document = __webpack_require__(3).document;
	// typeof document.createElement is 'object' in old IE
	var is = isObject(document) && isObject(document.createElement);
	module.exports = function (it) {
	  return is ? document.createElement(it) : {};
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(12);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function (it, S) {
	  if (!isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	module.exports = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(3);
	var hide = __webpack_require__(9);
	var has = __webpack_require__(4);
	var SRC = __webpack_require__(18)('src');
	var TO_STRING = 'toString';
	var $toString = Function[TO_STRING];
	var TPL = ('' + $toString).split(TO_STRING);
	
	__webpack_require__(8).inspectSource = function (it) {
	  return $toString.call(it);
	};
	
	(module.exports = function (O, key, val, safe) {
	  var isFunction = typeof val == 'function';
	  if (isFunction) has(val, 'name') || hide(val, 'name', key);
	  if (O[key] === val) return;
	  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	  if (O === global) {
	    O[key] = val;
	  } else if (!safe) {
	    delete O[key];
	    hide(O, key, val);
	  } else if (O[key]) {
	    O[key] = val;
	  } else {
	    hide(O, key, val);
	  }
	  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString() {
	  return typeof this == 'function' && this[SRC] || $toString.call(this);
	});

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	var id = 0;
	var px = Math.random();
	module.exports = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(20);
	module.exports = function (fn, that, length) {
	  aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };
	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };
	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }
	  return function () /* ...args */{
	    return fn.apply(that, arguments);
	  };
	};

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	module.exports = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	var META = __webpack_require__(18)('meta');
	var isObject = __webpack_require__(12);
	var has = __webpack_require__(4);
	var setDesc = __webpack_require__(10).f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !__webpack_require__(6)(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function setMeta(it) {
	  setDesc(it, META, { value: {
	      i: 'O' + ++id, // object ID
	      w: {} // weak collections IDs
	    } });
	};
	var fastKey = function fastKey(it, create) {
	  // return primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	    // return object ID
	  }return it[META].i;
	};
	var getWeak = function getWeak(it, create) {
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	    // return hash weak collections IDs
	  }return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function onFreeze(it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(3);
	var SHARED = '__core-js_shared__';
	var store = global[SHARED] || (global[SHARED] = {});
	module.exports = function (key) {
	  return store[key] || (store[key] = {});
	};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(10).f;
	var has = __webpack_require__(4);
	var TAG = __webpack_require__(24)('toStringTag');
	
	module.exports = function (it, tag, stat) {
	  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var store = __webpack_require__(22)('wks');
	var uid = __webpack_require__(18);
	var Symbol = __webpack_require__(3).Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(24);

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(3);
	var core = __webpack_require__(8);
	var LIBRARY = __webpack_require__(27);
	var wksExt = __webpack_require__(25);
	var defineProperty = __webpack_require__(10).f;
	module.exports = function (name) {
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
	};

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	module.exports = false;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	var getKeys = __webpack_require__(29);
	var toIObject = __webpack_require__(31);
	module.exports = function (object, el) {
	  var O = toIObject(object);
	  var keys = getKeys(O);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) {
	    if (O[key = keys[index++]] === el) return key;
	  }
	};

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys = __webpack_require__(30);
	var enumBugKeys = __webpack_require__(40);
	
	module.exports = Object.keys || function keys(O) {
	  return $keys(O, enumBugKeys);
	};

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	var has = __webpack_require__(4);
	var toIObject = __webpack_require__(31);
	var arrayIndexOf = __webpack_require__(35)(false);
	var IE_PROTO = __webpack_require__(39)('IE_PROTO');
	
	module.exports = function (object, names) {
	  var O = toIObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) {
	    if (key != IE_PROTO) has(O, key) && result.push(key);
	  } // Don't enum bug & hidden keys
	  while (names.length > i) {
	    if (has(O, key = names[i++])) {
	      ~arrayIndexOf(result, key) || result.push(key);
	    }
	  }return result;
	};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(32);
	var defined = __webpack_require__(34);
	module.exports = function (it) {
	  return IObject(defined(it));
	};

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(33);
	// eslint-disable-next-line no-prototype-builtins
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ }),
/* 33 */
/***/ (function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function (it) {
	  return toString.call(it).slice(8, -1);
	};

/***/ }),
/* 34 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(31);
	var toLength = __webpack_require__(36);
	var toAbsoluteIndex = __webpack_require__(38);
	module.exports = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	      // Array#indexOf ignores holes, Array#includes - not
	    } else for (; length > index; index++) {
	      if (IS_INCLUDES || index in O) {
	        if (O[index] === el) return IS_INCLUDES || index || 0;
	      }
	    }return !IS_INCLUDES && -1;
	  };
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(37);
	var min = Math.min;
	module.exports = function (it) {
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ }),
/* 37 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	module.exports = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(37);
	var max = Math.max;
	var min = Math.min;
	module.exports = function (index, length) {
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(22)('keys');
	var uid = __webpack_require__(18);
	module.exports = function (key) {
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ }),
/* 40 */
/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(',');

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(29);
	var gOPS = __webpack_require__(42);
	var pIE = __webpack_require__(43);
	module.exports = function (it) {
	  var result = getKeys(it);
	  var getSymbols = gOPS.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = pIE.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) {
	      if (isEnum.call(it, key = symbols[i++])) result.push(key);
	    }
	  }return result;
	};

/***/ }),
/* 42 */
/***/ (function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(33);
	module.exports = Array.isArray || function isArray(arg) {
	  return cof(arg) == 'Array';
	};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject = __webpack_require__(11);
	var dPs = __webpack_require__(46);
	var enumBugKeys = __webpack_require__(40);
	var IE_PROTO = __webpack_require__(39)('IE_PROTO');
	var Empty = function Empty() {/* empty */};
	var PROTOTYPE = 'prototype';
	
	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var _createDict = function createDict() {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(14)('iframe');
	  var i = enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(47).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  _createDict = iframeDocument.F;
	  while (i--) {
	    delete _createDict[PROTOTYPE][enumBugKeys[i]];
	  }return _createDict();
	};
	
	module.exports = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = _createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(10);
	var anObject = __webpack_require__(11);
	var getKeys = __webpack_require__(29);
	
	module.exports = __webpack_require__(5) ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = getKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) {
	    dP.f(O, P = keys[i++], Properties[P]);
	  }return O;
	};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	var document = __webpack_require__(3).document;
	module.exports = document && document.documentElement;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(31);
	var gOPN = __webpack_require__(49).f;
	var toString = {}.toString;
	
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function getWindowNames(it) {
	  try {
	    return gOPN(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};
	
	module.exports.f = function getOwnPropertyNames(it) {
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys = __webpack_require__(30);
	var hiddenKeys = __webpack_require__(40).concat('length', 'prototype');
	
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return $keys(O, hiddenKeys);
	};

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	var pIE = __webpack_require__(43);
	var createDesc = __webpack_require__(16);
	var toIObject = __webpack_require__(31);
	var toPrimitive = __webpack_require__(15);
	var has = __webpack_require__(4);
	var IE8_DOM_DEFINE = __webpack_require__(13);
	var gOPD = Object.getOwnPropertyDescriptor;
	
	exports.f = __webpack_require__(5) ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if (IE8_DOM_DEFINE) try {
	    return gOPD(O, P);
	  } catch (e) {/* empty */}
	  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.3.6 Object.prototype.toString()
	
	var classof = __webpack_require__(52);
	var test = {};
	test[__webpack_require__(24)('toStringTag')] = 'z';
	if (test + '' != '[object z]') {
	  __webpack_require__(17)(Object.prototype, 'toString', function toString() {
	    return '[object ' + classof(this) + ']';
	  }, true);
	}

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(33);
	var TAG = __webpack_require__(24)('toStringTag');
	// ES3 wrong here
	var ARG = cof(function () {
	  return arguments;
	}()) == 'Arguments';
	
	// fallback for IE11 Script Access Denied error
	var tryGet = function tryGet(it, key) {
	  try {
	    return it[key];
	  } catch (e) {/* empty */}
	};
	
	module.exports = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	  // @@toStringTag case
	  : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	  // builtinTag case
	  : ARG ? cof(O)
	  // ES3 arguments fallback
	  : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(26)('asyncIterator');

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(26)('observable');

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(51);
	__webpack_require__(56);
	__webpack_require__(63);
	__webpack_require__(67);
	__webpack_require__(81);
	__webpack_require__(84);
	__webpack_require__(86);
	module.exports = __webpack_require__(8).Map;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var $at = __webpack_require__(57)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(58)(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0; // next index
	  // 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(37);
	var defined = __webpack_require__(34);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(defined(that));
	    var i = toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var LIBRARY = __webpack_require__(27);
	var $export = __webpack_require__(7);
	var redefine = __webpack_require__(17);
	var hide = __webpack_require__(9);
	var has = __webpack_require__(4);
	var Iterators = __webpack_require__(59);
	var $iterCreate = __webpack_require__(60);
	var setToStringTag = __webpack_require__(23);
	var getPrototypeOf = __webpack_require__(61);
	var ITERATOR = __webpack_require__(24)('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';
	
	var returnThis = function returnThis() {
	  return this;
	};
	
	module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function getMethod(kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS:
	        return function keys() {
	          return new Constructor(this, kind);
	        };
	      case VALUES:
	        return function values() {
	          return new Constructor(this, kind);
	        };
	    }return function entries() {
	      return new Constructor(this, kind);
	    };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() {
	      return $native.call(this);
	    };
	  }
	  // Define iterator
	  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ }),
/* 59 */
/***/ (function(module, exports) {

	module.exports = {};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var create = __webpack_require__(45);
	var descriptor = __webpack_require__(16);
	var setToStringTag = __webpack_require__(23);
	var IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(9)(IteratorPrototype, __webpack_require__(24)('iterator'), function () {
	  return this;
	});
	
	module.exports = function (Constructor, NAME, next) {
	  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has = __webpack_require__(4);
	var toObject = __webpack_require__(62);
	var IE_PROTO = __webpack_require__(39)('IE_PROTO');
	var ObjectProto = Object.prototype;
	
	module.exports = Object.getPrototypeOf || function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO)) return O[IE_PROTO];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  }return O instanceof Object ? ObjectProto : null;
	};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(34);
	module.exports = function (it) {
	  return Object(defined(it));
	};

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	var $iterators = __webpack_require__(64);
	var getKeys = __webpack_require__(29);
	var redefine = __webpack_require__(17);
	var global = __webpack_require__(3);
	var hide = __webpack_require__(9);
	var Iterators = __webpack_require__(59);
	var wks = __webpack_require__(24);
	var ITERATOR = wks('iterator');
	var TO_STRING_TAG = wks('toStringTag');
	var ArrayValues = Iterators.Array;
	
	var DOMIterables = {
	  CSSRuleList: true, // TODO: Not spec compliant, should be false.
	  CSSStyleDeclaration: false,
	  CSSValueList: false,
	  ClientRectList: false,
	  DOMRectList: false,
	  DOMStringList: false,
	  DOMTokenList: true,
	  DataTransferItemList: false,
	  FileList: false,
	  HTMLAllCollection: false,
	  HTMLCollection: false,
	  HTMLFormElement: false,
	  HTMLSelectElement: false,
	  MediaList: true, // TODO: Not spec compliant, should be false.
	  MimeTypeArray: false,
	  NamedNodeMap: false,
	  NodeList: true,
	  PaintRequestList: false,
	  Plugin: false,
	  PluginArray: false,
	  SVGLengthList: false,
	  SVGNumberList: false,
	  SVGPathSegList: false,
	  SVGPointList: false,
	  SVGStringList: false,
	  SVGTransformList: false,
	  SourceBufferList: false,
	  StyleSheetList: true, // TODO: Not spec compliant, should be false.
	  TextTrackCueList: false,
	  TextTrackList: false,
	  TouchList: false
	};
	
	for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
	  var NAME = collections[i];
	  var explicit = DOMIterables[NAME];
	  var Collection = global[NAME];
	  var proto = Collection && Collection.prototype;
	  var key;
	  if (proto) {
	    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
	    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
	    Iterators[NAME] = ArrayValues;
	    if (explicit) for (key in $iterators) {
	      if (!proto[key]) redefine(proto, key, $iterators[key], true);
	    }
	  }
	}

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var addToUnscopables = __webpack_require__(65);
	var step = __webpack_require__(66);
	var Iterators = __webpack_require__(59);
	var toIObject = __webpack_require__(31);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(58)(Array, 'Array', function (iterated, kind) {
	  this._t = toIObject(iterated); // target
	  this._i = 0; // next index
	  this._k = kind; // kind
	  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return step(1);
	  }
	  if (kind == 'keys') return step(0, index);
	  if (kind == 'values') return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = __webpack_require__(24)('unscopables');
	var ArrayProto = Array.prototype;
	if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(9)(ArrayProto, UNSCOPABLES, {});
	module.exports = function (key) {
	  ArrayProto[UNSCOPABLES][key] = true;
	};

/***/ }),
/* 66 */
/***/ (function(module, exports) {

	module.exports = function (done, value) {
	  return { value: value, done: !!done };
	};

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var strong = __webpack_require__(68);
	var validate = __webpack_require__(76);
	var MAP = 'Map';
	
	// 23.1 Map Objects
	module.exports = __webpack_require__(77)(MAP, function (get) {
	  return function Map() {
	    return get(this, arguments.length > 0 ? arguments[0] : undefined);
	  };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key) {
	    var entry = strong.getEntry(validate(this, MAP), key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value) {
	    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var dP = __webpack_require__(10).f;
	var create = __webpack_require__(45);
	var redefineAll = __webpack_require__(69);
	var ctx = __webpack_require__(19);
	var anInstance = __webpack_require__(70);
	var forOf = __webpack_require__(71);
	var $iterDefine = __webpack_require__(58);
	var step = __webpack_require__(66);
	var setSpecies = __webpack_require__(75);
	var DESCRIPTORS = __webpack_require__(5);
	var fastKey = __webpack_require__(21).fastKey;
	var validate = __webpack_require__(76);
	var SIZE = DESCRIPTORS ? '_s' : 'size';
	
	var getEntry = function getEntry(that, key) {
	  // fast case
	  var index = fastKey(key);
	  var entry;
	  if (index !== 'F') return that._i[index];
	  // frozen object case
	  for (entry = that._f; entry; entry = entry.n) {
	    if (entry.k == key) return entry;
	  }
	};
	
	module.exports = {
	  getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, NAME, '_i');
	      that._t = NAME; // collection type
	      that._i = create(null); // index
	      that._f = undefined; // first entry
	      that._l = undefined; // last entry
	      that[SIZE] = 0; // size
	      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
	          entry.r = true;
	          if (entry.p) entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function _delete(key) {
	        var that = validate(this, NAME);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.n;
	          var prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if (prev) prev.n = next;
	          if (next) next.p = prev;
	          if (that._f == entry) that._f = next;
	          if (that._l == entry) that._l = prev;
	          that[SIZE]--;
	        }return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        validate(this, NAME);
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;
	        while (entry = entry ? entry.n : this._f) {
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while (entry && entry.r) {
	            entry = entry.p;
	          }
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(validate(this, NAME), key);
	      }
	    });
	    if (DESCRIPTORS) dP(C.prototype, 'size', {
	      get: function get() {
	        return validate(this, NAME)[SIZE];
	      }
	    });
	    return C;
	  },
	  def: function def(that, key, value) {
	    var entry = getEntry(that, key);
	    var prev, index;
	    // change existing entry
	    if (entry) {
	      entry.v = value;
	      // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key, // <- key
	        v: value, // <- value
	        p: prev = that._l, // <- previous entry
	        n: undefined, // <- next entry
	        r: false // <- removed
	      };
	      if (!that._f) that._f = entry;
	      if (prev) prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if (index !== 'F') that._i[index] = entry;
	    }return that;
	  },
	  getEntry: getEntry,
	  setStrong: function setStrong(C, NAME, IS_MAP) {
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function (iterated, kind) {
	      this._t = validate(iterated, NAME); // target
	      this._k = kind; // kind
	      this._l = undefined; // previous
	    }, function () {
	      var that = this;
	      var kind = that._k;
	      var entry = that._l;
	      // revert to the last existing entry
	      while (entry && entry.r) {
	        entry = entry.p;
	      } // get next entry
	      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if (kind == 'keys') return step(0, entry.k);
	      if (kind == 'values') return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
	
	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	var redefine = __webpack_require__(17);
	module.exports = function (target, src, safe) {
	  for (var key in src) {
	    redefine(target, key, src[key], safe);
	  }return target;
	};

/***/ }),
/* 70 */
/***/ (function(module, exports) {

	module.exports = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || forbiddenField !== undefined && forbiddenField in it) {
	    throw TypeError(name + ': incorrect invocation!');
	  }return it;
	};

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx = __webpack_require__(19);
	var call = __webpack_require__(72);
	var isArrayIter = __webpack_require__(73);
	var anObject = __webpack_require__(11);
	var toLength = __webpack_require__(36);
	var getIterFn = __webpack_require__(74);
	var BREAK = {};
	var RETURN = {};
	var _exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () {
	    return iterable;
	  } : getIterFn(iterable);
	  var f = ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = call(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	_exports.BREAK = BREAK;
	_exports.RETURN = RETURN;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(11);
	module.exports = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	    // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators = __webpack_require__(59);
	var ITERATOR = __webpack_require__(24)('iterator');
	var ArrayProto = Array.prototype;
	
	module.exports = function (it) {
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	var classof = __webpack_require__(52);
	var ITERATOR = __webpack_require__(24)('iterator');
	var Iterators = __webpack_require__(59);
	module.exports = __webpack_require__(8).getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
	};

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var global = __webpack_require__(3);
	var dP = __webpack_require__(10);
	var DESCRIPTORS = __webpack_require__(5);
	var SPECIES = __webpack_require__(24)('species');
	
	module.exports = function (KEY) {
	  var C = global[KEY];
	  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
	    configurable: true,
	    get: function get() {
	      return this;
	    }
	  });
	};

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	module.exports = function (it, TYPE) {
	  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
	  return it;
	};

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var global = __webpack_require__(3);
	var $export = __webpack_require__(7);
	var redefine = __webpack_require__(17);
	var redefineAll = __webpack_require__(69);
	var meta = __webpack_require__(21);
	var forOf = __webpack_require__(71);
	var anInstance = __webpack_require__(70);
	var isObject = __webpack_require__(12);
	var fails = __webpack_require__(6);
	var $iterDetect = __webpack_require__(78);
	var setToStringTag = __webpack_require__(23);
	var inheritIfRequired = __webpack_require__(79);
	
	module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
	  var Base = global[NAME];
	  var C = Base;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var proto = C && C.prototype;
	  var O = {};
	  var fixMethod = function fixMethod(KEY) {
	    var fn = proto[KEY];
	    redefine(proto, KEY, KEY == 'delete' ? function (a) {
	      return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
	    } : KEY == 'has' ? function has(a) {
	      return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
	    } : KEY == 'get' ? function get(a) {
	      return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
	    } : KEY == 'add' ? function add(a) {
	      fn.call(this, a === 0 ? 0 : a);return this;
	    } : function set(a, b) {
	      fn.call(this, a === 0 ? 0 : a, b);return this;
	    });
	  };
	  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
	    new C().entries().next();
	  }))) {
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	    meta.NEED = true;
	  } else {
	    var instance = new C();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
	    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = fails(function () {
	      instance.has(1);
	    });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    var ACCEPT_ITERABLES = $iterDetect(function (iter) {
	      new C(iter);
	    }); // eslint-disable-line no-new
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new C();
	      var index = 5;
	      while (index--) {
	        $instance[ADDER](index, index);
	      }return !$instance.has(-0);
	    });
	    if (!ACCEPT_ITERABLES) {
	      C = wrapper(function (target, iterable) {
	        anInstance(target, C, NAME);
	        var that = inheritIfRequired(new Base(), target, C);
	        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
	        return that;
	      });
	      C.prototype = proto;
	      proto.constructor = C;
	    }
	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }
	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
	    // weak collections should not contains .clear method
	    if (IS_WEAK && proto.clear) delete proto.clear;
	  }
	
	  setToStringTag(C, NAME);
	
	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F * (C != Base), O);
	
	  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
	
	  return C;
	};

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR = __webpack_require__(24)('iterator');
	var SAFE_CLOSING = false;
	
	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function () {
	    SAFE_CLOSING = true;
	  };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(riter, function () {
	    throw 2;
	  });
	} catch (e) {/* empty */}
	
	module.exports = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR]();
	    iter.next = function () {
	      return { done: safe = true };
	    };
	    arr[ITERATOR] = function () {
	      return iter;
	    };
	    exec(arr);
	  } catch (e) {/* empty */}
	  return safe;
	};

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	var setPrototypeOf = __webpack_require__(80).set;
	module.exports = function (that, target, C) {
	  var S = target.constructor;
	  var P;
	  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
	    setPrototypeOf(that, P);
	  }return that;
	};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var isObject = __webpack_require__(12);
	var anObject = __webpack_require__(11);
	var check = function check(O, proto) {
	  anObject(O);
	  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	  function (test, buggy, set) {
	    try {
	      set = __webpack_require__(19)(Function.call, __webpack_require__(50).f(Object.prototype, '__proto__').set, 2);
	      set(test, []);
	      buggy = !(test instanceof Array);
	    } catch (e) {
	      buggy = true;
	    }
	    return function setPrototypeOf(O, proto) {
	      check(O, proto);
	      if (buggy) O.__proto__ = proto;else set(O, proto);
	      return O;
	    };
	  }({}, false) : undefined),
	  check: check
	};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export = __webpack_require__(7);
	
	$export($export.P + $export.R, 'Map', { toJSON: __webpack_require__(82)('Map') });

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var classof = __webpack_require__(52);
	var from = __webpack_require__(83);
	module.exports = function (NAME) {
	  return function toJSON() {
	    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
	    return from(this);
	  };
	};

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

	var forOf = __webpack_require__(71);
	
	module.exports = function (iter, ITERATOR) {
	  var result = [];
	  forOf(iter, false, result.push, result, ITERATOR);
	  return result;
	};

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
	__webpack_require__(85)('Map');

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// https://tc39.github.io/proposal-setmap-offrom/
	
	var $export = __webpack_require__(7);
	
	module.exports = function (COLLECTION) {
	  $export($export.S, COLLECTION, { of: function of() {
	      var length = arguments.length;
	      var A = Array(length);
	      while (length--) {
	        A[length] = arguments[length];
	      }return new this(A);
	    } });
	};

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
	__webpack_require__(87)('Map');

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// https://tc39.github.io/proposal-setmap-offrom/
	
	var $export = __webpack_require__(7);
	var aFunction = __webpack_require__(20);
	var ctx = __webpack_require__(19);
	var forOf = __webpack_require__(71);
	
	module.exports = function (COLLECTION) {
	  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
	      var mapFn = arguments[1];
	      var mapping, A, n, cb;
	      aFunction(this);
	      mapping = mapFn !== undefined;
	      if (mapping) aFunction(mapFn);
	      if (source == undefined) return new this();
	      A = [];
	      if (mapping) {
	        n = 0;
	        cb = ctx(mapFn, arguments[2], 2);
	        forOf(source, false, function (nextItem) {
	          A.push(cb(nextItem, n++));
	        });
	      } else {
	        forOf(source, false, A.push, A);
	      }
	      return new this(A);
	    } });
	};

/***/ }),
/* 88 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_88__;

/***/ })
/******/ ])
});
;
//# sourceMappingURL=vrdom-devtools-dev.js.map
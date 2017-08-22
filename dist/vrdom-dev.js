(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["vrdomDev"] = factory();
	else
		root["vrdomDev"] = factory();
})(this, function() {
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

	var Component = __webpack_require__(1),
	    destroyers = __webpack_require__(26),
	    HTMLElements = __webpack_require__(56).elements,
	    expando = __webpack_require__(2),
	    validateProperties = __webpack_require__(73),
	    slice = Array.prototype.slice;
	
	var hooks = __webpack_require__(45),
	    getHooks = hooks.getHooks;
	
	var Renderer = __webpack_require__(44),
	    nodeMap = Renderer._nodeMap;
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	var functions = __webpack_require__(3),
	
	////////////////////////////////////////////////////////////////////
	getDisplayName = functions.getDisplayName,
	    getDisplayRender = functions.getDisplayRender,
	    flattenChildren = functions.flattenChildren,
	
	//////////
	assign = functions.assign,
	    extendWithoutUndefined = functions.extendWithoutUndefined,
	    implement = functions.implement,
	    hasProp = functions.hasProp,
	    inherits = functions.inherits,
	    isObject = functions.isObject;
	
	exports.createClass = function createClass(spec) {
	
	    function ComponentClass() {
	        var autobinds = this[expando + "_autobinds"];
	
	        // eslint-disable-next-line guard-for-in
	        for (var method in autobinds) {
	            this[method] = autobind(this, method);
	        }
	
	        ComponentClass.__super__.constructor.apply(this, arguments);
	
	        this.state = null;
	        var initialState = this.getInitialState ? this.getInitialState() : null;
	
	        ////////////////////////////////////////////////////////////////////
	        if ("object" !== typeof initialState || Array.isArray(initialState)) {
	            var msg = translator.translate("errors.invalid-initialState", getDisplayName(this));
	            throw new Error(msg);
	        }
	        //////////
	
	        this.state = initialState;
	    }
	
	    inherits(ComponentClass, Component);
	    ComponentClass.displayName = "Component";
	    ComponentClass.prototype[expando + "_autobinds"] = {};
	
	    ComponentClass.prototype.replaceState = function (state, callback) {
	        Renderer.updateState("replaceState", this, [state], true, callback);
	    };
	
	    ComponentClass.prototype.isMounted = function () {
	        ////////////////////////////////////////////////////////////////////
	        if (Renderer._currentOwner && this === Renderer._currentOwner) {
	            var msg = translator.translate("errors.is-mounted-in-render", getDisplayName(this), getDisplayRender(this));
	            console.error(msg);
	        }
	        //////////
	        return hasProp.call(this, expando) && hasProp.call(this[expando], "vrdomID") && hasProp.call(nodeMap, this[expando].vrdomID);
	    };
	
	    implement(ComponentClass, spec);
	
	    if (ComponentClass.getDefaultProps) {
	        ComponentClass.defaultProps = ComponentClass.getDefaultProps();
	        delete ComponentClass.getDefaultProps;
	    }
	
	    ////////////////////////////////////////////////////////////////////
	    if ("function" !== typeof ComponentClass.prototype.render) {
	        var msg = translator.translate("errors.undefined-render-method");
	        throw new Error(msg);
	    }
	    //////////
	
	    return ComponentClass;
	};
	
	exports.createFactory = createFactory;
	
	function createFactory(type) {
	    return createElement.bind(null, type);
	}
	
	exports.createElement = createElement;
	
	function createElement(type) {
	    var args = slice.call(arguments);
	
	    var fns = getHooks("beforeCreateElement", type).concat(getHooks("beforeCreateElement"));
	    for (var i = 0, len = fns.length; i < len; i++) {
	        args = fns[i](args);
	        if (!Array.isArray(args)) {
	            return;
	        }
	    }
	
	    var vnodeArgs = toVNodeArgs.apply(null, args),
	        config = vnodeArgs[1],
	        children = vnodeArgs[2];
	    type = vnodeArgs[0];
	
	    ////////////////////////////////////////////////////////////////////
	    var elType = typeof type;
	    var msg;
	    if (elType !== "function" && elType !== "string") {
	        msg = translator.translate("errors.invalid-type", "vrdom.createElement(...)");
	        console.error(msg);
	    }
	
	    if ("function" === elType && "function" === typeof type.getDefaultProps) {
	        msg = translator.translate("errors.defaultProps-outside-createClass", getDisplayName(type));
	        console.error(msg);
	    }
	    //////////
	
	    var _currentOwner = Renderer._currentOwner;
	    var key = config.key,
	        ref = config.ref;
	
	    var el = {
	        type: type,
	        props: computeProps(type, config, children, _currentOwner),
	        key: key,
	        ref: ref,
	        _owner: _currentOwner ? {
	            _instance: _currentOwner
	        } : null,
	        expando: expando
	    };
	
	    fns = getHooks("afterCreateElement", type).concat(getHooks("afterCreateElement"));
	    for (var j = 0, len1 = fns.length; j < len1; j++) {
	        el = fns[j](el, args);
	        if (!el) {
	            return el; // eslint-disable-line consistent-return
	        }
	    }
	
	    return el; // eslint-disable-line consistent-return
	}
	
	exports.cloneElement = cloneElement;
	
	function cloneElement(element, config) {
	    var type = element.type,
	        props = element.props,
	        key = element.key,
	        ref = element.ref,
	        _owner = element._owner;
	
	    var args = slice.call(arguments);
	
	    args[0] = type;
	    props = assign({}, props, config);
	    args[1] = props;
	
	    var cloned = exports.createElement.apply(exports, args);
	
	    // owner is preserved if ref is not overrided
	    if (!config || !hasProp.call(config, "ref") || config.ref == null) {
	        cloned._owner = _owner;
	    }
	
	    var _key, _ref;
	
	    if (config) {
	        _key = config.key;
	        _ref = config.ref;
	    }
	
	    if (_key === undefined) {
	        cloned.key = key;
	    }
	
	    if (_ref === undefined) {
	        cloned.ref = ref;
	    }
	
	    return cloned;
	}
	
	function autobind(component, method) {
	    var fBound = component[method].bind(component);
	
	    ////////////////////////////////////////////////////////////////////
	    var displayName = getDisplayName(component);
	    var nativeBind = fBound.bind;
	
	    fBound.bind = function (context) {
	        var msg;
	        if (context != null && context !== component) {
	            msg = "Warning: " + translator.translate("errors.rebind-context", displayName, method);
	            console.error(msg);
	        } else if (arguments.length === 1) {
	            msg = "Warning: " + translator.translate("errors.rebind-autobind", displayName, method);
	            console.error(msg);
	        }
	        return nativeBind.apply(fBound, arguments);
	    };
	    //////////
	
	    return fBound;
	}
	
	function computeProps(type, config, children, owner) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    var props;
	
	    if ("function" === typeof type) {
	        props = assign({}, type.defaultProps);
	    } else {
	        props = {};
	    }
	
	    extendWithoutUndefined(props, config);
	
	    if (isObject(props.style) && !Array.isArray(props.style)) {
	        props.style = assign({}, props.style);
	    }
	
	    delete props.key;
	    delete props.ref;
	
	    if (type === "textarea" && children != null) {
	        ////////////////////////////////////////////////////////////////////
	        msg = translator.translate("errors.textarea-children");
	        console.error(msg);
	        //////////
	
	        if (Array.isArray(children)) {
	            ////////////////////////////////////////////////////////////////////
	            if (children.length > 1) {
	                msg = translator.translate("errors.textarea-multiple-children");
	                throw new Error(msg);
	            }
	            //////////
	            children = children[0];
	        }
	
	        props.defaultValue = String(children);
	        delete props.children;
	    }
	
	    validateProperties(type, props, children, owner);
	
	    return props;
	}
	
	function toVNodeArgs(type, config) {
	    /*eslint no-eq-null: 0, eqeqeq: 0*/
	    var children = 3 <= arguments.length ? slice.call(arguments, 2) : [];
	    config = assign({}, config);
	
	    var key = config.key,
	        ref = config.ref;
	
	    if (key === undefined) {
	        config.key = null;
	    } else {
	        config.key = String(key);
	    }
	
	    if (ref === undefined) {
	        config.ref = null;
	    }
	
	    ////////////////////////////////////////////////////////////////////
	    var topFlat = false;
	    //////////
	
	    if (children.length === 0) {
	        if (config.children != null) {
	            ////////////////////////////////////////////////////////////////////
	            topFlat = true;
	            //////////
	            children = config.children;
	        } else {
	            children = undefined;
	        }
	    } else if (children.length === 1) {
	        ////////////////////////////////////////////////////////////////////
	        topFlat = true;
	        //////////
	        children = children[0];
	    }
	
	    config.children = children;
	
	    ////////////////////////////////////////////////////////////////////
	    if (children != null) {
	        var options = {
	            prefix: "RootID",
	            ignoreError: true,
	            checkDuplicate: false,
	            warnKey: true
	        };
	
	        if (topFlat) {
	            flattenChildren(children, {}, type, options, Renderer._currentOwner);
	        } else {
	            for (var i = 0, len = children.length; i < len; i++) {
	                flattenChildren(children[i], {}, type, options, Renderer._currentOwner);
	            }
	        }
	    }
	    //////////
	
	    return [type, config, children];
	}
	
	assign(exports, {
	    nodeMap: nodeMap,
	    isValidElement: functions.isValidElement,
	    render: Renderer.render,
	    findDOMNode: Renderer.findDOMNode,
	    findVNodeAtNode: Renderer.findVNodeAtNode,
	    unmountComponentAtNode: Renderer.unmountComponentAtNode,
	    Component: Component,
	    Children: __webpack_require__(75),
	    PropTypes: __webpack_require__(76),
	    expando: expando,
	    hooks: hooks,
	    functions: functions,
	    LinkUtils: __webpack_require__(61),
	    DOM: function () {
	        var DOM = {};
	
	        for (var i = 0, len = HTMLElements.length; i < len; i++) {
	            var tagName = HTMLElements[i];
	            DOM[tagName] = createFactory(tagName);
	        }
	
	        return DOM;
	    }(),
	    reset: function reset() {
	        destroyers.destroy();
	    }
	});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	var uniqueId = __webpack_require__(3).uniqueId;
	
	var Renderer;
	
	module.exports = Component;
	
	function Component(props, context) {
	    this.id = uniqueId("Component");
	    this.props = props;
	    this.context = context;
	    this.refs = {};
	}
	
	Component.prototype[expando + "_isComponent"] = true;
	
	Component.prototype.setState = function (state, callback) {
	    Renderer.updateState("setState", this, [state || {}], false, callback);
	};
	
	Component.prototype.forceUpdate = function (callback) {
	    Renderer.updateState("forceUpdate", this, null, false, callback);
	};
	
	Renderer = __webpack_require__(44);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// http://stackoverflow.com/questions/1497481/javascript-password-generator/16548229#29770068
	module.exports = "_vrdom" + Math.random().toString(36).slice(2); // eslint-disable-line no-magic-numbers

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = {
	    ////////////////////////////////////////////////////////////////////
	    createStringTemplate: __webpack_require__(4),
	    formatArgument: __webpack_require__(5),
	    getDisplayRender: __webpack_require__(7),
	    //////////
	    assign: __webpack_require__(9),
	    attachRef: __webpack_require__(10),
	    clone: __webpack_require__(13),
	    createChainedFunction: __webpack_require__(14),
	    createMergedResultFunction: __webpack_require__(15),
	    extendWithoutUndefined: __webpack_require__(16),
	    flattenChildrenToString: __webpack_require__(17),
	    flattenChildren: __webpack_require__(18),
	    getCanonicalKey: __webpack_require__(19),
	    getDisplayName: __webpack_require__(24),
	    getExpandoData: __webpack_require__(27),
	    getFunctionName: __webpack_require__(6),
	    getIteratorMethod: __webpack_require__(20),
	    getKeyAndPrefixFromCanonicalKey: __webpack_require__(28),
	    getOwnerDocument: __webpack_require__(29),
	    getVNodeFromMap: __webpack_require__(30),
	    hasEditableValue: __webpack_require__(31),
	    hasProp: __webpack_require__(8),
	    implement: __webpack_require__(32),
	    inherits: __webpack_require__(33),
	    isComponentConstructor: __webpack_require__(34),
	    isEventSupported: __webpack_require__(35),
	    isObject: __webpack_require__(21),
	    isValidContainer: __webpack_require__(38),
	    isValidElement: __webpack_require__(22),
	    normalizeCssProp: __webpack_require__(39),
	    normalizeCssProps: __webpack_require__(41),
	    setExpandoData: __webpack_require__(25),
	    uniqueId: __webpack_require__(42),
	    updateNodeMap: __webpack_require__(43)
	};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	var hasProp = Object.prototype.hasOwnProperty;
	
	module.exports = function createStringTemplate(str) {
	    var matcher = /(^|(?!\\).)(\{\d+\})/g;
	    var lastIndex = 0;
	    var placeholders = [];
	    var indexes = {};
	
	    var match, placeholder, index;
	
	    while (match = matcher.exec(str)) {
	        placeholder = str.slice(lastIndex, match.index);
	        if (match[1]) {
	            placeholder += match[1];
	        }
	        if (placeholder !== "") {
	            placeholders.push(placeholder);
	        }
	
	        index = match[2].slice(1, -1);
	        if (hasProp.call(indexes, index)) {
	            indexes[index].push(placeholders.length);
	        } else {
	            indexes[index] = [placeholders.length];
	        }
	
	        placeholders.push(match[2]);
	
	        lastIndex = matcher.lastIndex;
	    }
	
	    placeholder = str.slice(lastIndex);
	    if (placeholder !== "") {
	        placeholders.push(placeholder);
	    }
	
	    return template;
	
	    function template() {
	        var length = arguments.length;
	        var text = placeholders.slice();
	        var value, places;
	
	        // indexes is created by this code,
	        // it is known to be a plain object
	        // no need of guard-for-in
	        // eslint-disable-next-line guard-for-in
	        for (var index in indexes) {
	            if (parseInt(index, 10) < length) {
	                places = indexes[index];
	                value = arguments[index];
	                for (var i = 0, len = places.length; i < len; i++) {
	                    text[places[i]] = String(value);
	                }
	            }
	        }
	
	        return text.join("");
	    }
	};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var getFunctionName = __webpack_require__(6);
	
	module.exports = function formatArgument(arg) {
	    var ref;
	
	    var typeofarg = typeof arg;
	    if (typeofarg !== "object" || Array.isArray(arg)) {
	        return JSON.stringify(arg);
	    }
	
	    var displayName = ((ref = arg.constructor) != null ? getFunctionName(ref) : undefined) || typeofarg;
	    var keys = Object.keys(arg);
	
	    if (keys.length !== 0) {
	        return displayName + " (keys: " + keys.join(", ") + ")";
	    }
	
	    return displayName === "object" || displayName === "Object" ? JSON.stringify(arg) : displayName;
	};

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = function getFunctionName(fn) {
	    if ("name" in fn) {
	        return fn.name;
	    }
	
	    var match = fn.toString().match(/^function\s*([^\s(]+)/);
	    return match && match[1];
	};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = __webpack_require__(8);
	var getFunctionName = __webpack_require__(6);
	
	module.exports = function getDisplayRender(obj) {
	    var displayName, hasRender;
	
	    if ("object" === typeof obj) {
	        if (hasProp.call(obj, "_instance")) {
	            obj = obj._instance;
	        }
	
	        displayName = getDisplayName(obj.constructor);
	        hasRender = "function" === typeof obj.render;
	    } else if ("function" === typeof obj) {
	        displayName = getDisplayName(obj);
	    } else {
	        displayName = obj.name;
	    }
	
	    if (hasRender) {
	        return displayName + ".render()";
	    }
	
	    return displayName + "(...)";
	};
	
	function getDisplayName(Constructor) {
	    if (hasProp.call(Constructor, "displayName")) {
	        return Constructor.displayName;
	    }
	
	    return getFunctionName(Constructor);
	}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports = Object.prototype.hasOwnProperty;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = __webpack_require__(8);
	
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
	module.exports = typeof Object.assign === "function" ? Object.assign /* istanbul ignore next */ : function (target) {
	    "use strict";
	
	    if (target == null) {
	        // TypeError if undefined or null
	        throw new TypeError("Cannot convert undefined or null to object");
	    }
	
	    var to = Object(target);
	
	    for (var index = 1, len = arguments.length; index < len; index++) {
	        var nextSource = arguments[index];
	
	        if (nextSource != null) {
	            // Skip over if undefined or null
	            for (var nextKey in nextSource) {
	                // Avoid bugs when hasOwnProperty is shadowed
	                if (hasProp.call(nextSource, nextKey)) {
	                    to[nextKey] = nextSource[nextKey];
	                }
	            }
	        }
	    }
	    return to;
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	module.exports = function attachRef(owner, ref, instance) {
	    if (ref == null) {
	        return;
	    }
	
	    if (instance == null) {
	        instance = null;
	    }
	
	    if ("function" === typeof ref) {
	        ref.call(owner, instance);
	        return;
	    }
	
	    if (!owner) {
	        ////////////////////////////////////////////////////////////////////
	        var msg = translator.translate("errors.ref-without-owner");
	        throw new Error(msg);
	        /////////
	        ////////////////////////////////////////////////
	        //////////
	    }
	
	    ref = String(ref);
	
	    if (instance === null) {
	        delete owner.refs[ref];
	    } else {
	        owner.refs[ref] = instance;
	    }
	};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var slice = Array.prototype.slice;
	
	var dictionary = {
	    en: __webpack_require__(12)
	};
	
	var translations = dictionary.en;
	
	// TODO : add more languages
	// function setLng(lng) {
	//     if (hasProp.call(dictionary, lng)) {
	//         translations = dictionary[lng];
	//     }
	// }
	
	function translate(code) {
	    var args = slice.call(arguments, 1);
	    var path = code.split(".");
	    var template = translations;
	
	    for (var i = 0, len = path.length; i < len && "object" === typeof template; i++) {
	        template = template[path[i]];
	    }
	
	    if ("function" === typeof template) {
	        return template.apply(undefined, args);
	    }
	
	    return null;
	}
	
	exports.dictionary = dictionary;
	// exports.setLng = setLng;
	exports.translate = translate;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var createStringTemplate = __webpack_require__(4);
	
	var translations = {
	    common: {
	        "render-by": "This DOM node was rendered by `{0}`.",
	        "check-render-of": "Check the render method of `{0}`.",
	        "check-top-render-of": "Check the top-level render call using {0}.",
	        "used-in": "It was used in `{0}`.",
	        "created-in": "It was created in `{0}`."
	    },
	    errors: {
	        "checkedLink-and-valueLink": "It is not allowed to set both checkedLink and valueLink props.",
	        "checkedLink-and-value-or-onChange": "It is not allowed to set checkedLink prop and checked or onChange prop.",
	        "valueLink-and-value-or-onChange": "It is not allowed to set valueLink prop and value or onChange prop.",
	        "ref-without-owner": "Unable to attach a ref on a component element rendered outside a composite component",
	        "implement-function": "A function cannot be used as a mixin. May be you wanted to use the prototype as mixin.",
	        "implement-null-or-not-object": "Only not null typeof 'object' can be used as mixins. Given mixin: {0}.",
	        "element-as-mixin": "A component element cannot be used a mixin. May be you wanted to use the element type prototype.",
	        "findDOMNode-in-render": "`{0}` is calling `vrdom.findDOMNode()` on itself. DOM node may not be setted yet or may change after render.",
	        "findDOMNode-invalid-argument": "vrdom.findDOMNode(...): Invalid argument. Only DOM node or composite components are accepted.",
	        "findDOMNode-on-unmounted": "vrdom.findDOMNode(...): composite component is not mounted.",
	        "invalid-container": "{0}: container is not a DOM node.",
	        "render-invalid-element": "vrdom.render(): Invalid component element.",
	        "render-string": "Perhaps you mean <{0} /> instead of '{0}'.",
	        "render-function": "Perhaps you mean <{0} /> instead of {0}.",
	        "is-mounted-in-render": "`{1}` is calling `{0}.isMounted()`. DOM node may not be setted yet or may change after render.",
	        "stateless-set-ref": "A component element returned by a Stateless function cannot have a string ref.",
	        "invalid-element": "{0}: Invalid element returned. Valid elements are null and objects created by vrdom.createElement.",
	        "child-invalid-element": "Invalid child element {0}.",
	        "value-without-control": "<{0}> element will behave as a read-only `value` element. " + "You should consider setting `readOnly` prop if it is your meaning. " + "Otherwise, set either `defaultValue` for intial `value` or " + "`onChange` to control `value`.",
	        "checked-without-control": "<{0}> element will behave as a read-only `checked` element. " + "You should consider setting `readOnly` prop if it is your meaning. " + "Otherwise, set either `defaultChecked` for intial `checked` or " + "`onChange` to control `checked`.",
	        "invalid-initialState": "{0}.getInitialState(): Invalid state returned. Expecting typeof 'object' and not Array.",
	        "undefined-render-method": "vrdom.createClass(...): prototype has no `render` method.",
	        "textarea-children": "Avoid adding children to <textarea>. Prefer using `defaultValue` or `value`.",
	        "textarea-multiple-children": "<textarea> can only have at most one child.",
	        "null-type": "{0}: Element type is null or undefined.",
	        "invalid-type": "{0}: Element type is not a string nor a function.",
	        "defaultProps-outside-createClass": "`{0}.getDefaultProps` can only be used in `vrdom.createClass(...)`. Use `{0}.defaultProps` instead.",
	        "invalid-tag": "Invalid tag: {0}",
	        "void-with-children": "<{0} /> cannot have `children` nor `dangerouslySetInnerHTML`.",
	        "children-and-dangerouslySetInnerHTML": "You can only set one of `children` or `dangerouslySetInnerHTML`.",
	        "editable-with-children": "`contentEditable` and `children` props are setted. This will lead to unpredictable behaviour if the user edit the content.",
	        "invalid-style": "Expect style prop to be a key-value object.",
	        "invalid-dangerouslySetInnerHTML": "`dangerouslySetInnerHTML` must be in the form `{__html: ...}`.",
	        "props-innerHTML": "Directly setting property `innerHTML` is not permitted.",
	
	        input: {
	            "uncontrolled-to-controlled": "{1} elements should be either controlled or uncontrolled: {0} is changing from uncontrolled to controlled.",
	            "controlled-to-uncontrolled": "{1} elements should be either controlled or uncontrolled: {0} is changing from controlled to uncontrolled.",
	            "both-default": "{1} elements should be either controlled or uncontrolled: {0} has both `{3}` and `{4}` props.",
	            "value-null": "`{1}` prop on `{0}` should not be null. Use undefined or '' to clear content.",
	            "checked-null": "`{1}` prop on `{0}` should not be null. Use either true or false."
	        },
	
	        "mount-while-unmounting": "Trying to mount on a container in the middle of an unmounting process",
	        "invalid-callback": "vrdom.render(...): Invalid callback. If provided, callback must be a function, but got `{0}`.",
	        "childContextTypes-missing": "{0}.getChildContext(): childContextTypes must be defined in order to use getChildContext().",
	        "childContextTypes-key": "{0}.getChildContext(): key \"{1}\" is not defined in childContextTypes.",
	        "stateless-receive-ref": "{0} is a stateless component and cannot have refs.",
	
	        "unique-key-prop": "Each child in an array or iterator should have a unique \"key\" prop.",
	        "duplicate-key-prop": "{0}: duplicate child key prop `{1}`. Only the first child will be used.",
	        "duplicate-prop": "{0} is normalized to the same prop as `{1}`. Only `{1}` will be used.",
	        "duplicate-style": "{0} is normalized to the same style prop as `{1}`. `{0}` will be used.",
	        "render-in-body": "vrdom.render(...): Rendering components directly into document.body is " + "discouraged, since its children are often manipulated by third-party " + "scripts and browser extensions. This may lead to subtle " + "reconciliation issues. Try rendering into a container element created " + "for your app.",
	        "render-while-rendering": "vrdom.render(...): `vrdom.render(...)` cannot be nested in the render method of another component." + " If you really need to, consider using it in `componentDidMount` or `componentDidUpdate`.",
	        "updating-during-render": "`{0}.{1}` during `{2}` will only be applied on next rendering cycle." + " If you intend to use the new state in render, do it in `componentWillMount` or `componentWillReceiveProps`." + " If you intend to use the new state on next render cycle, do it in `componentDidMount` or `componentDidUpdate`.",
	        "updating-unmounted": "`{0}.{1}` is called on an unmounted `{0}`.",
	        "component-super-no-props": "{0}(...): Avoid changing props in constructor since it will be overrided.",
	        "component-super-no-context": "{0}(...): Avoid changing context in constructor since it will be overrided.",
	        "shouldComponentUpdate-not-boolean": "{0}.shouldComponentUpdate(): Expecting true or false, but got `{1}`.",
	        "componentDidUnmount": "`{0}.componentDidUnmount()` is not a known method. Did you mean `{0}.componentWillUnmount()`?",
	        "rebind-context": "`{0}.{1}` is an auto-binded method: Binding the method to another context will not change the context.",
	        "rebind-autobind": "`{0}.{1}` is an auto-binded method: There is no need for another bind.",
	        "unkown-attribute": "For <{2}>, prefer using the interface property name `{1}` instead of `{0}`.",
	        "invalid-attribute": "Invalid attribute name: `{0}`",
	        "unexpected-option-child": "Only strings and numbers are supported as <option> children.",
	        "option-selected": "Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>.",
	        "map-as-children": "Be carefull when using Map like iterables. Children keys will be overrided by Map keys."
	    }
	};
	
	function toStringTemplate(obj) {
	    var value;
	
	    // eslint-disable-next-line guard-for-in
	    for (var key in obj) {
	        value = obj[key];
	
	        /* istanbul ignore next */
	        switch (typeof value) {// eslint-disable-line default-case
	            case "object":
	                toStringTemplate(value);
	                break;
	            case "string":
	                obj[key] = createStringTemplate(value);
	                break;
	        }
	    }
	
	    return obj;
	}
	
	module.exports = toStringTemplate(translations);

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var assign = __webpack_require__(9);
	
	module.exports = function clone(src) {
	    if (src == null) {
	        return src;
	    }
	
	    return assign({}, src);
	};

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	/* eslint-disable no-invalid-this */
	
	module.exports = function createChainedFunction(fn1, fn2) {
	    return function chainedFunction() {
	        fn1.apply(this, arguments);
	        fn2.apply(this, arguments);
	    };
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	/* eslint-disable no-invalid-this */
	
	var assign = __webpack_require__(9);
	
	module.exports = function createMergedResultFunction(fn1, fn2) {
	    return function mergedResultFunction() {
	        var res1 = fn1.apply(this, arguments);
	        var res2 = fn2.apply(this, arguments);
	
	        if (res1 == null) {
	            return res2;
	        }
	
	        if (res2 == null) {
	            return res1;
	        }
	
	        return assign({}, res1, res2);
	    };
	};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = __webpack_require__(8);
	
	module.exports = function extendWithoutUndefined(dst, src) {
	    var prop, value;
	
	    for (prop in src) {
	        /* istanbul ignore else */
	        if (hasProp.call(src, prop)) {
	            value = src[prop];
	            if (value !== undefined) {
	                dst[prop] = value;
	            }
	        }
	    }
	
	    return dst;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var flattenChildren = __webpack_require__(18);
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	var shouldWarnOptionChildren = true;
	
	var destroyers = __webpack_require__(26);
	destroyers.reset.push(function () {
	    shouldWarnOptionChildren = true;
	});
	//////////
	
	module.exports = function flattenChildrenToString(children) {
	    if (children == null) {
	        return null;
	    }
	
	    var options = {
	        prefix: "RootID",
	        ignoreError: true,
	        checkDuplicate: false,
	        warnKey: false
	    };
	
	    var text = [];
	    flattenChildren(children, {}, "undefined", options, null, function (child) {
	        var type = typeof child;
	        if (type === "string" || type === "number") {
	            text.push(child);
	        }
	        ////////////////////////////////////////////////////////////////////
	        else if (shouldWarnOptionChildren && child != null) {
	                shouldWarnOptionChildren = false;
	                var msg = "Warning: " + translator.translate("errors.unexpected-option-child");
	                console.error(msg);
	            }
	        //////////
	    });
	
	    return text.join("");
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = Object.prototype.hasOwnProperty;
	
	var getCanonicalKey = __webpack_require__(19);
	var getIteratorMethod = __webpack_require__(20);
	var isValidElement = __webpack_require__(22);
	var VirtualText = __webpack_require__(23);
	
	////////////////////////////////////////////////////////////////////
	var expando = __webpack_require__(2);
	var translator = __webpack_require__(11);
	var formatArgument = __webpack_require__(5);
	var getDisplayName = __webpack_require__(24);
	var getDisplayRender = __webpack_require__(7);
	var setExpandoData = __webpack_require__(25);
	var destroyers = __webpack_require__(26);
	
	var shouldWarnAboutMaps = true;
	var warnedKeyErrors = {};
	
	destroyers.reset.push(function () {
	    shouldWarnAboutMaps = true;
	    warnedKeyErrors = {};
	});
	
	var WARN_KEY_STATUS = {
	    code: 0
	};
	//////////
	
	module.exports = flattenChildren;
	
	var OK_STATUS = 1;
	
	function flattenChildren(c, childNodes, tagName, options, owner, callback) {
	    var iterator, entry, step;
	
	    var prefix = options.prefix;
	    var ignoreError = options.ignoreError;
	    var hasCallback = "function" === typeof callback;
	
	    var status = OK_STATUS;
	    var isCollection = false;
	    var iteratorMethod, defaultKey, type, key, canonicalKey, ichildren, nextStatus;
	
	    var children = [c, prefix, null];
	
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    var checkDuplicate = options.checkDuplicate;
	    var warnKey = options.warnKey;
	    var skip = false;
	    /////////
	    ///////////////////
	    //////////
	
	    var len = children.length;
	    var length = 0;
	    var originalChild;
	
	    while (0 !== len) {
	
	        key = children[--len];
	        prefix = children[--len];
	        c = originalChild = children[--len];
	
	        children.length = len;
	
	        type = typeof c;
	
	        if (c == null || type === "boolean") {
	            length++;
	            if (hasCallback) {
	                callback(originalChild, defaultKey);
	            }
	            continue;
	        }
	
	        defaultKey = key == null ? length : key;
	
	        if (Array.isArray(c)) {
	            isCollection = true;
	            prefix = getCanonicalKey(defaultKey, prefix) + ">";
	            for (var i = c.length - 1; i !== -1; i--) {
	                children.push(c[i], prefix, null);
	            }
	            len = children.length;
	            continue;
	        }
	
	        iteratorMethod = getIteratorMethod(c);
	
	        if (iteratorMethod) {
	            prefix = getCanonicalKey(defaultKey, prefix) + ">";
	            iterator = iteratorMethod.call(c);
	            ichildren = [];
	
	            // http://exploringjs.com/es6/ch_maps-sets.html
	            if (iteratorMethod === c.entries) {
	                ////////////////////////////////////////////////////////////////////
	                if (shouldWarnAboutMaps) {
	                    msg = translator.translate("errors.map-as-children");
	                    console.error(msg);
	                    shouldWarnAboutMaps = false;
	                }
	                //////////
	
	                while (!(step = iterator.next()).done) {
	                    entry = step.value;
	                    ichildren.push(String(entry[0]), prefix, entry[1]);
	                }
	            } else {
	                while (!(step = iterator.next()).done) {
	                    ichildren.push(null, prefix, step.value);
	                }
	            }
	
	            isCollection = true;
	            ichildren.reverse();
	            children.push.apply(children, ichildren);
	            len = children.length;
	            continue;
	        }
	
	        if (!isCollection) {
	            // treat single child as first element of collection
	            // therefore allowing to have the same if another child is added
	            prefix = getCanonicalKey(defaultKey, prefix) + ">";
	        }
	
	        if (type === "string" || type === "number" || tagName === "textarea" && (type === "string" || type === "number" || type === "boolean" || type === "object")) {
	            canonicalKey = getCanonicalKey(defaultKey, prefix);
	            c = new VirtualText(String(c));
	            c.key = canonicalKey;
	            c.prefix = prefix;
	            c.originalKey = defaultKey;
	        } else if (isValidElement(c)) {
	            canonicalKey = getCanonicalKey(key != null ? key : c.key != null ? c.key : defaultKey, prefix);
	        } else if (ignoreError) {
	            length++;
	            if (hasCallback) {
	                callback(originalChild, defaultKey);
	            }
	            continue;
	        }
	
	        ////////////////////////////////////////////////////////////////////
	        else {
	                msg = [translator.translate("errors.child-invalid-element", formatArgument(c))];
	                if (owner) {
	                    msg.push(translator.translate("common.created-in", getDisplayRender(owner)));
	                }
	                throw new Error(msg.join(" "));
	            }
	        //////////
	
	        nextStatus = status;
	
	        if (!hasProp.call(childNodes, canonicalKey)) {
	            length++;
	            childNodes[canonicalKey] = c;
	            if (hasCallback) {
	                callback(originalChild, defaultKey);
	            }
	        }
	
	        ////////////////////////////////////////////////////////////////////
	        else {
	                if (checkDuplicate) {
	                    skip = true;
	                    nextStatus = {
	                        code: 2,
	                        key: "originalKey" in c ? c.originalKey : c.key
	                    };
	                }
	            }
	
	        if (skip) {
	            skip = false;
	        } else if (isCollection && warnKey) {
	            if (canonicalKey.lastIndexOf(".") >= canonicalKey.lastIndexOf("#")) {
	                nextStatus = WARN_KEY_STATUS;
	            }
	        }
	
	        if (nextStatus !== status && status === OK_STATUS) {
	            status = nextStatus;
	            warnChildKey(status, c, tagName, options, owner);
	        }
	        //////////
	    }
	
	    return childNodes;
	}
	
	////////////////////////////////////////////////////////////////////
	function warnChildKey(status, child, name, options, owner) {
	    var id, warn, ref;
	
	    var code = status.code;
	
	    var msg = ["Warning:"];
	
	    var childOwner = (ref = child._owner) != null ? ref._instance : undefined;
	
	    if (code === 2) {
	        msg.push(translator.translate("errors.duplicate-key-prop", "flattenChildren(...)", status.key));
	    } else {
	        msg.push([translator.translate("errors.unique-key-prop")]);
	    }
	
	    if (owner) {
	        name = getDisplayName(owner);
	
	        id = translator.translate(childOwner && childOwner === owner ? "common.created-in" : "common.used-in", getDisplayRender(owner));
	        setExpandoData(owner, {});
	
	        if (!(id in owner[expando])) {
	            owner[expando][id] = true;
	            if (name) {
	                msg.push(id);
	            }
	            warn = true;
	        }
	    } else {
	        if ("function" === typeof name) {
	            name = getDisplayName(name);
	        } else {
	            name = "<" + name.toLowerCase() + ">";
	        }
	
	        id = translator.translate("common.check-top-render-of", name);
	
	        if (!hasProp.call(warnedKeyErrors, id)) {
	            warnedKeyErrors[id] = true;
	            if (name) {
	                msg.push(id);
	            }
	            warn = true;
	        }
	    }
	
	    if (warn) {
	        if (childOwner && childOwner !== owner) {
	            msg.push(translator.translate("common.created-in", getDisplayRender(childOwner)));
	        }
	
	        console.error(msg.join(" "));
	    }
	}
	//////////

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	module.exports = function getCanonicalKey(key, prefix) {
	    switch (typeof key) {
	        case "string":
	            key = prefix + ".#" + key;
	            break;
	        case "number":
	            key = prefix + "." + key;
	            break;
	        default:
	            key = prefix;
	    }
	
	    return key;
	};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	// eslint-disable-next-line no-undef
	var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
	var ITERATOR_METHOD = "@@iterator";
	var isObject = __webpack_require__(21);
	
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterables
	// In order to be iterable,
	// an object must implement the @@iterator method,
	// meaning that the object (or one of the objects up its prototype chain) must have a property with a Symbol.iterator key:
	// http://exploringjs.com/es6/ch_maps-sets.html
	// eslint-disable-next-line consistent-return
	module.exports = function getIteratorMethod(obj) {
	    if (isObject(obj)) {
	        var iteratorMethod = ITERATOR_SYMBOL && obj[ITERATOR_SYMBOL] || obj[ITERATOR_METHOD];
	        if (typeof iteratorMethod === "function") {
	            return iteratorMethod;
	        }
	    }
	};

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	module.exports = function isObject(obj) {
	    var ref;
	    return obj && ((ref = typeof obj) === "object" || ref === "function");
	};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	
	module.exports = function isValidElement(el) {
	    return el !== null && "object" === typeof el && el.expando === expando;
	};

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	module.exports = VirtualText;
	
	function VirtualText(text) {
	    this.text = text;
	}
	
	VirtualText.prototype.type = "VirtualText";
	VirtualText.prototype.isVText = true;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var getFunctionName = __webpack_require__(6);
	var hasProp = __webpack_require__(8);
	
	module.exports = function getDisplayName(obj) {
	    var Constructor;
	    if ("object" === typeof obj) {
	        if (hasProp.call(obj, "_instance")) {
	            obj = obj._instance;
	        }
	
	        Constructor = obj.constructor;
	    } else if ("function" === typeof obj) {
	        Constructor = obj;
	    } else {
	        return obj.name;
	    }
	
	    if (hasProp.call(Constructor, "displayName")) {
	        return Constructor.displayName;
	    }
	
	    return getFunctionName(Constructor);
	};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	var assign = __webpack_require__(9);
	var hasProp = __webpack_require__(8);
	
	module.exports = function setExpandoData(obj, data) {
	    if (hasProp.call(obj, expando)) {
	        assign(obj[expando], data);
	    } else {
	        // obj[expando] = data;
	        Object.defineProperty(obj, expando, {
	            configurable: true, // allow delete
	            enumerable: false, // prevent listing in for ... in
	            writable: true, // allow new assignation
	            value: data
	        });
	    }
	    return obj[expando];
	};

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	var reset = exports.reset = [];
	var running = exports.running = [];
	
	exports.destroy = function () {
	    var i, destroyer;
	    for (i = running.length - 1; i >= 0; i--) {
	        destroyer = running.pop();
	
	        // try catch is for internal debugging
	        try {
	            destroyer();
	        } catch (e) {
	            /* istanbul ignore next */
	            console.error(e);
	        }
	    }
	
	    for (i = reset.length - 1; i >= 0; i--) {
	        // try catch is for internal debugging
	        try {
	            reset[i]();
	        } catch (e) {
	            /* istanbul ignore next */
	            console.error(e);
	        }
	    }
	};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	var hasProp = __webpack_require__(8);
	var setExpandoData = __webpack_require__(25);
	
	module.exports = function getExpandoData(obj, _default) {
	    if (hasProp.call(obj, expando)) {
	        return obj[expando];
	    }
	
	    return setExpandoData(obj, _default);
	};

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	module.exports = function getKeyAndPrefixFromCanonicalKey(canonicalKey) {
	    var lastIndex = canonicalKey.lastIndexOf(".");
	    var prefix = canonicalKey.slice(0, lastIndex);
	    var key;
	
	    if (/\d/.test(canonicalKey[lastIndex + 1])) {
	        key = parseInt(canonicalKey.slice(lastIndex + 1), 10);
	    } else {
	        key = canonicalKey.slice(lastIndex + 2);
	    }
	
	    return [key, prefix];
	};

/***/ }),
/* 29 */
/***/ (function(module, exports) {

	module.exports = function getOwnerDocument(node) {
	    // eslint-disable-next-line no-magic-numbers
	    if (node == null || node.nodeType === 9) {
	        return node;
	    }
	
	    return node.ownerDocument;
	};

/***/ }),
/* 30 */
/***/ (function(module, exports) {

	var hasProp = Object.prototype.hasOwnProperty;
	
	module.exports = function getVNodeFromMap(key, nodeMap) {
		return hasProp.call(nodeMap, key) ? nodeMap[key].vnode : null;
	};

/***/ }),
/* 31 */
/***/ (function(module, exports) {

	var hasProp = Object.prototype.hasOwnProperty;
	
	// http://www.w3schools.com/tags/att_input_type.asp
	var inputTypesWithEditableValue = {
	    "color": true,
	    "date": true,
	    "datetime": true,
	    "datetime-local": true,
	    "email": true,
	    "month": true,
	    "number": true,
	    "password": true,
	    "range": true,
	    "search": true,
	    "tel": true,
	    "text": true,
	    "time": true,
	    "url": true,
	    "week": true
	};
	
	module.exports = function hasEditableValue(type, props) {
	    switch (type) {
	        case "textarea":
	        case "select":
	            return true;
	        case "input":
	            return props.type == null || hasProp.call(inputTypesWithEditableValue, props.type);
	        default:
	            return false;
	    }
	};

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2),
	    hasProp = __webpack_require__(8),
	    createChainedFunction = __webpack_require__(14),
	    createMergedResultFunction = __webpack_require__(15),
	    assign = __webpack_require__(9),
	    isValidElement = __webpack_require__(22);
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	var OverrideAction = function () {
	    var index;
	    index = 0;
	    return {
	        LAST_DEFINED: ++index,
	        CHAIN_METHODS: ++index,
	        MERGE_RESULTS: ++index
	    };
	}();
	
	var ComponentInterface = {
	    getInitialState: OverrideAction.MERGE_RESULTS,
	    getChildContext: OverrideAction.MERGE_RESULTS,
	    render: OverrideAction.LAST_DEFINED,
	    componentWillMount: OverrideAction.CHAIN_METHODS,
	    componentWillDOMMount: OverrideAction.CHAIN_METHODS,
	    componentDidMount: OverrideAction.CHAIN_METHODS,
	    componentWillReceiveProps: OverrideAction.CHAIN_METHODS,
	    shouldComponentUpdate: OverrideAction.LAST_DEFINED,
	    componentWillUpdate: OverrideAction.CHAIN_METHODS,
	    componentDidUpdate: OverrideAction.CHAIN_METHODS,
	    componentWillUnmount: OverrideAction.CHAIN_METHODS
	};
	
	var StaticProperties = {
	    displayName: function displayName(Constructor, _displayName) {
	        Constructor.displayName = _displayName;
	    },
	    getDefaultProps: function getDefaultProps(Constructor, _getDefaultProps) {
	        if (Constructor.getDefaultProps) {
	            Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, _getDefaultProps);
	        } else {
	            Constructor.getDefaultProps = _getDefaultProps;
	        }
	    },
	    mixins: function mixins(Constructor, _mixins) {
	        var i, len, mixin;
	        if (_mixins) {
	            for (i = 0, len = _mixins.length; i < len; i++) {
	                mixin = _mixins[i];
	                implement(Constructor, mixin);
	            }
	        }
	    },
	    propTypes: function propTypes(Constructor, _propTypes) {
	        Constructor.propTypes = assign({}, Constructor.propTypes, _propTypes);
	    },
	    contextTypes: function contextTypes(Constructor, _contextTypes) {
	        Constructor.contextTypes = assign({}, Constructor.contextTypes, _contextTypes);
	    },
	    childContextTypes: function childContextTypes(Constructor, _childContextTypes) {
	        Constructor.childContextTypes = assign({}, Constructor.childContextTypes, _childContextTypes);
	    },
	    statics: function statics(Constructor, _statics) {
	        var name;
	        for (name in _statics) {
	            if (hasProp.call(_statics, name) && !hasProp.call(StaticProperties, name)) {
	                Constructor[name] = _statics[name];
	            }
	        }
	    }
	};
	
	module.exports = implement;
	
	function implement(Constructor, spec) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    if (spec === null || "object" !== typeof spec) {
	        ////////////////////////////////////////////////////////////////////
	        if ("function" === typeof spec) {
	            msg = translator.translate("errors.implement-function");
	            throw new Error(msg);
	        }
	        msg = "Warning: " + translator.translate("errors.implement-null-or-not-object", spec);
	        console.error(msg);
	        //////////
	        return;
	    }
	
	    if (isValidElement(spec)) {
	        ////////////////////////////////////////////////////////////////////
	        msg = translator.translate("errors.element-as-mixin");
	        throw new Error(msg);
	        /////////
	        ////////////////////////////////////////////////
	        //////////
	    }
	
	    var proto = Constructor.prototype,
	        autobinds = proto[expando + "_autobinds"];
	
	    // implement mixins first
	    if (hasProp.call(spec, "mixins")) {
	        StaticProperties.mixins(Constructor, spec.mixins);
	    }
	
	    var key, value;
	
	    for (key in spec) {
	        if (hasProp.call(spec, key)) {
	            value = spec[key];
	            // interface methods are implemented in another loop
	            if (!hasProp.call(ComponentInterface, key)) {
	                implementSpec(Constructor, spec, proto, autobinds, key, value);
	            }
	        }
	    }
	
	    // spec may be another prototype which has interface methods that are not enumerable
	    for (key in ComponentInterface) {
	        if (key in spec) {
	            value = spec[key];
	            implementSpec(Constructor, spec, proto, autobinds, key, value);
	        }
	    }
	}
	
	function implementSpec(Constructor, spec, proto, autobinds, key, value) {
	    // mixins are implemented outside
	    if (key === "mixins") {
	        return;
	    }
	
	    if (hasProp.call(StaticProperties, key)) {
	        StaticProperties[key](Constructor, value);
	        return;
	    }
	
	    var isAlreadyDefined = hasProp.call(proto, key);
	
	    // auto bind methods that are not in the interface
	    if (spec.autobind !== false && autobinds && !hasProp.call(ComponentInterface, key)) {
	        if ("function" === typeof value) {
	            autobinds[key] = true;
	        } else if (hasProp.call(autobinds, key)) {
	            // a spec overrides an autobinded method with something that is not a function
	            // remove previously autobinded method
	            delete autobinds[key];
	        }
	    }
	
	    // handle is already defined interface methods
	    if (isAlreadyDefined && hasProp.call(ComponentInterface, key)) {
	        var action = ComponentInterface[key];
	
	        if (action === OverrideAction.MERGE_RESULTS) {
	            proto[key] = createMergedResultFunction(proto[key], value);
	            return;
	        } else if (action === OverrideAction.CHAIN_METHODS) {
	            proto[key] = createChainedFunction(proto[key], value);
	            return;
	        }
	    }
	
	    proto[key] = value;
	}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	/* eslint-disable no-invalid-this */
	
	var hasProp = __webpack_require__(8);
	
	module.exports = function inherits(child, parent) {
	    for (var key in parent) {
	        if (hasProp.call(parent, key)) {
	            child[key] = parent[key];
	        }
	    }
	
	    function ctor() {
	        this.constructor = child;
	    }
	
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	    child.__super__ = parent.prototype;
	
	    return child;
	};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	
	module.exports = function isComponentConstructor(Constructor) {
	    return "function" === typeof Constructor && Constructor.prototype && Constructor.prototype[expando + "_isComponent"];
	};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	var globalDocument = __webpack_require__(36);
	var hasProp = Object.prototype.hasOwnProperty;
	
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	var TAGNAMES = {
	    "select": "input",
	    "change": "input",
	    "submit": "form",
	    "reset": "form",
	    "error": "img",
	    "load": "img",
	    "abort": "img"
	};
	
	module.exports = function isEventSupported(eventName) {
	    var tagName = hasProp.call(TAGNAMES, eventName) ? TAGNAMES[eventName] : "div";
	    var el = globalDocument.createElement(tagName);
	    eventName = "on" + eventName;
	
	    var isSupported = eventName in el;
	
	    if (!isSupported) {
	        el.setAttribute(eventName, "return;");
	        isSupported = typeof el[eventName] === "function";
	    }
	
	    el = null;
	
	    // https://connect.microsoft.com/IE/feedback/details/782835/missing-onwheel-attribute-for-the-wheel-event-although-its-supported-via-addeventlistener
	    // https://github.com/nolimits4web/Swiper/blob/master/src/js/mousewheel.js
	    if (!isSupported && eventName === "onwheel" && globalDocument.implementation && globalDocument.implementation.hasFeature &&
	    // always returns true in newer browsers as per the standard.
	    // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
	    globalDocument.implementation.hasFeature("", "") !== true) {
	        // This is the only way to test support for the `wheel` event in IE9+.
	        isSupported = globalDocument.implementation.hasFeature("Events.wheel", "3.0");
	    }
	
	    return isSupported;
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var topLevel = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
	var minDoc = __webpack_require__(37);
	
	var doccy;
	
	if (typeof document !== 'undefined') {
	    doccy = document;
	} else {
	    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];
	
	    if (!doccy) {
	        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
	    }
	}
	
	module.exports = doccy;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 37 */
/***/ (function(module, exports) {

	/* (ignored) */

/***/ }),
/* 38 */
/***/ (function(module, exports) {

	// https://developer.mozilla.org/fr/docs/Web/API/Node/nodeType
	var ELEMENT_NODE = 1; // Node.ELEMENT_NODE == 1
	// var ATTRIBUTE_NODE = 2; // Node.ATTRIBUTE_NODE == 2
	// var TEXT_NODE = 3; // Node.TEXT_NODE == 3
	// var CDATA_SECTION_NODE = 4; // Node.CDATA_SECTION_NODE == 4
	// var ENTITY_REFERENCE_NODE = 5; // Node.ENTITY_REFERENCE_NODE == 5
	// var ENTITY_NODE = 6; // Node.ENTITY_NODE == 6
	// var PROCESSING_INSTRUCTION_NODE = 7; // Node.PROCESSING_INSTRUCTION_NODE == 7
	// var COMMENT_NODE = 8; // Node.COMMENT_NODE == 8
	var DOCUMENT_NODE = 9; // Node.DOCUMENT_NODE == 9
	// var DOCUMENT_TYPE_NODE = 10; // Node.DOCUMENT_TYPE_NODE == 10
	var DOCUMENT_FRAGMENT_NODE = 11; // Node.DOCUMENT_FRAGMENT_NODE == 11
	// var NOTATION_NODE = 12; // Node.NOTATION_NODE == 12
	
	module.exports = function isValidContainer(node) {
	    var ref;
	    return node !== null && "object" === typeof node && ((ref = node.nodeType) === ELEMENT_NODE || ref === DOCUMENT_NODE || ref === DOCUMENT_FRAGMENT_NODE);
	};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = __webpack_require__(8);
	var CSSProperties = __webpack_require__(40);
	var CSSAttributes = function () {
	    var CSSAttributes = {};
	
	    // eslint-disable-next-line guard-for-in
	    for (var cssProp in CSSProperties) {
	        CSSAttributes[CSSProperties[cssProp]] = cssProp;
	    }
	
	    return CSSAttributes;
	}();
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	module.exports = function normalizeCssProp(cssProp, insensitive) {
	    var normalized;
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    if (hasProp.call(CSSAttributes, cssProp)) {
	        return cssProp;
	    }
	
	    if (hasProp.call(CSSProperties, cssProp)) {
	        normalized = CSSProperties[cssProp];
	
	        ////////////////////////////////////////////////////////////////////
	        msg = "Warning: " + translator.translate("errors.unkown-attribute", cssProp, normalized, "style");
	        console.error(msg);
	        //////////
	        return normalized;
	    }
	
	    if (insensitive) {
	        var lcssProp = cssProp.toLowerCase();
	
	        if (hasProp.call(CSSProperties, lcssProp)) {
	            normalized = CSSProperties[lcssProp];
	
	            ////////////////////////////////////////////////////////////////////
	            msg = "Warning: " + translator.translate("errors.unkown-attribute", cssProp, normalized, "style");
	            console.error(msg);
	            //////////
	            return normalized;
	        }
	    }
	
	    normalized = cssProp.replace(/^-(?:Webkit|Moz|O|ms)-/i, "").replace(/-\w/g, hyphenUpperCase);
	    return normalized;
	};
	
	function hyphenUpperCase(match) {
	    return match[1].toUpperCase();
	}

/***/ }),
/* 40 */
/***/ (function(module, exports) {

	module.exports = {
	    "additive-symbols": "additiveSymbols",
	    "align-content": "alignContent",
	    "align-items": "alignItems",
	    "align-self": "alignSelf",
	    "all": "all",
	    "animation": "animation",
	    "animation-delay": "animationDelay",
	    "animation-direction": "animationDirection",
	    "animation-duration": "animationDuration",
	    "animation-fill-mode": "animationFillMode",
	    "animation-iteration-count": "animationIterationCount",
	    "animation-name": "animationName",
	    "animation-play-state": "animationPlayState",
	    "animation-timing-function": "animationTimingFunction",
	    "appearance": "appearance",
	    "attr": "attr",
	    "backface-visibility": "backfaceVisibility",
	    "background": "background",
	    "background-attachment": "backgroundAttachment",
	    "background-blend-mode": "backgroundBlendMode",
	    "background-clip": "backgroundClip",
	    "background-color": "backgroundColor",
	    "background-image": "backgroundImage",
	    "background-inline-policy": "backgroundInlinePolicy",
	    "background-origin": "backgroundOrigin",
	    "background-position": "backgroundPosition",
	    "background-repeat": "backgroundRepeat",
	    "background-size": "backgroundSize",
	    "binding": "binding",
	    "block-size": "blockSize",
	    "border": "border",
	    "border-before": "borderBefore",
	    "border-block-end": "borderBlockEnd",
	    "border-block-end-color": "borderBlockEndColor",
	    "border-block-end-style": "borderBlockEndStyle",
	    "border-block-end-width": "borderBlockEndWidth",
	    "border-block-start": "borderBlockStart",
	    "border-block-start-color": "borderBlockStartColor",
	    "border-block-start-style": "borderBlockStartStyle",
	    "border-block-start-width": "borderBlockStartWidth",
	    "border-bottom": "borderBottom",
	    "border-bottom-color": "borderBottomColor",
	    "border-bottom-colors": "borderBottomColors",
	    "border-bottom-left-radius": "borderBottomLeftRadius",
	    "border-bottom-right-radius": "borderBottomRightRadius",
	    "border-bottom-style": "borderBottomStyle",
	    "border-bottom-width": "borderBottomWidth",
	    "border-collapse": "borderCollapse",
	    "border-color": "borderColor",
	    "border-fit": "borderFit",
	    "border-image": "borderImage",
	    "border-image-outset": "borderImageOutset",
	    "border-image-repeat": "borderImageRepeat",
	    "border-image-slice": "borderImageSlice",
	    "border-image-source": "borderImageSource",
	    "border-image-width": "borderImageWidth",
	    "border-inline-end": "borderInlineEnd",
	    "border-inline-end-color": "borderInlineEndColor",
	    "border-inline-end-style": "borderInlineEndStyle",
	    "border-inline-end-width": "borderInlineEndWidth",
	    "border-inline-start": "borderInlineStart",
	    "border-inline-start-color": "borderInlineStartColor",
	    "border-inline-start-style": "borderInlineStartStyle",
	    "border-inline-start-width": "borderInlineStartWidth",
	    "border-left": "borderLeft",
	    "border-left-color": "borderLeftColor",
	    "border-left-colors": "borderLeftColors",
	    "border-left-style": "borderLeftStyle",
	    "border-left-width": "borderLeftWidth",
	    "border-radius": "borderRadius",
	    "border-right": "borderRight",
	    "border-right-color": "borderRightColor",
	    "border-right-colors": "borderRightColors",
	    "border-right-style": "borderRightStyle",
	    "border-right-width": "borderRightWidth",
	    "border-spacing": "borderSpacing",
	    "border-style": "borderStyle",
	    "border-top": "borderTop",
	    "border-top-color": "borderTopColor",
	    "border-top-colors": "borderTopColors",
	    "border-top-left-radius": "borderTopLeftRadius",
	    "border-top-right-radius": "borderTopRightRadius",
	    "border-top-style": "borderTopStyle",
	    "border-top-width": "borderTopWidth",
	    "border-width": "borderWidth",
	    "bottom": "bottom",
	    "box-align": "boxAlign",
	    "box-decoration-break": "boxDecorationBreak",
	    "box-direction": "boxDirection",
	    "box-flex": "boxFlex",
	    "box-flex-group": "boxFlexGroup",
	    "box-lines": "boxLines",
	    "box-ordinal-group": "boxOrdinalGroup",
	    "box-orient": "boxOrient",
	    "box-pack": "boxPack",
	    "box-reflect": "boxReflect",
	    "box-shadow": "boxShadow",
	    "box-sizing": "boxSizing",
	    "break-after": "breakAfter",
	    "break-before": "breakBefore",
	    "break-inside": "breakInside",
	    "calc": "calc",
	    "caption-side": "captionSide",
	    "caret-color": "caretColor",
	    "clear": "clear",
	    "clip": "clip",
	    "clip-path": "clipPath",
	    "color": "color",
	    "column-count": "columnCount",
	    "column-fill": "columnFill",
	    "column-gap": "columnGap",
	    "column-rule": "columnRule",
	    "column-rule-color": "columnRuleColor",
	    "column-rule-style": "columnRuleStyle",
	    "column-rule-width": "columnRuleWidth",
	    "column-span": "columnSpan",
	    "column-width": "columnWidth",
	    "columns": "columns",
	    "content": "content",
	    "counter-increment": "counterIncrement",
	    "counter-reset": "counterReset",
	    "crisp-edges": "crispEdges",
	    "currentcolor": "currentcolor",
	    "cursor": "cursor",
	    "direction": "direction",
	    "display": "display",
	    "element": "element",
	    "empty-cells": "emptyCells",
	    "fallback": "fallback",
	    "filter": "filter",
	    "fit-content": "fitContent",
	    "flex-basis": "flexBasis",
	    "flex-direction": "flexDirection",
	    "flex-flow": "flexFlow",
	    "flex-grow": "flexGrow",
	    "flex-shrink": "flexShrink",
	    "flex-wrap": "flexWrap",
	    "float": "float",
	    "float-edge": "floatEdge",
	    "font": "font",
	    "font-family": "fontFamily",
	    "font-feature-settings": "fontFeatureSettings",
	    "font-kerning": "fontKerning",
	    "font-language-override": "fontLanguageOverride",
	    "font-size": "fontSize",
	    "font-size-adjust": "fontSizeAdjust",
	    "font-smoothing": "fontSmoothing",
	    "font-stretch": "fontStretch",
	    "font-style": "fontStyle",
	    "font-synthesis": "fontSynthesis",
	    "font-variant": "fontVariant",
	    "font-variant-alternates": "fontVariantAlternates",
	    "font-variant-caps": "fontVariantCaps",
	    "font-variant-east-asian": "fontVariantEastAsian",
	    "font-variant-ligatures": "fontVariantLigatures",
	    "font-variant-numeric": "fontVariantNumeric",
	    "font-variant-position": "fontVariantPosition",
	    "font-weight": "fontWeight",
	    "force-broken-image-icon": "forceBrokenImageIcon",
	    "grid": "grid",
	    "grid-area": "gridArea",
	    "grid-auto-columns": "gridAutoColumns",
	    "grid-auto-flow": "gridAutoFlow",
	    "grid-auto-rows": "gridAutoRows",
	    "grid-column": "gridColumn",
	    "grid-column-end": "gridColumnEnd",
	    "grid-column-gap": "gridColumnGap",
	    "grid-column-start": "gridColumnStart",
	    "grid-gap": "gridGap",
	    "grid-row": "gridRow",
	    "grid-row-end": "gridRowEnd",
	    "grid-row-gap": "gridRowGap",
	    "grid-row-start": "gridRowStart",
	    "grid-template": "gridTemplate",
	    "grid-template-areas": "gridTemplateAreas",
	    "grid-template-columns": "gridTemplateColumns",
	    "grid-template-rows": "gridTemplateRows",
	    "height": "height",
	    "hidden-unscrollable": "hiddenUnscrollable",
	    "hyphens": "hyphens",
	    "image-orientation": "imageOrientation",
	    "image-region": "imageRegion",
	    "image-rendering": "imageRendering",
	    "ime-mode": "imeMode",
	    "inherit": "inherit",
	    "initial": "initial",
	    "inline-size": "inlineSize",
	    "isolation": "isolation",
	    "justify-content": "justifyContent",
	    "left": "left",
	    "letter-spacing": "letterSpacing",
	    "line-break": "lineBreak",
	    "line-height": "lineHeight",
	    "linear-gradient": "linearGradient",
	    "list-style": "listStyle",
	    "list-style-image": "listStyleImage",
	    "list-style-position": "listStylePosition",
	    "list-style-type": "listStyleType",
	    "margin": "margin",
	    "margin-block-end": "marginBlockEnd",
	    "margin-block-start": "marginBlockStart",
	    "margin-bottom": "marginBottom",
	    "margin-end": "marginEnd",
	    "margin-inline-end": "marginInlineEnd",
	    "margin-inline-start": "marginInlineStart",
	    "margin-left": "marginLeft",
	    "margin-right": "marginRight",
	    "margin-start": "marginStart",
	    "margin-top": "marginTop",
	    "mask": "mask",
	    "mask-attachment": "maskAttachment",
	    "mask-box-image": "maskBoxImage",
	    "mask-clip": "maskClip",
	    "mask-composite": "maskComposite",
	    "mask-image": "maskImage",
	    "mask-mode": "maskMode",
	    "mask-origin": "maskOrigin",
	    "mask-position": "maskPosition",
	    "mask-position-x": "maskPositionX",
	    "mask-position-y": "maskPositionY",
	    "mask-repeat": "maskRepeat",
	    "mask-repeat-x": "maskRepeatX",
	    "mask-repeat-y": "maskRepeatY",
	    "mask-size": "maskSize",
	    "mask-type": "maskType",
	    "max-block-size": "maxBlockSize",
	    "max-height": "maxHeight",
	    "max-inline-size": "maxInlineSize",
	    "max-width": "maxWidth",
	    "max-zoom": "maxZoom",
	    "min-block-size": "minBlockSize",
	    "min-height": "minHeight",
	    "min-inline-size": "minInlineSize",
	    "min-width": "minWidth",
	    "min-zoom": "minZoom",
	    "minmax": "minmax",
	    "mix-blend-mode": "mixBlendMode",
	    "negative": "negative",
	    "object-fit": "objectFit",
	    "object-position": "objectPosition",
	    "offset-block-end": "offsetBlockEnd",
	    "offset-block-start": "offsetBlockStart",
	    "offset-inline-end": "offsetInlineEnd",
	    "offset-inline-start": "offsetInlineStart",
	    "opacity": "opacity",
	    "order": "order",
	    "orient": "orient",
	    "orientation": "orientation",
	    "orphans": "orphans",
	    "outline": "outline",
	    "outline-color": "outlineColor",
	    "outline-offset": "outlineOffset",
	    "outline-radius": "outlineRadius",
	    "outline-radius-bottomleft": "outlineRadiusBottomleft",
	    "outline-radius-bottomright": "outlineRadiusBottomright",
	    "outline-radius-topleft": "outlineRadiusTopleft",
	    "outline-radius-topright": "outlineRadiusTopright",
	    "outline-style": "outlineStyle",
	    "outline-width": "outlineWidth",
	    "overflow": "overflow",
	    "overflow-scrolling": "overflowScrolling",
	    "overflow-wrap": "overflowWrap",
	    "overflow-x": "overflowX",
	    "overflow-y": "overflowY",
	    "pad": "pad",
	    "padding": "padding",
	    "padding-block-end": "paddingBlockEnd",
	    "padding-block-start": "paddingBlockStart",
	    "padding-bottom": "paddingBottom",
	    "padding-end": "paddingEnd",
	    "padding-inline-end": "paddingInlineEnd",
	    "padding-inline-start": "paddingInlineStart",
	    "padding-left": "paddingLeft",
	    "padding-right": "paddingRight",
	    "padding-start": "paddingStart",
	    "padding-top": "paddingTop",
	    "page-break-after": "pageBreakAfter",
	    "page-break-before": "pageBreakBefore",
	    "page-break-inside": "pageBreakInside",
	    "perspective": "perspective",
	    "perspective-origin": "perspectiveOrigin",
	    "pointer-events": "pointerEvents",
	    "position": "position",
	    "prefix": "prefix",
	    "print-color-adjust": "printColorAdjust",
	    "quotes": "quotes",
	    "radial-gradient": "radialGradient",
	    "range": "range",
	    "repeating-linear-gradient": "repeatingLinearGradient",
	    "repeating-radial-gradient": "repeatingRadialGradient",
	    "resize": "resize",
	    "revert": "revert",
	    "right": "right",
	    "ruby-align": "rubyAlign",
	    "ruby-position": "rubyPosition",
	    "scroll-behavior": "scrollBehavior",
	    "scroll-snap-coordinate": "scrollSnapCoordinate",
	    "scroll-snap-destination": "scrollSnapDestination",
	    "scroll-snap-type": "scrollSnapType",
	    "scrollbars-horizontal": "scrollbarsHorizontal",
	    "scrollbars-none": "scrollbarsNone",
	    "scrollbars-vertical": "scrollbarsVertical",
	    "shape-image-threshold": "shapeImageThreshold",
	    "shape-margin": "shapeMargin",
	    "shape-outside": "shapeOutside",
	    "speak-as": "speakAs",
	    "src": "src",
	    "stack-sizing": "stackSizing",
	    "suffix": "suffix",
	    "symbols": "symbols",
	    "system": "system",
	    "tab-size": "tabSize",
	    "table-layout": "tableLayout",
	    "tap-highlight-color": "tapHighlightColor",
	    "text-align": "textAlign",
	    "text-align-last": "textAlignLast",
	    "text-combine-upright": "textCombineUpright",
	    "text-decoration": "textDecoration",
	    "text-decoration-color": "textDecorationColor",
	    "text-decoration-line": "textDecorationLine",
	    "text-decoration-style": "textDecorationStyle",
	    "text-emphasis": "textEmphasis",
	    "text-emphasis-color": "textEmphasisColor",
	    "text-emphasis-position": "textEmphasisPosition",
	    "text-emphasis-style": "textEmphasisStyle",
	    "text-fill-color": "textFillColor",
	    "text-indent": "textIndent",
	    "text-orientation": "textOrientation",
	    "text-overflow": "textOverflow",
	    "text-rendering": "textRendering",
	    "text-shadow": "textShadow",
	    "text-size-adjust": "textSizeAdjust",
	    "text-stroke": "textStroke",
	    "text-stroke-color": "textStrokeColor",
	    "text-stroke-width": "textStrokeWidth",
	    "text-transform": "textTransform",
	    "text-underline-position": "textUnderlinePosition",
	    "top": "top",
	    "touch-action": "touchAction",
	    "touch-callout": "touchCallout",
	    "transform": "transform",
	    "transform-box": "transformBox",
	    "transform-origin": "transformOrigin",
	    "transform-style": "transformStyle",
	    "transition": "transition",
	    "transition-delay": "transitionDelay",
	    "transition-duration": "transitionDuration",
	    "transition-property": "transitionProperty",
	    "transition-timing-function": "transitionTimingFunction",
	    "unicode-bidi": "unicodeBidi",
	    "unicode-range": "unicodeRange",
	    "unset": "unset",
	    "user-focus": "userFocus",
	    "user-input": "userInput",
	    "user-modify": "userModify",
	    "user-select": "userSelect",
	    "user-zoom": "userZoom",
	    "var": "var",
	    "vertical-align": "verticalAlign",
	    "visibility": "visibility",
	    "white-space": "whiteSpace",
	    "widows": "widows",
	    "width": "width",
	    "will-change": "willChange",
	    "window-shadow": "windowShadow",
	    "word-break": "wordBreak",
	    "word-spacing": "wordSpacing",
	    "word-wrap": "wordWrap",
	    "writing-mode": "writingMode",
	    "z-index": "zIndex",
	    "zoom": "zoom"
	};

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	var hasProp = __webpack_require__(8);
	//////////
	
	var normalizeCssProp = __webpack_require__(39);
	
	module.exports = function normalizeCssProps(style, type, insensitive) {
	
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    if (style === null || "object" !== typeof style) {
	        return null;
	    }
	
	    var normalized = {},
	        keys = {};
	
	    var cssProp;
	
	    // eslint-disable-next-line guard-for-in
	    for (var key in style) {
	        cssProp = normalizeCssProp(key, insensitive);
	
	        ////////////////////////////////////////////////////////////////////
	        if (hasProp.call(keys, cssProp)) {
	            msg = "Warning: " + translator.translate("errors.duplicate-style", key, keys[cssProp], type);
	            console.error(msg);
	        }
	        //////////
	
	        keys[cssProp] = key;
	        normalized[cssProp] = style[key];
	    }
	
	    return normalized;
	};

/***/ }),
/* 42 */
/***/ (function(module, exports) {

	var __id = 0;
	
	module.exports = function uniqueId(name) {
		++__id;
		return name + __id;
	};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	module.exports = function updateNodeMap(prevVNode, nextVNode, nextNode, nodeMap) {
	    var prevKey, nextKey;
	
	    if (prevVNode == null) {
	        nextVNode.node = nextNode;
	        nodeMap[nextVNode.key] = {
	            vnode: nextVNode,
	            node: nextNode
	        };
	        return;
	    }
	
	    prevKey = prevVNode.key;
	
	    if (nextVNode == null) {
	        delete nodeMap[prevKey].vnode;
	        delete nodeMap[prevKey].node;
	        delete nodeMap[prevKey];
	        delete prevVNode.node;
	        return;
	    }
	
	    nextKey = nextVNode.key;
	    nextVNode.node = nextNode;
	
	    nodeMap[nextKey].vnode = nextVNode;
	    nodeMap[nextKey].node = nextNode;
	};

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	
	var functions = __webpack_require__(3),
	
	////////////////////////////////////////////////////////////////////
	formatArgument = functions.formatArgument,
	    getDisplayName = functions.getDisplayName,
	    getDisplayRender = functions.getDisplayRender,
	
	//////////
	assign = functions.assign,
	    getCanonicalKey = functions.getCanonicalKey,
	    getOwnerDocument = functions.getOwnerDocument,
	    getVNodeFromMap = functions.getVNodeFromMap,
	    hasProp = functions.hasProp,
	    isValidContainer = functions.isValidContainer,
	    setExpandoData = functions.setExpandoData,
	    uniqueId = functions.uniqueId;
	
	var callVNodeHooks = __webpack_require__(45).callVNodeHooks;
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	var Renderer = exports;
	
	var createNode, updateTree, h, ComponentWidget, controls;
	
	Renderer._afterUpdates = {};
	Renderer._performAfterUpdates = true;
	Renderer._eventHandlersStateQueue = [];
	Renderer._rendered = [];
	Renderer._currentOwner = null;
	var nodeMap = Renderer._nodeMap = {};
	Renderer.renderOptions = {
	    nodeMap: nodeMap
	};
	
	Renderer.toVNode = function (el, prefix, parent, vnodeKey, context) {
	    if (el && "object" === typeof el && (el.isVNode || el.isVText || el.isWidget)) {
	        el.parent = parent;
	        el.key = getCanonicalKey(vnodeKey, prefix);
	        el.originalKey = vnodeKey;
	        return el;
	    }
	
	    var type = el.type,
	        typeofel = typeof type;
	
	    if (typeofel !== "string" && typeofel !== "function") {
	        return null;
	    }
	
	    var _owner = el._owner,
	        key = el.key,
	        vnode,
	        owner;
	
	    if (_owner == null) {
	        owner = Renderer._currentOwner;
	    } else {
	        owner = _owner._instance;
	    }
	
	    if (prefix == null) {
	        prefix = uniqueId("RootID");
	    }
	
	    if (vnodeKey != null) {
	        key = vnodeKey;
	    }
	
	    if ("function" === typeof type) {
	        vnode = new ComponentWidget(type, {
	            key: key,
	            prefix: prefix,
	            parent: parent
	        }, el, owner, context);
	    } else {
	        vnode = h(type, {
	            key: key,
	            prefix: prefix,
	            parent: parent
	        }, el, owner, context);
	    }
	
	    return vnode;
	};
	
	Renderer.findDOMNode = function (obj) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	
	    if (Renderer._currentOwner && obj === Renderer._currentOwner) {
	        msg = translator.translate("errors.findDOMNode-in-render", getDisplayRender(obj));
	        console.error(msg);
	    }
	
	    var invalidArgumentMsg = translator.translate("errors.findDOMNode-invalid-argument");
	    //////////
	
	    if (obj == null) {
	        return null;
	    }
	
	    if ("object" !== typeof obj || Array.isArray(obj)) {
	        ////////////////////////////////////////////////////////////////////
	        msg = invalidArgumentMsg;
	        throw new Error(msg);
	        /////////
	        ////////////
	        //////////
	    }
	
	    if (obj.nodeType === 1) {
	        return obj;
	    }
	
	    if (!hasProp.call(obj, expando)) {
	        ////////////////////////////////////////////////////////////////////
	        if ("function" === typeof obj.render) {
	            msg = translator.translate("errors.findDOMNode-on-unmounted");
	        } else {
	            msg = invalidArgumentMsg + (" (keys: " + Object.keys(obj) + ")");
	        }
	        throw new Error(msg);
	        //////////
	        return null;
	    }
	
	    var data = obj[expando],
	        removed = data.removed,
	        vnode = data.vnode;
	
	    return vnode && !removed && vnode.node || null;
	};
	
	Renderer.findVNodeAtNode = function (node) {
	    if (!hasProp.call(node, expando)) {
	        return null;
	    }
	
	    var inst = node[expando];
	    if (!hasProp.call(inst, "vrdomID")) {
	        return null;
	    }
	
	    return getVNodeFromMap(inst.vrdomID, nodeMap);
	};
	
	Renderer.unmountComponentAtNode = function (container) {
	    if (!isValidContainer(container)) {
	        ////////////////////////////////////////////////////////////////////
	        var msg = translator.translate("errors.invalid-container", "vrdom.unmountComponentAtNode()");
	        throw new Error(msg);
	        /////////
	        ////////////////////////////////////////////////
	        //////////
	    }
	
	    if (!hasProp.call(container, expando) || !hasProp.call(container[expando], "rootVNode")) {
	        return;
	    }
	
	    var inst = container[expando],
	        rootVNode = inst.rootVNode;
	
	    if (!hasProp.call(nodeMap, rootVNode.key)) {
	        return;
	    }
	
	    var renderOptions = assign({}, Renderer.renderOptions, {
	        document: getOwnerDocument(container)
	    });
	    updateTree(rootVNode, null, renderOptions);
	
	    // eslint-disable-next-line guard-for-in
	    for (var prop in inst) {
	        delete inst[prop];
	    }
	
	    delete container[expando];
	};
	
	Renderer.render = function (element, container, callback) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    if (!functions.isValidElement(element)) {
	        ////////////////////////////////////////////////////////////////////
	        msg = [translator.translate("errors.render-invalid-element")];
	
	        switch (typeof element) {
	            case "string":
	                msg.push(translator.translate("errors.render-string", element));
	                break;
	            case "function":
	                msg.push(translator.translate("errors.render-function", getDisplayName(element)));
	                break;
	            default:
	                break;
	        }
	
	        throw new Error(msg.join(" "));
	        //////////
	        return; // eslint-disable-line no-useless-return
	    }
	
	    if (!isValidContainer(container)) {
	        ////////////////////////////////////////////////////////////////////
	        msg = translator.translate("errors.invalid-container", "vrdom.render()");
	        throw new Error(msg);
	        /////////
	        ////////////////////////////////////////////////
	        //////////
	    }
	
	    if (Renderer._currentOwner) {
	        ////////////////////////////////////////////////////////////////////
	        msg = "Warning: " + translator.translate("errors.render-while-rendering") + " " + translator.translate("common.check-render-of", getDisplayName(Renderer._currentOwner));
	        console.error(msg);
	        //////////
	        return;
	    }
	
	    ////////////////////////////////////////////////////////////////////
	    if ("body" === container.nodeName.toLowerCase()) {
	        msg = translator.translate("errors.render-in-body");
	        console.error(msg);
	    }
	    //////////
	
	    var update, vnode, inst;
	
	    if (hasProp.call(container, expando) && hasProp.call(container[expando], "rootVNode")) {
	        inst = container[expando];
	        var rootVNode = inst.rootVNode;
	
	        if (rootVNode.willUnmount || !hasProp.call(nodeMap, rootVNode.key)) {
	            ////////////////////////////////////////////////////////////////////
	            msg = translator.translate("errors.mount-while-unmounting");
	            throw new Error(msg);
	            /////////
	            ////////////////////////////////////////////////
	            //////////
	        }
	
	        update = true;
	        vnode = rootVNode;
	    }
	
	    var renderedCheckpoint = Renderer._rendered.length;
	    var performAfterUpdates = Renderer._performAfterUpdates;
	    var topComponent;
	    var renderOptions = assign({}, Renderer.renderOptions, {
	        document: getOwnerDocument(container)
	    });
	
	    if (performAfterUpdates) {
	        Renderer._performAfterUpdates = false;
	    }
	
	    try {
	        if (update) {
	            if (vnode.isWidget) {
	                vnode.willReceive = true;
	            }
	            updateTree(vnode, element, renderOptions, vnode.context);
	        } else {
	            vnode = Renderer.toVNode(element);
	
	            if (vnode == null) {
	                ////////////////////////////////////////////////////////////////////
	                msg = translator.translate("errors.null-type", "vrdom.render(...)", element && element.type);
	                throw new Error(msg);
	                /////////
	                ////////////////////////////////////////////////
	                //////////
	            }
	
	            var rootNode = createNode(vnode, renderOptions);
	            container.appendChild(rootNode);
	        }
	    } finally {
	        vnode = processRendered(renderedCheckpoint);
	
	        if (vnode != null && !hasProp.call(nodeMap, vnode.key)) {
	            // an error occured while rendering
	            vnode = null;
	        }
	
	        if (vnode != null) {
	            if (update) {
	                if (inst.rootVNode !== vnode) {
	                    inst.rootVNode = vnode;
	                }
	            } else {
	                setExpandoData(container, {
	                    rootVNode: vnode
	                });
	            }
	
	            executeCallback(callback, vnode.getInstance(renderOptions));
	
	            processWidgetPendingState(vnode);
	            if (performAfterUpdates) {
	                processAfterUpdates();
	            }
	
	            vnode = getVNodeFromMap(vnode.key, nodeMap);
	        }
	
	        if (vnode != null) {
	            topComponent = vnode.getInstance(renderOptions);
	        }
	    }
	
	    return topComponent; // eslint-disable-line consistent-return
	};
	
	Renderer.updateState = function (method, component, state, replace, callback) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	
	    if (Renderer._currentOwner === component) {
	        msg = "Warning: " + translator.translate("errors.updating-during-render", getDisplayName(component), method + "(...)", getDisplayRender(component));
	        console.error(msg);
	    }
	    //////////
	
	    var inst, vnode;
	
	    if (hasProp.call(component, expando)) {
	        inst = component[expando];
	
	        if (inst.willUnmount) {
	            return;
	        }
	
	        vnode = inst.vnode;
	    }
	
	    var pendingCallbacks;
	    if (callback) {
	        pendingCallbacks = [callback];
	    }
	
	    if (vnode && vnode.cycle) {
	        vnode.enqueueState(method, state, replace, pendingCallbacks);
	        return;
	    }
	
	    if (Renderer._eventHandler) {
	        vnode.enqueueState(method, state, replace, pendingCallbacks);
	        Renderer._eventHandler.push(vnode);
	        return;
	    }
	
	    if (!vnode || !hasProp.call(nodeMap, vnode.key)) {
	        ////////////////////////////////////////////////////////////////////
	        if (!msg) {
	            msg = "Warning: " + translator.translate("errors.updating-unmounted", getDisplayName(component), method + "(...)");
	            console.error(msg);
	        }
	        //////////
	        return;
	    }
	
	    var renderedCheckpoint = Renderer._rendered.length;
	    var performAfterUpdates = Renderer._performAfterUpdates;
	
	    if (performAfterUpdates) {
	        Renderer._performAfterUpdates = false;
	    }
	
	    vnode.enqueueState(method, state, replace);
	    var renderOptions = assign({}, Renderer.renderOptions, {
	        document: getOwnerDocument(vnode.node)
	    });
	
	    try {
	        updateTree(vnode, vnode.element, renderOptions, component.context);
	    } finally {
	        processRendered(renderedCheckpoint);
	        executeCallback(callback, component);
	        processWidgetPendingState(vnode);
	        if (performAfterUpdates) {
	            processAfterUpdates();
	        }
	    }
	};
	
	Renderer.processEventHandler = function () {
	    if (Renderer._eventHandler) {
	        var widgets = Renderer._eventHandler;
	        Renderer._eventHandler = null;
	
	        var widget;
	        for (var j = 0, len = widgets.length; j < len; j++) {
	            widget = widgets[j];
	            processWidgetPendingState(widget);
	        }
	
	        processAfterUpdates();
	    }
	};
	
	function executeCallback(callback, ret) {
	    if (callback != null) {
	        if ("function" === typeof callback) {
	            callback.call(ret);
	        }
	        ////////////////////////////////////////////////////////////////////
	        else {
	                var msg = translator.translate("errors.invalid-callback", formatArgument(callback));
	                throw new Error(msg);
	            }
	        //////////
	    }
	}
	
	function processRendered(renderedCheckpoint) {
	    var rendered = Renderer._rendered.slice(renderedCheckpoint);
	    Renderer._rendered.length = renderedCheckpoint;
	
	    var args, vnode, method, component, callbacks;
	
	    for (var i = 0, len = rendered.length, lastIndex = len - 1; i < len; i++) {
	        args = rendered[i];
	        vnode = args[0];
	        method = args[1];
	        args = args[2];
	
	        processAfterUpdate(vnode);
	
	        if (method) {
	            if (vnode[method]) {
	                vnode[method].apply(vnode, args);
	            }
	
	            callVNodeHooks(method, vnode);
	        }
	
	        if (vnode.callbacks) {
	            callbacks = vnode.callbacks;
	            vnode.callbacks = undefined;
	            component = vnode.getInstance();
	
	            for (var j = 0, lenj = callbacks.length; j < lenj; j++) {
	                executeCallback(callbacks[j], component);
	            }
	        }
	
	        vnode.cycle = false;
	
	        if (i !== lastIndex) {
	            processWidgetPendingState(vnode);
	        }
	    }
	
	    return vnode;
	}
	
	function processWidgetPendingState(widget) {
	    if (!widget || !widget.pendingState) {
	        return;
	    }
	
	    var pendingMethod = widget.pendingMethod,
	        pendingState = widget.pendingState,
	        pendingReplace = widget.pendingReplace,
	        pendingCallbacks = widget.pendingCallbacks,
	        component = widget.getInstance();
	
	    widget.pendingMethod = undefined;
	    widget.pendingState = undefined;
	    widget.pendingReplace = undefined;
	    widget.pendingCallbacks = undefined;
	
	    Renderer.updateState(pendingMethod, component, pendingState, pendingReplace);
	
	    if (pendingCallbacks) {
	        for (var j = 0, len = pendingCallbacks.length; j < len; j++) {
	            executeCallback(pendingCallbacks[j], component);
	        }
	    }
	}
	
	function processAfterUpdates() {
	    Renderer._performAfterUpdates = true;
	    var updates = Renderer._afterUpdates;
	    Renderer._afterUpdates = {};
	
	    for (var key in updates) {
	        if (hasProp.call(nodeMap, key)) {
	            processAfterUpdate(nodeMap[key].vnode, true);
	        }
	    }
	}
	
	function processAfterUpdate(vnode, noCheck) {
	    if (noCheck || hasProp.call(Renderer._afterUpdates, vnode.key)) {
	        if (!noCheck) {
	            delete Renderer._afterUpdates[vnode.key];
	        }
	
	        var domNode = vnode.node,
	            type = vnode.tagName;
	
	        if (hasProp.call(controls.afterUpdates, type)) {
	            controls.afterUpdates[type](vnode, domNode);
	        }
	    }
	}
	
	createNode = __webpack_require__(46);
	updateTree = __webpack_require__(68);
	h = __webpack_require__(69);
	ComponentWidget = __webpack_require__(71);
	controls = __webpack_require__(59);

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = __webpack_require__(3).hasProp;
	
	var anonymousHooks = {};
	var namedHooks = {};
	var push = Array.prototype.push;
	
	function appendHook(type, name, fn) {
	    var hooks;
	
	    if ("function" === typeof name) {
	        fn = name;
	        name = null;
	    }
	
	    if (name) {
	        name = name.trim();
	
	        if (/\s/.test(name)) {
	            var names = name.split(/\s+/);
	
	            for (var i = 0, len = names.length; i < len; i++) {
	                name = names[i];
	                appendHook(type, name, fn);
	            }
	            return;
	        }
	
	        if (hasProp.call(namedHooks, name)) {
	            hooks = namedHooks[name];
	        } else {
	            hooks = namedHooks[name] = {};
	        }
	    } else {
	        hooks = anonymousHooks;
	    }
	
	    if (hasProp.call(hooks, type)) {
	        hooks[type].push(fn);
	    } else {
	        hooks[type] = [fn];
	    }
	}
	
	function prependHook(type, name, fn) {
	    var hooks;
	
	    if ("function" === typeof name) {
	        fn = name;
	        name = null;
	    }
	
	    if (name) {
	        name = name.trim();
	
	        if (/\s/.test(name)) {
	            var names = name.split(/\s+/).reverse();
	
	            for (var i = 0, len = names.length; i < len; i++) {
	                name = names[i];
	                prependHook(type, name, fn);
	            }
	            return;
	        }
	
	        if (hasProp.call(namedHooks, name)) {
	            hooks = namedHooks[name];
	        } else {
	            hooks = namedHooks[name] = {};
	        }
	    } else {
	        hooks = anonymousHooks;
	    }
	
	    if (hasProp.call(hooks, type)) {
	        hooks[type].unshift(fn);
	    } else {
	        hooks[type] = [fn];
	    }
	}
	
	function removeHook(type, name, fn) {
	    var hooks;
	
	    if ("function" === typeof name) {
	        fn = name;
	        name = null;
	    }
	
	    if (name) {
	        name = name.trim();
	        if (/\s/.test(name)) {
	            var names = name.split(/\s+/).reverse();
	
	            for (var i = 0, len = names.length; i < len; i++) {
	                name = names[i];
	                removeHook(type, name, fn);
	            }
	            return;
	        }
	
	        if (hasProp.call(namedHooks, name)) {
	            hooks = namedHooks[name];
	        } else {
	            hooks = namedHooks[name] = {};
	        }
	    } else {
	        hooks = anonymousHooks;
	    }
	
	    if (hasProp.call(hooks, type)) {
	        var fns = hooks[type];
	        var idx = fns.lastIndexOf(fn);
	
	        if (idx !== -1) {
	            fns.splice(idx, 1);
	        }
	
	        if (fns.length === 0) {
	            delete hooks[type];
	            if (name) {
	                delete namedHooks[name];
	            }
	        }
	    }
	}
	
	function getHooks(type, name, checkOnly) {
	    var hooks;
	    var fns = [];
	
	    if (name != null) {
	        if ("string" !== typeof name) {
	            if (checkOnly) {
	                return false;
	            }
	            return fns;
	        }
	
	        name = name.trim();
	        if (/\s/.test(name)) {
	            var names = name.split(/\s+/).reverse();
	
	            for (var i = 0, len = names.length; i < len; i++) {
	                name = names[i];
	                if (checkOnly) {
	                    if (getHooks(type, name, checkOnly)) {
	                        return true;
	                    }
	                } else {
	                    push.apply(fns, getHooks(type, name));
	                }
	            }
	
	            if (checkOnly) {
	                return false;
	            }
	
	            return fns;
	        }
	
	        if (hasProp.call(namedHooks, name)) {
	            hooks = namedHooks[name];
	        } else {
	            if (checkOnly) {
	                return false;
	            }
	            return fns;
	        }
	    } else {
	        hooks = anonymousHooks;
	    }
	
	    if (hasProp.call(hooks, type)) {
	        if (checkOnly) {
	            return true;
	        }
	        return hooks[type];
	    }
	
	    if (checkOnly) {
	        return false;
	    }
	
	    return fns;
	}
	
	function hasHooks(type, name) {
	    return getHooks(type, name, true);
	}
	
	function callVNodeHooks(name, vnode) {
	    var fns = getHooks(name, vnode.type).concat(getHooks(name));
	    for (var i = 0, len = fns.length; i < len; i++) {
	        fns[i](vnode);
	    }
	}
	
	module.exports = {
	    appendHook: appendHook,
	    prependHook: prependHook,
	    removeHook: removeHook,
	    getHooks: getHooks,
	    hasHooks: hasHooks,
	    callVNodeHooks: callVNodeHooks
	};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var globalDocument = __webpack_require__(36);
	
	var setProperties = __webpack_require__(47);
	
	var functions = __webpack_require__(3);
	var assign = functions.assign;
	var getKeyAndPrefixFromCanonicalKey = functions.getKeyAndPrefixFromCanonicalKey;
	var getOwnerDocument = functions.getOwnerDocument;
	var isObject = functions.isObject;
	var setExpandoData = functions.setExpandoData;
	var updateNodeMap = functions.updateNodeMap;
	
	module.exports = createNode;
	
	var Renderer = __webpack_require__(44);
	
	var Namespaces = __webpack_require__(67);
	var HTMLnamespace = Namespaces.HTMLnamespace;
	
	function createNode(vnode, opts) {
	    var domNode;
	
	    if (vnode == null) {
	        return null;
	    }
	
	    var doc = opts.document ? opts.document : globalDocument;
	    var nodeMap = opts.nodeMap;
	
	    if (vnode.isWidget) {
	        domNode = vnode.init(opts);
	    } else if (vnode.isVText) {
	        domNode = doc.createTextNode(vnode.text);
	        Renderer._rendered.push([vnode, "componentDidMount", []]);
	    } else if (vnode.isVNode) {
	        var namespace = vnode.namespace;
	        var tagName = vnode.tagName;
	
	        domNode = namespace !== HTMLnamespace ? doc.createElementNS(namespace, tagName) : vnode.is != null ? doc.createElement(tagName, vnode.is) : doc.createElement(tagName);
	
	        var props = vnode.props;
	
	        setProperties(vnode, domNode, props);
	
	        var children = vnode.children;
	
	        var innerHTML = isObject(props.dangerouslySetInnerHTML) && props.dangerouslySetInnerHTML.__html;
	        var textContent = "string" === typeof children || "number" === typeof children ? children : null;
	
	        if (innerHTML != null) {
	            domNode.innerHTML = innerHTML;
	        } else if (textContent != null) {
	            domNode.textContent = textContent;
	        } else {
	            var child, keyPrefix;
	            var childContext = vnode.context;
	            opts = assign({}, opts, {
	                document: getOwnerDocument(domNode)
	            });
	
	            // eslint-disable-next-line guard-for-in
	            for (var canonicalKey in children) {
	                keyPrefix = getKeyAndPrefixFromCanonicalKey(canonicalKey);
	
	                child = Renderer.toVNode(children[canonicalKey], keyPrefix[1], vnode, keyPrefix[0], childContext);
	                children[canonicalKey] = child;
	
	                var childNode = createNode(child, opts);
	                if (childNode) {
	                    domNode.appendChild(childNode);
	                }
	            }
	        }
	
	        setExpandoData(domNode, {
	            vrdomID: vnode.key
	        });
	
	        Renderer._afterUpdates[vnode.key] = true;
	        Renderer._rendered.push([vnode, "componentDidMount", []]);
	    }
	
	    updateNodeMap(null, vnode, domNode, nodeMap);
	    return domNode;
	}

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = setProperties;
	
	var destroyers = __webpack_require__(26);
	var expando = __webpack_require__(2);
	var functions = __webpack_require__(3);
	var hasProp = functions.hasProp;
	var hasEditableValue = functions.hasEditableValue;
	var normalizeCssProps = functions.normalizeCssProps;
	var setExpandoData = functions.setExpandoData;
	
	var xml = __webpack_require__(48);
	var XMLNameReg = xml.XMLNameReg;
	var XMLNameCharReg = xml.XMLNameCharReg;
	
	var localEvents = __webpack_require__(49).locals;
	
	var EventListener = __webpack_require__(51);
	var EVENT_ATTR_REG = new RegExp("^on" + XMLNameCharReg.source + "*$");
	
	var w3c = __webpack_require__(56);
	var CUSTOM_TAG_ATTR_REG = new RegExp("^(?:data|aria)-" + XMLNameCharReg.source + "*$", "i");
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	var controls = __webpack_require__(59);
	var validAttributes = {};
	var invalidAttributes = {};
	var knownStyles = {};
	
	destroyers.reset.push(function () {
	    validAttributes = {};
	    invalidAttributes = {};
	    knownStyles = {};
	});
	
	var CSSPropAcceptLength = __webpack_require__(65);
	var CSSPropAcceptNumber = __webpack_require__(66);
	
	var customAttributes = {
	    onchange: "onChange",
	    valuelink: "valueLink",
	    checkedlink: "checkedLink"
	};
	
	var EMPTY_OBJECT = Object.create(null);
	
	function setProperties(vnode, node, nextProps, prevProps) {
	    var propName, eventName;
	    var element = vnode.element;
	    var type = element.type;
	    var isCustomTag, hasChanged;
	
	    nextProps = normalizeDomProps(type, nextProps);
	
	    if (nextProps == null) {
	        isCustomTag = prevProps.is != null || type.indexOf("-") !== -1;
	
	        if (hasProp.call(controls.onChange, type) && !hasProp.call(prevProps, "onChange")) {
	            // controll value even if there is no onChange prop
	            removeEventListener(type, prevProps, node, "Change");
	        }
	
	        // remove event listeners
	        for (propName in prevProps) {
	            if (EVENT_ATTR_REG.test(propName)) {
	                removeEventListener(type, prevProps, node, propName.slice(2));
	            }
	        }
	
	        // removeListeners for local events that are difficult to listen globally on all browsers
	        if (hasProp.call(localEvents, type)) {
	            // eslint-disable-next-line guard-for-in
	            for (eventName in localEvents[type]) {
	                removeEventListener(type, prevProps, node, eventName);
	            }
	        }
	
	        return true;
	    }
	
	    isCustomTag = nextProps.is != null || type.indexOf("-") !== -1;
	
	    if (prevProps) {
	        hasChanged = false;
	    } else {
	        hasChanged = true;
	        vnode.props = nextProps;
	
	        // addListeners for local events that do not bubble but would be nice if they do
	        if (hasProp.call(localEvents, type)) {
	            // eslint-disable-next-line guard-for-in
	            for (eventName in localEvents[type]) {
	                addEventListener(type, nextProps, node, eventName, null, true);
	            }
	        }
	
	        // controll value even if there is no onChange prop
	        if (hasProp.call(controls.onChange, type) && !hasProp.call(nextProps, "onChange")) {
	            addEventListener(type, nextProps, node, "Change", undefined, false);
	        }
	    }
	
	    // set type before changing other properties
	    if (type === "input" && (hasProp.call(nextProps, "type") || prevProps && hasProp.call(prevProps, "type"))) {
	        hasChanged = setProperty(type, node, "type", nextProps, prevProps, isCustomTag) || hasChanged;
	    }
	
	    for (propName in prevProps) {
	        if (type === "input" && propName === "type") {
	            continue;
	        }
	
	        if (!hasProp.call(nextProps, propName)) {
	            hasChanged = setProperty(type, node, propName, nextProps, prevProps, isCustomTag) || hasChanged;
	            delete prevProps[propName];
	        }
	    }
	
	    for (propName in nextProps) {
	        if (type === "input" && propName === "type") {
	            continue;
	        }
	
	        hasChanged = setProperty(type, node, propName, nextProps, prevProps, isCustomTag) || hasChanged;
	    }
	
	    return hasChanged;
	}
	
	function normalizeDomProps(type, props) {
	    if (props == null) {
	        return props;
	    }
	
	    var normalized = {};
	    var normalizedProp, lpropName;
	    var keys = {};
	
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    // eslint-disable-next-line guard-for-in
	    for (var propName in props) {
	        switch (propName) {
	            case "dangerouslySetInnerHTML":
	            case "suppressContentEditableWarning":
	            case "innerHTML":
	                normalizedProp = propName;
	                break;
	
	            default:
	                lpropName = propName.toLowerCase();
	                if (hasProp.call(w3c.properties, propName)) {
	                    normalizedProp = propName;
	                } else if (CUSTOM_TAG_ATTR_REG.test(propName)) {
	                    normalizedProp = lpropName;
	                } else if (hasProp.call(w3c.attributes, propName)) {
	                    normalizedProp = w3c.attributes[propName];
	
	                    ////////////////////////////////////////////////////////////////////
	                    msg = "Warning: " + translator.translate("errors.unkown-attribute", propName, normalizedProp, type);
	                    console.error(msg);
	                    //////////
	                } else if (hasProp.call(w3c.attributes, lpropName)) {
	                    normalizedProp = w3c.attributes[lpropName];
	
	                    ////////////////////////////////////////////////////////////////////
	                    msg = "Warning: " + translator.translate("errors.unkown-attribute", propName, normalizedProp, type);
	                    console.error(msg);
	                    //////////
	                } else if (hasProp.call(customAttributes, lpropName)) {
	                    normalizedProp = customAttributes[lpropName];
	                } else {
	                    normalizedProp = lpropName;
	                }
	
	                if (hasProp.call(keys, normalizedProp)) {
	                    ////////////////////////////////////////////////////////////////////
	                    msg = "Warning: " + translator.translate("errors.duplicate-prop", propName, keys[normalizedProp], type);
	                    console.error(msg);
	                    //////////
	                    continue;
	                }
	        }
	
	        keys[normalizedProp] = propName;
	        normalized[normalizedProp] = props[propName];
	    }
	
	    return normalized;
	}
	
	function setProperty(type, node, propName, nextProps, prevProps, isCustomTag) {
	    var prevValue = prevProps && prevProps[propName];
	    var nextValue = nextProps[propName];
	    var hasChanged = false;
	
	    switch (propName) {
	        case "dangerouslySetInnerHTML":
	        case "children":
	        case "suppressContentEditableWarning":
	        case "innerHTML":
	            return hasChanged;
	        case "style":
	            hasChanged = setStyle(type, node, nextValue, prevValue);
	            if (prevProps) {
	                prevProps.style = nextValue;
	            }
	            return hasChanged;
	        default:
	            // do nothing
	            break;
	    }
	
	    if (EVENT_ATTR_REG.test(propName)) {
	        addEventListener(type, nextProps, node, propName.slice(2), nextValue, false);
	        if (prevProps) {
	            prevProps[propName] = nextValue;
	        }
	        return true;
	    }
	
	    if (hasProp.call(w3c.properties, propName)) {
	        var propConfig = w3c.properties[propName];
	
	        var attrName = propConfig.attrName;
	        var namespace = propConfig.namespace;
	        var isBoolean = propConfig.isBoolean;
	        var isProperty = propConfig.isProperty;
	        var isString = propConfig.type === "String";
	
	        if (isProperty) {
	            if (shouldRemoveAttribute(propConfig, prevValue)) {
	                prevValue = isBoolean ? false : "";
	            } else if (isString) {
	                prevValue = String(prevValue);
	            }
	
	            // removing checked should preserve existing checked
	            if (type === "input" && attrName === "checked" && (nextProps.type === "checkbox" || nextProps.type === "radio") && !hasProp.call(nextProps, "checked")) {
	                nextValue = prevValue;
	            } else if (shouldRemoveAttribute(propConfig, nextValue)) {
	                nextValue = isBoolean ? false : "";
	            } else if (isString) {
	                nextValue = String(nextValue);
	            }
	
	            if (prevValue !== nextValue) {
	                hasChanged = true;
	                if (isBoolean) {
	                    if (nextValue) {
	                        setAttribute(node, attrName, "", namespace);
	                    } else {
	                        setAttribute(node, attrName, undefined, namespace);
	                    }
	                } else {
	                    setAttribute(node, attrName, String(nextValue), namespace);
	                }
	                node[propName] = nextValue;
	            }
	        } else if (shouldRemoveAttribute(propConfig, nextValue)) {
	            if (!shouldRemoveAttribute(propConfig, prevValue)) {
	                hasChanged = true;
	                setAttribute(node, attrName, undefined, namespace);
	            }
	        } else {
	            prevValue = getPropvalue(prevValue);
	            nextValue = getPropvalue(nextValue);
	
	            if (prevValue !== nextValue) {
	                hasChanged = true;
	                setAttribute(node, attrName, nextValue, namespace);
	            }
	        }
	    } else if (isCustomTag || CUSTOM_TAG_ATTR_REG.test(propName)) {
	        var _prevValue = getPropvalue(prevValue);
	        var _nextValue = getPropvalue(nextValue);
	
	        if (_prevValue !== _nextValue) {
	            hasChanged = true;
	            if (typeof nextValue === "boolean") {
	                if (nextValue) {
	                    _nextValue = "";
	                } else {
	                    _nextValue = undefined;
	                }
	            }
	            setAttribute(node, propName, _nextValue);
	        }
	    } else {
	        hasChanged = true;
	        if (typeof nextValue === "string") {
	            setAttribute(node, propName, nextValue);
	        } else if (nextValue === true) {
	            setAttribute(node, propName, "");
	        } else if (nextValue === false) {
	            setAttribute(node, propName, undefined);
	        }
	        node[propName] = nextValue;
	    }
	
	    if (prevProps && prevProps[propName] !== nextProps[propName]) {
	        prevProps[propName] = nextProps[propName];
	    }
	
	    return hasChanged;
	}
	
	function getPropvalue(value) {
	    return value == null ? undefined : String(value);
	}
	
	function isEmpty(obj) {
	    // eslint-disable-next-line guard-for-in
	    for (var key in obj) {
	        return true;
	    }
	
	    return false;
	}
	
	function setStyle(type, node, nextStyle, prevStyle) {
	    var cssProp, value, typeofValue, styleProp;
	
	    prevStyle = normalizeCssProps(prevStyle, type, true);
	    nextStyle = normalizeCssProps(nextStyle, type, true);
	
	    if (nextStyle && "object" === typeof nextStyle) {
	        if (prevStyle && "object" === typeof prevStyle) {
	            for (cssProp in prevStyle) {
	                if (!hasProp.call(nextStyle, cssProp)) {
	                    styleProp = getStyleProp(cssProp, node);
	                    node.style[styleProp] = "";
	                }
	            }
	        }
	
	        // eslint-disable-next-line guard-for-in
	        for (cssProp in nextStyle) {
	            value = nextStyle[cssProp];
	            typeofValue = typeof value;
	            styleProp = getStyleProp(cssProp, node);
	
	            if (value == null || "boolean" === typeofValue) {
	                node.style[styleProp] = "";
	            } else if ("number" === typeofValue && hasProp.call(CSSPropAcceptLength, cssProp) && !hasProp.call(CSSPropAcceptNumber, cssProp)) {
	                node.style[styleProp] = value + "px";
	            } else {
	                node.style[styleProp] = value;
	            }
	        }
	    } else if (prevStyle && "object" === typeof prevStyle) {
	        // eslint-disable-next-line guard-for-in
	        for (cssProp in prevStyle) {
	            styleProp = getStyleProp(cssProp, node);
	            node.style[styleProp] = "";
	        }
	    }
	}
	
	function getStyleProp(cssProp, node) {
	    if (hasProp.call(knownStyles, cssProp)) {
	        return knownStyles[cssProp];
	    }
	
	    var styleProp = cssProp;
	    var style = node.style;
	
	    if (styleProp in style) {
	        knownStyles[cssProp] = styleProp;
	        return styleProp;
	    }
	
	    // https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix
	    // Modernizr/src/omPrefixes.js
	    var omPrefixes = ["Webkit", "Moz", "O", "ms"];
	    var ccssProp = cssProp[0].toUpperCase() + cssProp.slice(1);
	
	    for (var i = 0, len = omPrefixes.length; i < len; i++) {
	        styleProp = omPrefixes[i] + ccssProp;
	        if (styleProp in style) {
	            knownStyles[cssProp] = styleProp;
	            return styleProp;
	        }
	    }
	
	    return cssProp;
	}
	
	function setAttribute(node, attrName, attrValue, namespace) {
	    if (hasProp.call(invalidAttributes, attrName)) {
	        return;
	    }
	
	    if (!hasProp.call(validAttributes, attrName) && !XMLNameReg.test(attrName)) {
	        invalidAttributes[attrName] = true;
	        ////////////////////////////////////////////////////////////////////
	        var msg = "Warning: " + translator.translate("errors.invalid-attribute", attrName);
	        console.error(msg);
	        //////////
	        return;
	    }
	
	    var currentValue;
	    validAttributes[attrName] = true;
	
	    if (attrValue == null) {
	        if (node.hasAttribute(attrName)) {
	            node.removeAttribute(attrName);
	        }
	    } else if (namespace) {
	        currentValue = node.getAttributeNS(namespace, attrName);
	        if (!currentValue || currentValue !== attrValue) {
	            node.setAttributeNS(namespace, attrName, attrValue);
	        }
	    } else {
	        currentValue = node.getAttribute(attrName);
	        if (attrName === "value" && node.tagName === "TEXTAREA") {
	            // should not render value as an attribute for textarea
	            if (node.value !== attrValue) {
	                node.value = attrValue;
	            }
	        } else {
	            if (attrName === "value" && hasEditableValue(node.tagName.toLowerCase(), { type: node.type })) {
	                // also set value for element with editable values
	                if (node.value !== attrValue) {
	                    node.value = attrValue;
	                }
	            }
	
	            if (!currentValue || currentValue !== attrValue) {
	                node.setAttribute(attrName, attrValue);
	            }
	        }
	    }
	}
	
	function addEventListener(type, nextProps, node, eventName, value, local) {
	    var data,
	        eventType,
	        removeEventListeners = [];
	
	    var context = {
	        local: local,
	        handler: value
	    };
	
	    if (eventName === "Change") {
	        eventType = getChangeEventName(type, nextProps);
	        if (hasProp.call(controls.onChange, type)) {
	            context.handler = controls.onChange[type](type, nextProps);
	        }
	    } else {
	        eventType = eventName;
	    }
	
	    if (Array.isArray(eventType)) {
	        eventType.forEach(function (eventType) {
	            EventListener.addEventListener(context, node, eventName, eventType);
	            if (context.removeEventListener) {
	                removeEventListeners.push(context.removeEventListener);
	                delete context.removeEventListener;
	            }
	        });
	
	        if (removeEventListeners.length !== 0) {
	            context.removeEventListener = removeEventListeners;
	        }
	    } else {
	        EventListener.addEventListener(context, node, eventName, eventType);
	    }
	
	    if (context.removeEventListener) {
	        data = setExpandoData(node, {});
	
	        if (hasProp.call(data, "eventHandlers")) {
	            data = data.eventHandlers;
	        } else {
	            data = data.eventHandlers = {};
	        }
	
	        data[eventName] = context;
	    }
	}
	
	function removeEventListener(type, props, node, eventName) {
	    var inst, data, eventType;
	
	    var context = EMPTY_OBJECT;
	
	    if (eventName === "Change") {
	        eventType = getChangeEventName(type, props);
	    } else {
	        eventType = eventName;
	    }
	
	    if (hasProp.call(node, expando)) {
	        inst = node[expando];
	
	        if (hasProp.call(inst, "eventHandlers")) {
	            data = inst.eventHandlers;
	
	            if (hasProp.call(data, eventName)) {
	                context = data[eventName];
	
	                delete data[eventName];
	                if (isEmpty(data)) {
	                    delete inst.eventHandlers;
	                }
	            }
	        }
	    }
	
	    if (Array.isArray(context.removeEventListener)) {
	        context.removeEventListener.forEach(function (removeEventListener) {
	            removeEventListener();
	        });
	
	        delete context.removeEventListener;
	        return;
	    }
	
	    if (Array.isArray(eventType)) {
	        eventType.forEach(function (eventType) {
	            EventListener.removeEventListener(context, node, eventName, eventType);
	        });
	    } else {
	        EventListener.removeEventListener(context, node, eventName, eventType);
	    }
	}
	
	function shouldRemoveAttribute(config, value) {
	    var isBoolean = config.isBoolean,
	        isNumber = config.isNumber,
	        isPositive = config.isPositive;
	
	    return value == null || isBoolean && !value || isNumber && isNaN(value) || isPositive && value < 1;
	}
	
	function getChangeEventName(type, props) {
	    if (hasEditableValue(type, props) && type !== "select") {
	        return ["input", "change"];
	    }
	
	    return "Change";
	}

/***/ }),
/* 48 */
/***/ (function(module, exports) {

	// https://www.w3.org/TR/REC-xml/#NT-XMLNameStartCharReg
	
	var XMLNameStartCharReg = /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
	var XMLNameCharReg = new RegExp("[" + XMLNameStartCharReg.source.slice(1, -1) + /-\.0-9\u00B7\u0300-\u036F\u203F-\u2040/.source + "]");
	var XMLNameReg = new RegExp("^" + XMLNameStartCharReg.source + XMLNameCharReg.source + "*$");
	
	exports.XMLNameStartCharReg = XMLNameStartCharReg;
	exports.XMLNameCharReg = XMLNameCharReg;
	exports.XMLNameReg = XMLNameReg;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	var globalWindow = __webpack_require__(50);
	var globalDocument = __webpack_require__(36);
	var functions = __webpack_require__(3);
	var assign = functions.assign;
	var hasProp = functions.hasProp;
	
	// https://www.w3.org/TR/2016/REC-html51-20161101/
	// https://www.w3.org/TR/2016/WD-uievents-20160804/
	// https://www.w3.org/TR/html51/semantics-embedded-content.html#media-elements-event-summary
	// https://developer.mozilla.org/en-US/docs/Web/Events
	
	var eventNames = {
	    DoubleClick: {
	        eventType: "dbclick"
	    },
	    Error: {
	        local: {
	            embed: 1,
	            iframe: 1,
	            img: 1,
	            object: 1,
	            script: 1
	        }
	    },
	    Invalid: {
	        local: {
	            input: 1,
	            select: 1,
	            textarea: 1
	        }
	    },
	    Load: {
	        local: {
	            embed: 1,
	            iframe: 1,
	            img: 1,
	            object: 1
	        }
	    },
	    Reset: {
	        local: {
	            form: 1
	        }
	    },
	    Submit: {
	        local: {
	            form: 1
	        }
	    }
	};
	
	if (!(globalDocument.documentMode > 0)) {
	    // no error event on source in IE
	    eventNames.Error.local.source = 1;
	}
	
	// ================================================================
	// CSSOM events
	// ================================================================
	(function () {
	    var prefix;
	    var style = globalDocument.createElement("div").style;
	
	    prefix = getStylePrefix("Animation", style);
	    if (prefix != null) {
	        eventNames.AnimationEnd = {
	            eventType: getStyleEventName(prefix, "AnimationEnd")
	        };
	        eventNames.AnimationIteration = {
	            eventType: getStyleEventName(prefix, "AnimationIteration")
	        };
	        eventNames.AnimationStart = {
	            eventType: getStyleEventName(prefix, "AnimationStart")
	        };
	    }
	
	    prefix = getStylePrefix("Transition", style);
	    if (prefix != null) {
	        eventNames.TransitionEnd = {
	            eventType: getStyleEventName(prefix, "TransitionEnd")
	        };
	    }
	
	    style = null;
	})();
	
	// ================================================================
	// media events
	// https://www.w3.org/TR/html51/semantics-embedded-content.html#media-elements-event-summary
	// https://developer.mozilla.org/en-US/docs/Web/Events
	// ================================================================
	(function () {
	    var MediaEvents = ["LoadStart", "Progress", "Suspend", "Abort", "Error", "Emptied", "Stalled", "LoadedMetadata", "LoadedData", "CanPlay", "CanPlayThrough", "Playing", "Waiting", "Seeking", "Seeked", "Ended", "DurationChange", "TimeUpdate", "Play", "Pause", "RateChange", "VolumeChange", "Resize",
	
	    // Encrypted Media Extensions events
	    "Encrypted", "KeyStatusChange", "Message", "WaitingForKey"];
	
	    var config, eventName, local;
	    for (var i = 0, len = MediaEvents.length; i < len; i++) {
	        eventName = MediaEvents[i];
	        local = {
	            audio: 1,
	            video: 1
	        };
	
	        if (!hasProp.call(eventNames, eventName)) {
	            eventNames[eventName] = {};
	        }
	
	        config = eventNames[eventName];
	
	        if (hasProp.call(config, "local")) {
	            assign(config.local, local);
	        } else {
	            config.local = local;
	        }
	    }
	})();
	
	// ================================================================
	// File API events
	// https://developer.mozilla.org/en-US/docs/Web/Events
	// ================================================================
	(function () {
	    var FileAPIEvents = ["Abort", "Error", "Load", "LoadEnd", "LoadStart", "Progress"];
	
	    var config, eventName, local;
	    for (var i = 0, len = FileAPIEvents.length; i < len; i++) {
	        eventName = FileAPIEvents[i];
	        local = {
	            file: 1
	        };
	
	        if (!hasProp.call(eventNames, eventName)) {
	            eventNames[eventName] = {};
	        }
	
	        config = eventNames[eventName];
	
	        if (hasProp.call(config, "local")) {
	            assign(config.local, local);
	        } else {
	            config.local = local;
	        }
	    }
	})();
	
	// ================================================================
	// blur and focus event
	// ================================================================
	eventNames.Blur = {};
	eventNames.Focus = {};
	eventNames.Blur.useCapture = true;
	eventNames.Focus.useCapture = true;
	
	// ================================================================
	// scroll event
	// ================================================================
	eventNames.Scroll = {};
	eventNames.Scroll.useCapture = true;
	
	// ================================================================
	// Window events
	// ================================================================
	(function () {
	    var WindowEvents = [
	    // "Abort", // Also available for others
	    "AfterPrint", "BeforePrint", "BeforeUnload", "HashChange", "PageHide", "PageShow", "PopState", "Resize", "Storage", "Unload"];
	
	    var eventName, config;
	
	    for (var i = 0, len = WindowEvents.length; i < len; i++) {
	        eventName = WindowEvents[i];
	
	        if (!hasProp.call(eventNames, eventName)) {
	            eventNames[eventName] = {};
	        }
	
	        config = eventNames[eventName];
	        config.target = globalWindow;
	    }
	})();
	
	// ================================================================
	// compute local events
	// ================================================================
	var locals = {};
	var Events = {};
	
	(function () {
	
	    var normalizedName, config;
	
	    // eslint-disable-next-line guard-for-in
	    for (var eventName in eventNames) {
	        config = eventNames[eventName];
	        normalizedName = eventName.toLowerCase();
	
	        if (!hasProp.call(config, "useCapture")) {
	            config.useCapture = false;
	        }
	
	        if (!hasProp.call(config, "eventType")) {
	            config.eventType = normalizedName;
	        }
	
	        addLocal(locals, config.local, normalizedName);
	        Events[normalizedName] = config;
	    }
	})();
	
	module.exports = {
	    Events: Events,
	    locals: locals
	};
	
	function addLocal(locals, config, eventName) {
	    if (config) {
	        var local;
	        for (local in config) {
	            if (hasProp.call(locals, local)) {
	                local = locals[local];
	            } else {
	                local = locals[local] = {};
	            }
	            local[eventName] = 1;
	        }
	    }
	}
	
	// https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix
	function getStylePrefix(name, style) {
	    var styleProp = name.toLowerCase();
	    if (styleProp in style) {
	        return "";
	    }
	
	    // Modernizr/src/omPrefixes.js
	    var omPrefixes = ["Webkit", "Moz", "O", "ms"];
	    var prefix;
	
	    for (var i = 0, len = omPrefixes.length; i < len; i++) {
	        prefix = omPrefixes[i];
	        styleProp = prefix + name;
	        if (styleProp in style) {
	            return prefix;
	        }
	    }
	
	    return null;
	}
	
	function getStyleEventName(prefix, eventName) {
	    switch (prefix) {
	        case "":
	            return eventName.toLowerCase();
	        case "Webkit":
	            return "webkit" + eventName;
	        case "Moz":
	            return "moz" + eventName;
	        case "O":
	            return "o" + eventName.toLowerCase();
	        case "ms":
	            return "MS" + eventName;
	        default:
	            return eventName;
	    }
	}

/***/ }),
/* 50 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var win;
	
	if (typeof window !== "undefined") {
	    win = window;
	} else if (typeof global !== "undefined") {
	    win = global;
	} else if (typeof self !== "undefined") {
	    win = self;
	} else {
	    win = {};
	}
	
	module.exports = win;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	var globalWindow = __webpack_require__(50);
	var globalDocument = __webpack_require__(36);
	var getOwnerDocument = __webpack_require__(29);
	var hasProp = __webpack_require__(8);
	var expando = __webpack_require__(2);
	var destroyers = __webpack_require__(26);
	
	var EvStore, EventDispatcher, EventConfig, Events;
	
	var EventListener = exports;
	
	// https://developer.mozilla.org/fr/docs/Web/API/Node/nodeType
	// var ELEMENT_NODE = 1; // Node.ELEMENT_NODE == 1
	// var ATTRIBUTE_NODE = 2; // Node.ATTRIBUTE_NODE == 2
	// var TEXT_NODE = 3; // Node.TEXT_NODE == 3
	// var CDATA_SECTION_NODE = 4; // Node.CDATA_SECTION_NODE == 4
	// var ENTITY_REFERENCE_NODE = 5; // Node.ENTITY_REFERENCE_NODE == 5
	// var ENTITY_NODE = 6; // Node.ENTITY_NODE == 6
	// var PROCESSING_INSTRUCTION_NODE = 7; // Node.PROCESSING_INSTRUCTION_NODE == 7
	// var COMMENT_NODE = 8; // Node.COMMENT_NODE == 8
	// var DOCUMENT_NODE = 9; // Node.DOCUMENT_NODE == 9
	// var DOCUMENT_TYPE_NODE = 10; // Node.DOCUMENT_TYPE_NODE == 10
	// var DOCUMENT_FRAGMENT_NODE = 11; // Node.DOCUMENT_FRAGMENT_NODE == 11
	// var NOTATION_NODE = 12; // Node.NOTATION_NODE == 12
	
	EventListener.addEventListener = function (context, node, eventName, eventType) {
	    var ownerDocument = getOwnerDocument(node);
	    var unref = true;
	
	    var delegator;
	    // on Edge and when ownerDocument is iframe.contentDocument
	    // delete is not authorized
	    if (ownerDocument[expando + "_delegator"] != null) {
	        delegator = ownerDocument[expando + "_delegator"];
	    } else {
	        unref = false;
	        delegator = ownerDocument[expando + "_delegator"] = new EventDispatcher(ownerDocument);
	        destroyers.running.push(function () {
	            // ownerDocument may an iframe document
	            // Edge throw when accessing ownerDocument when iframe is removed from DOM
	            try {
	                delete ownerDocument[expando + "_delegator"];
	            } catch (e) {
	                // Nothing to do
	            }
	            ownerDocument = null;
	        });
	    }
	
	    var config, useCapture, target, isLocal;
	    if (eventType in Events) {
	        config = Events[eventType];
	        eventType = config.eventType;
	        useCapture = config.useCapture;
	        target = config.target || node;
	        isLocal = hasProp.call(config, "local");
	    } else {
	        eventType = eventType.toLowerCase();
	        useCapture = false;
	        target = node;
	    }
	
	    if (eventName === "load" && node.nodeName === "BODY") {
	        target = ownerDocument.defaultView;
	    }
	
	    var handler, removeEventListener;
	
	    if (context.local) {
	        // listen to local events on node and simulate bubble
	        handler = delegator.getHandler(eventName, eventType);
	        context.removeEventListener = addEventListener(node, eventType, handler, useCapture);
	        if (unref) {
	            ownerDocument = null; //unref
	        }
	        return;
	    }
	
	    if (target !== node) {
	        handler = context.handler;
	
	        // listen to event on target
	        if (target === globalWindow && ownerDocument !== globalDocument) {
	            if (ownerDocument) {
	                target = ownerDocument.defaultView;
	                context.removeEventListener = addEventListener(target, eventType, handler, useCapture);
	            } else if (node.nodeName === "IFRAME") {
	                context.removeEventListener = function () {
	                    if (removeEventListener) {
	                        removeEventListener();
	                        removeEventListener = null;
	                    }
	                };
	
	                node.addEventListener("load", function onload() {
	                    node.removeEventListener("load", onload, false);
	                    var ownerDocument = getOwnerDocument(node);
	                    var target = ownerDocument.defaultView;
	                    removeEventListener = addEventListener(target, eventType, handler, useCapture);
	                    node = null;
	                }, false);
	            }
	        } else {
	            context.removeEventListener = addEventListener(target, eventType, handler, useCapture);
	        }
	        if (unref) {
	            ownerDocument = null; //unref
	        }
	        return;
	    }
	
	    if (!isLocal) {
	        // only listen globally for non local events
	        removeEventListener = delegator.addEventListener(eventName, eventType, useCapture);
	        if (removeEventListener) {
	            destroyers.running.push(removeEventListener);
	        }
	    }
	
	    var events = EvStore(node);
	    events[EventDispatcher.getKey(eventName, eventType)] = context.handler;
	    if (unref) {
	        ownerDocument = null; //unref
	    }
	};
	
	EventListener.removeEventListener = function (context, node, eventName, eventType) {
	    if (context.removeEventListener) {
	        context.removeEventListener();
	        context.removeEventListener = undefined;
	        return;
	    }
	
	    if (eventType in Events) {
	        eventType = Events[eventType].eventType;
	    } else {
	        eventType = eventType.toLowerCase();
	    }
	
	    var events = EvStore(node);
	    events[EventDispatcher.getKey(eventName, eventType)] = undefined;
	};
	
	function addEventListener(target, eventType, handler, useCapture) {
	    target.addEventListener(eventType, handler, useCapture);
	
	    return function removeEventListener() {
	        target.removeEventListener(eventType, handler, useCapture);
	        handler = null;
	        target = null;
	    };
	}
	
	EventDispatcher = __webpack_require__(52);
	EventConfig = __webpack_require__(49);
	EvStore = __webpack_require__(53);
	Events = EventConfig.Events;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = Object.prototype.hasOwnProperty;
	
	var EvStore = __webpack_require__(53);
	
	var ProxyEvent = __webpack_require__(54);
	var addWheelListener = __webpack_require__(55);
	
	var Renderer;
	
	function EventDispatcher(document) {
	    this.target = document;
	    this.handlers = {};
	}
	
	EventDispatcher.getKey = function (eventName, eventType) {
	    return eventName + ":" + eventType;
	};
	
	EventDispatcher.prototype.addEventListener = function (eventName, eventType, useCapture) {
	    var handlers = this.handlers;
	    var key = EventDispatcher.getKey(eventName, eventType);
	
	    if (hasProp.call(handlers, key)) {
	        return null;
	    }
	
	    var target = this.target;
	
	    var listener = this.getHandler(eventName, eventType);
	    if (eventType === "wheel") {
	        return addWheelListener(target, listener, useCapture);
	    }
	
	    target.addEventListener(eventType, listener, useCapture);
	
	    return function removeEventListener() {
	        target.removeEventListener(eventType, listener, useCapture);
	        delete handlers[key];
	        key = null;
	        handlers = null;
	        target = null;
	        listener = null;
	    };
	};
	
	EventDispatcher.prototype.getHandler = function (eventName, eventType) {
	    var handlers = this.handlers;
	    var key = EventDispatcher.getKey(eventName, eventType);
	
	    if (hasProp.call(handlers, key)) {
	        return handlers[key];
	    }
	
	    var handler = handlers[key] = eventHandler.bind(this, key, eventName, eventType);
	    return handler;
	};
	
	function eventHandler(key, eventName, eventType, evt) {
	    var ret;
	
	    var _process = false;
	    if (Renderer._eventHandler == null) {
	        Renderer._eventHandler = [];
	        Renderer._performAfterUpdates = false;
	        _process = true;
	    }
	
	    try {
	        ret = dispatchEvent(eventName, eventType, evt, evt.target);
	    } finally {
	        if (_process) {
	            Renderer.processEventHandler();
	            Renderer._performAfterUpdates = true;
	        }
	    }
	
	    return ret;
	}
	
	function dispatchEvent(eventName, eventType, evt, currentTarget) {
	    var ret, intermediateRet, proxyEvent;
	    var handle = getClosestHandle(currentTarget, eventName, eventType);
	
	    if (handle && handle.handlers.length > 0) {
	        currentTarget = handle.currentTarget;
	        proxyEvent = new ProxyEvent(evt, eventName, {
	            currentTarget: currentTarget
	        });
	
	        intermediateRet = executeHandlers(handle.handlers, proxyEvent);
	        if (intermediateRet === false) {
	            ret = false;
	        }
	
	        if (!proxyEvent._isPropagationStopped) {
	            intermediateRet = dispatchEvent(eventName, eventType, evt, currentTarget.parentNode);
	            if (intermediateRet === false) {
	                ret = false;
	            }
	        }
	    }
	
	    return ret;
	}
	
	function getClosestHandle(currentTarget, eventName, eventType) {
	    if (currentTarget == null) {
	        return null;
	    }
	
	    var events = EvStore(currentTarget);
	    var handlers = events[EventDispatcher.getKey(eventName, eventType)];
	
	    if (!handlers) {
	        return getClosestHandle(currentTarget.parentNode, eventName, eventType);
	    }
	
	    return {
	        currentTarget: currentTarget,
	        handlers: Array.isArray(handlers) ? handlers : [handlers]
	    };
	}
	
	function executeHandlers(handlers, evt) {
	    var ret;
	
	    handlers.forEach(function (handler) {
	        var res = handler(evt);
	        if (res === false) {
	            ret = false;
	            evt.preventDefault();
	        }
	    });
	
	    return ret;
	}
	
	module.exports = EventDispatcher;
	Renderer = __webpack_require__(44);

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	var hasProp = __webpack_require__(3).hasProp;
	var EVENTS_KEY = expando + "Events";
	
	module.exports = function EvStore(elem) {
	    if (hasProp.call(elem, EVENTS_KEY)) {
	        return elem[EVENTS_KEY];
	    }
	
	    var events = {};
	    elem[EVENTS_KEY] = events;
	
	    return events;
	};

/***/ }),
/* 54 */
/***/ (function(module, exports) {

	module.exports = ProxyEvent;
	
	var rkeyEvent = /^key/,
	    rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;
	
	function ProxyEvent(src, eventName, props) {
	    this.originalEvent = src;
	    this.type = eventName.toLowerCase();
	
	    // Events bubbling up the document may have been marked as prevented
	    // by a handler lower down the tree; reflect the correct value.
	    this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined ? returnTrue : returnFalse;
	
	    // Create target properties
	    // Support: Safari <=6 - 7 only
	    // Target should not be a text node (#504, #13143)
	    this.target = src.target && src.target.nodeType === 3 ? src.target.parentNode : src.target;
	
	    this.currentTarget = src.currentTarget;
	    this.relatedTarget = src.relatedTarget;
	
	    // Create a timestamp if incoming event doesn't have one
	    if (src.timeStamp) {
	        this.timeStamp = src.timeStamp;
	    } else {
	        this.timeStamp = Date.now();
	    }
	
	    // eslint-disable-next-line guard-for-in
	    for (var prop in props) {
	        this[prop] = props[prop];
	    }
	}
	
	// Includes all common event props including KeyEvent and MouseEvent specific props
	each({
	    altKey: true,
	    bubbles: true,
	    cancelable: true,
	    changedTouches: true,
	    ctrlKey: true,
	    detail: true,
	    eventPhase: true,
	    metaKey: true,
	    pageX: true,
	    pageY: true,
	    shiftKey: true,
	    view: true,
	    "char": true,
	    charCode: true,
	    key: true,
	    keyCode: true,
	    button: true,
	    buttons: true,
	    clientX: true,
	    clientY: true,
	    offsetX: true,
	    offsetY: true,
	    pointerId: true,
	    pointerType: true,
	    screenX: true,
	    screenY: true,
	    targetTouches: true,
	    toElement: true,
	    touches: true,
	
	    which: function which(event) {
	        var button = event.button;
	
	        // Add which for key events
	        /* istanbul ignore if */
	        if (event.which == null && rkeyEvent.test(event.type)) {
	            return event.charCode != null ? event.charCode : event.keyCode;
	        }
	
	        // Add which for click: 1 === left; 2 === middle; 3 === right
	        /* istanbul ignore if */
	        if (!event.which && button !== undefined /* istanbul ignore next */ && rmouseEvent.test(event.type)) {
	            if (button & 1) {
	                return 1;
	            }
	
	            if (button & 2) {
	                return 3;
	            }
	
	            if (button & 4) {
	                return 2;
	            }
	
	            return 0;
	        }
	
	        return event.which;
	    }
	}, addProp, ProxyEvent.prototype);
	
	ProxyEvent.prototype.preventDefault = function () {
	    this.originalEvent.preventDefault();
	    this.isDefaultPrevented = returnTrue;
	};
	
	ProxyEvent.prototype.isDefaultPrevented = returnFalse;
	ProxyEvent.prototype.isPropagationStopped = returnFalse;
	
	ProxyEvent.prototype.stopPropagation = function () {
	    this.originalEvent.stopPropagation();
	    this._isPropagationStopped = true;
	    this.isPropagationStopped = returnTrue;
	};
	
	function returnTrue() {
	    return true;
	}
	
	function returnFalse() {
	    return false;
	}
	
	function each(obj, callback, context) {
	    for (var key in obj) {
	        // eslint-disable-line guard-for-in
	        callback.call(context, key, obj[key]);
	    }
	}
	
	function addProp(name, hook) {
	    // eslint-disable-next-line no-invalid-this
	    Object.defineProperty(this, name, {
	        enumerable: true,
	        configurable: true,
	
	        get: isFunction(hook) ? function () {
	            return hook(this.originalEvent);
	        } : function () {
	            return this.originalEvent[name];
	        },
	
	        set: function set(value) {
	            Object.defineProperty(this, name, {
	                enumerable: true,
	                configurable: true,
	                writable: true,
	                value: value
	            });
	        }
	    });
	}
	
	function isFunction(obj) {
	    return "function" === typeof obj;
	}

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	var isEventSupported = __webpack_require__(3).isEventSupported;
	
	// https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
	module.exports = function () {
	
	    var support;
	
	    // detect available wheel event
	    support = isEventSupported("wheel") ? "wheel" /* istanbul ignore next */ : // Modern browsers support "wheel"
	    isEventSupported("mousewheel") ? "mousewheel" /* istanbul ignore next */ : // Webkit and IE support at least "mousewheel"
	    "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
	
	    return addWheelListener;
	
	    function addWheelListener(elem, callback, useCapture) {
	        var _removeWheelListener = _addWheelListener(elem, support, callback, useCapture);
	
	        var _removeOldWheelListener;
	        // handle MozMousePixelScroll in older Firefox
	        /* istanbul ignore if */
	        if (support === "DOMMouseScroll") {
	            _removeOldWheelListener = _addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
	        }
	
	        return function removeWheelListener() {
	            /* istanbul ignore if */
	            if (_removeOldWheelListener) {
	                _removeOldWheelListener();
	                _removeOldWheelListener = null;
	            }
	
	            _removeWheelListener();
	            _removeWheelListener = null;
	        };
	    }
	
	    function _addWheelListener(elem, eventName, callback, useCapture) {
	        useCapture = Boolean(useCapture);
	
	        var handler = support === "wheel" ? callback /* istanbul ignore next */ : function (originalEvent) {
	            // create a normalized event object
	            var proxyEvent = {
	                // keep a ref to the original event object
	                originalEvent: originalEvent,
	                target: originalEvent.target || originalEvent.srcElement,
	                type: "wheel",
	                deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
	                deltaX: 0,
	                deltaY: 0,
	                deltaZ: 0,
	                preventDefault: function preventDefault() {
	                    originalEvent.preventDefault();
	                },
	                stopPropagation: function stopPropagation() {
	                    originalEvent.stopPropagation();
	                }
	            };
	
	            // calculate deltaY (and deltaX) according to the event
	            if (support === "mousewheel") {
	                proxyEvent.deltaY = -1 / 40 * originalEvent.wheelDelta; // eslint-disable-line no-magic-numbers
	                // Webkit also support wheelDeltaX
	                if (originalEvent.wheelDeltaX) {
	                    proxyEvent.deltaX = -1 / 40 * originalEvent.wheelDeltaX; // eslint-disable-line no-magic-numbers
	                }
	            } else {
	                proxyEvent.deltaY = originalEvent.detail;
	            }
	
	            // it"s time to fire the callback
	            return callback(proxyEvent);
	        };
	
	        elem.addEventListener(eventName, handler, useCapture);
	
	        return function _removeWheelListener() {
	            elem.removeEventListener(eventName, handler, useCapture);
	            handler = null;
	            elem = null;
	        };
	    }
	}();

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	var properties = __webpack_require__(57);
	
	exports.properties = properties;
	
	var attributes = {};
	var attrName, propName;
	
	// eslint-disable-next-line guard-for-in
	for (propName in properties) {
	    attrName = properties[propName].attrName;
	    attributes[attrName] = propName;
	}
	
	exports.attributes = attributes;
	
	exports.elements = __webpack_require__(58);

/***/ }),
/* 57 */
/***/ (function(module, exports) {

	module.exports = {
	    "aLink": {
	        "type": "String",
	        "attrName": "alink"
	    },
	    "abbr": {
	        "type": "String",
	        "attrName": "abbr"
	    },
	    "accept": {
	        "type": "String",
	        "attrName": "accept"
	    },
	    "acceptCharset": {
	        "type": "String",
	        "attrName": "accept-charset"
	    },
	    "accessKey": {
	        "type": "String",
	        "attrName": "accesskey"
	    },
	    "action": {
	        "type": "String",
	        "attrName": "action"
	    },
	    "align": {
	        "type": "String",
	        "attrName": "align"
	    },
	    "allowFullscreen": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "allowfullscreen"
	    },
	    "allowTransparency": {
	        "type": "Unknown",
	        "attrName": "allowtransparency",
	        "isObsolete": true
	    },
	    "alt": {
	        "type": "String",
	        "attrName": "alt"
	    },
	    "archive": {
	        "type": "String",
	        "attrName": "archive"
	    },
	    "async": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "async"
	    },
	    "autocapitalize": {
	        "attrName": "autocapitalize"
	    },
	    "autocomplete": {
	        "type": "String",
	        "attrName": "autocomplete"
	    },
	    "autocorrect": {
	        "attrName": "autocorrect"
	    },
	    "autofocus": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "autofocus"
	    },
	    "autoplay": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "autoplay"
	    },
	    "axis": {
	        "type": "String",
	        "attrName": "axis"
	    },
	    "background": {
	        "type": "String",
	        "attrName": "background"
	    },
	    "behavior": {
	        "type": "String",
	        "attrName": "behavior"
	    },
	    "bgColor": {
	        "type": "String",
	        "attrName": "bgcolor"
	    },
	    "border": {
	        "type": "String",
	        "attrName": "border"
	    },
	    "borderColor": {
	        "type": "Unknown",
	        "attrName": "bordercolor",
	        "isObsolete": true
	    },
	    "bottomMargin": {
	        "type": "Unknown",
	        "attrName": "bottommargin",
	        "isObsolete": true
	    },
	    "capture": {
	        "type": "boolean",
	        "isBoolean": true,
	        "attrName": "capture"
	    },
	    "cellPadding": {
	        "type": "String",
	        "attrName": "cellpadding"
	    },
	    "cellSpacing": {
	        "type": "String",
	        "attrName": "cellspacing"
	    },
	    "ch": {
	        "type": "String",
	        "attrName": "char"
	    },
	    "chOff": {
	        "type": "String",
	        "attrName": "charoff"
	    },
	    "challenge": {
	        "type": "String",
	        "attrName": "challenge"
	    },
	    "charset": {
	        "type": "String",
	        "attrName": "charset"
	    },
	    "checked": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "checked"
	    },
	    "cite": {
	        "type": "String",
	        "attrName": "cite"
	    },
	    "classId": {
	        "type": "Unknown",
	        "attrName": "classid",
	        "isObsolete": true
	    },
	    "className": {
	        "type": "String",
	        "attrName": "class"
	    },
	    "clear": {
	        "type": "String",
	        "attrName": "clear"
	    },
	    "code": {
	        "type": "String",
	        "attrName": "code"
	    },
	    "codeBase": {
	        "type": "String",
	        "attrName": "codebase"
	    },
	    "codeType": {
	        "type": "String",
	        "attrName": "codetype"
	    },
	    "colSpan": {
	        "type": "unsigned long",
	        "isPositive": true,
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "colspan"
	    },
	    "color": {
	        "type": "String",
	        "attrName": "color"
	    },
	    "cols": {
	        "attrName": "cols"
	    },
	    "compact": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "compact"
	    },
	    "content": {
	        "type": "String",
	        "attrName": "content"
	    },
	    "contentEditable": {
	        "type": "String",
	        "attrName": "contenteditable"
	    },
	    "contextMenu": {
	        "type": "HTMLMenuElement",
	        "attrName": "contextmenu"
	    },
	    "controls": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "controls"
	    },
	    "coords": {
	        "type": "String",
	        "attrName": "coords"
	    },
	    "crossOrigin": {
	        "type": "String",
	        "attrName": "crossorigin"
	    },
	    "data": {
	        "type": "String",
	        "attrName": "data"
	    },
	    "dataFld": {
	        "type": "Unknown",
	        "attrName": "datafld",
	        "isObsolete": true
	    },
	    "dataFormatas": {
	        "type": "Unknown",
	        "attrName": "dataformatas",
	        "isObsolete": true
	    },
	    "dataPageSize": {
	        "type": "Unknown",
	        "attrName": "datapagesize",
	        "isObsolete": true
	    },
	    "dataSrc": {
	        "type": "Unknown",
	        "attrName": "datasrc",
	        "isObsolete": true
	    },
	    "dateTime": {
	        "type": "String",
	        "attrName": "datetime"
	    },
	    "declare": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "declare"
	    },
	    "default": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "default"
	    },
	    "defaultChecked": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true
	    },
	    "defaultMuted": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true
	    },
	    "defaultSelected": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true
	    },
	    "defaultValue": {
	        "type": "String",
	        "isProperty": true
	    },
	    "defer": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "defer"
	    },
	    "dir": {
	        "type": "String",
	        "attrName": "dir"
	    },
	    "dirName": {
	        "type": "String",
	        "attrName": "dirname"
	    },
	    "direction": {
	        "type": "String",
	        "attrName": "direction"
	    },
	    "disabled": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "disabled"
	    },
	    "download": {
	        "type": "String",
	        "attrName": "download"
	    },
	    "draggable": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "draggable"
	    },
	    "encoding": {
	        "type": "String",
	        "isProperty": true
	    },
	    "enctype": {
	        "type": "String",
	        "attrName": "enctype"
	    },
	    "event": {
	        "type": "String",
	        "attrName": "event"
	    },
	    "face": {
	        "type": "String",
	        "attrName": "face"
	    },
	    "formAction": {
	        "type": "String",
	        "attrName": "formaction"
	    },
	    "formEnctype": {
	        "type": "String",
	        "attrName": "formenctype"
	    },
	    "formMethod": {
	        "type": "String",
	        "attrName": "formmethod"
	    },
	    "formNoValidate": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "formnovalidate"
	    },
	    "formTarget": {
	        "type": "String",
	        "attrName": "formtarget"
	    },
	    "frame": {
	        "type": "String",
	        "attrName": "frame"
	    },
	    "frameBorder": {
	        "type": "String",
	        "attrName": "frameborder"
	    },
	    "frameSpacing": {
	        "type": "Unknown",
	        "attrName": "framespacing",
	        "isObsolete": true
	    },
	    "hash": {
	        "type": "String",
	        "isProperty": true
	    },
	    "height": {
	        "attrName": "height"
	    },
	    "hidden": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "hidden"
	    },
	    "high": {
	        "type": "double",
	        "isNumber": true,
	        "attrName": "high"
	    },
	    "host": {
	        "type": "String",
	        "isProperty": true
	    },
	    "hostname": {
	        "type": "String",
	        "isProperty": true
	    },
	    "href": {
	        "type": "String",
	        "attrName": "href"
	    },
	    "hreflang": {
	        "type": "String",
	        "attrName": "hreflang"
	    },
	    "hspace": {
	        "type": "unsigned long",
	        "isPositive": true,
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "hspace"
	    },
	    "htmlFor": {
	        "attrName": "for"
	    },
	    "httpEquiv": {
	        "type": "String",
	        "attrName": "http-equiv"
	    },
	    "icon": {
	        "type": "String",
	        "attrName": "icon"
	    },
	    "id": {
	        "type": "String",
	        "attrName": "id"
	    },
	    "incremental": {
	        "attrName": "incremental"
	    },
	    "indeterminate": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true
	    },
	    "inputMode": {
	        "type": "String",
	        "attrName": "inputmode"
	    },
	    "isMap": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "ismap"
	    },
	    "itemid": {
	        "attrName": "itemid"
	    },
	    "itemprop": {
	        "attrName": "itemprop"
	    },
	    "itemref": {
	        "attrName": "itemref"
	    },
	    "itemscope": {
	        "type": "boolean",
	        "isBoolean": true,
	        "attrName": "itemscope"
	    },
	    "itemtype": {
	        "attrName": "itemtype"
	    },
	    "keytype": {
	        "type": "String",
	        "attrName": "keytype"
	    },
	    "kind": {
	        "type": "String",
	        "attrName": "kind"
	    },
	    "label": {
	        "type": "String",
	        "attrName": "label"
	    },
	    "lang": {
	        "type": "String",
	        "attrName": "lang"
	    },
	    "language": {
	        "type": "Unknown",
	        "attrName": "language",
	        "isObsolete": true
	    },
	    "leftMargin": {
	        "type": "Unknown",
	        "attrName": "leftmargin",
	        "isObsolete": true
	    },
	    "link": {
	        "type": "String",
	        "attrName": "link"
	    },
	    "loop": {
	        "attrName": "loop"
	    },
	    "low": {
	        "type": "double",
	        "isNumber": true,
	        "attrName": "low"
	    },
	    "lowsrc": {
	        "type": "String",
	        "attrName": "lowsrc"
	    },
	    "manifest": {
	        "type": "Unknown",
	        "attrName": "manifest",
	        "isObsolete": true
	    },
	    "marginHeight": {
	        "type": "String",
	        "attrName": "marginheight"
	    },
	    "marginTop": {
	        "type": "Unknown",
	        "attrName": "margintop",
	        "isObsolete": true
	    },
	    "marginWidth": {
	        "type": "String",
	        "attrName": "marginwidth"
	    },
	    "max": {
	        "attrName": "max"
	    },
	    "maxLength": {
	        "type": "long",
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "maxlength"
	    },
	    "media": {
	        "type": "String",
	        "attrName": "media"
	    },
	    "menu": {
	        "type": "HTMLMenuElement",
	        "attrName": "menu"
	    },
	    "method": {
	        "type": "String",
	        "attrName": "method"
	    },
	    "methods": {
	        "type": "Unknown",
	        "attrName": "methods",
	        "isObsolete": true
	    },
	    "min": {
	        "attrName": "min"
	    },
	    "minLength": {
	        "type": "long",
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "minlength"
	    },
	    "mozactionhint": {
	        "attrName": "mozactionhint"
	    },
	    "multiple": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "multiple"
	    },
	    "muted": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "muted"
	    },
	    "name": {
	        "type": "String",
	        "attrName": "name"
	    },
	    "noHref": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "nohref"
	    },
	    "noResize": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "noresize"
	    },
	    "noShade": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "noshade"
	    },
	    "noValidate": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "novalidate"
	    },
	    "noWrap": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "nowrap"
	    },
	    "nonce": {
	        "type": "String",
	        "attrName": "nonce"
	    },
	    "object": {
	        "type": "String",
	        "attrName": "object"
	    },
	    "open": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "open"
	    },
	    "optimum": {
	        "type": "double",
	        "isNumber": true,
	        "attrName": "optimum"
	    },
	    "password": {
	        "type": "String",
	        "isProperty": true
	    },
	    "pathname": {
	        "type": "String",
	        "isProperty": true
	    },
	    "pattern": {
	        "type": "String",
	        "attrName": "pattern"
	    },
	    "placeholder": {
	        "type": "String",
	        "attrName": "placeholder"
	    },
	    "port": {
	        "type": "String",
	        "isProperty": true
	    },
	    "poster": {
	        "type": "String",
	        "attrName": "poster"
	    },
	    "preload": {
	        "type": "String",
	        "attrName": "preload"
	    },
	    "profile": {
	        "type": "Unknown",
	        "attrName": "profile",
	        "isObsolete": true
	    },
	    "protocol": {
	        "type": "String",
	        "isProperty": true
	    },
	    "radiogroup": {
	        "type": "String",
	        "attrName": "radiogroup"
	    },
	    "readOnly": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "readonly"
	    },
	    "rel": {
	        "type": "String",
	        "attrName": "rel"
	    },
	    "required": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "required"
	    },
	    "results": {
	        "attrName": "results"
	    },
	    "rev": {
	        "type": "String",
	        "attrName": "rev"
	    },
	    "reversed": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "reversed"
	    },
	    "rightMargin": {
	        "type": "Unknown",
	        "attrName": "rightmargin",
	        "isObsolete": true
	    },
	    "rowSpan": {
	        "type": "unsigned long",
	        "isPositive": true,
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "rowspan"
	    },
	    "rows": {
	        "attrName": "rows"
	    },
	    "rules": {
	        "type": "String",
	        "attrName": "rules"
	    },
	    "sandbox": {
	        "type": "DOMTokenList",
	        "attrName": "sandbox"
	    },
	    "scheme": {
	        "type": "String",
	        "attrName": "scheme"
	    },
	    "scope": {
	        "type": "String",
	        "attrName": "scope"
	    },
	    "scrollAmount": {
	        "type": "unsigned long",
	        "isPositive": true,
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "scrollamount"
	    },
	    "scrollDelay": {
	        "type": "unsigned long",
	        "isPositive": true,
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "scrolldelay"
	    },
	    "scrolling": {
	        "type": "String",
	        "attrName": "scrolling"
	    },
	    "search": {
	        "type": "String",
	        "isProperty": true
	    },
	    "selected": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "selected"
	    },
	    "selectionDirection": {
	        "type": "String",
	        "isProperty": true
	    },
	    "shape": {
	        "type": "String",
	        "attrName": "shape"
	    },
	    "size": {
	        "attrName": "size"
	    },
	    "sizes": {
	        "type": "String",
	        "attrName": "sizes"
	    },
	    "slot": {
	        "attrName": "slot"
	    },
	    "span": {
	        "type": "unsigned long",
	        "isPositive": true,
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "span"
	    },
	    "spellcheck": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "spellcheck"
	    },
	    "src": {
	        "type": "String",
	        "attrName": "src"
	    },
	    "srcObject": {
	        "type": "MediaProvider",
	        "isProperty": true
	    },
	    "srcdoc": {
	        "type": "String",
	        "attrName": "srcdoc"
	    },
	    "srclang": {
	        "type": "String",
	        "attrName": "srclang"
	    },
	    "srcset": {
	        "type": "String",
	        "attrName": "srcset"
	    },
	    "standby": {
	        "type": "String",
	        "attrName": "standby"
	    },
	    "start": {
	        "type": "long",
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "start"
	    },
	    "step": {
	        "type": "String",
	        "attrName": "step"
	    },
	    "style": {
	        "isProperty": true,
	        "attrName": "style"
	    },
	    "summary": {
	        "type": "String",
	        "attrName": "summary"
	    },
	    "tabIndex": {
	        "type": "long",
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "tabindex"
	    },
	    "target": {
	        "type": "String",
	        "attrName": "target"
	    },
	    "text": {
	        "type": "String",
	        "attrName": "text"
	    },
	    "title": {
	        "type": "String",
	        "attrName": "title"
	    },
	    "translate": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "translate"
	    },
	    "trueSpeed": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "truespeed"
	    },
	    "type": {
	        "type": "String",
	        "attrName": "type"
	    },
	    "typeMustMatch": {
	        "type": "boolean",
	        "isBoolean": true,
	        "isProperty": true,
	        "attrName": "typemustmatch"
	    },
	    "urn": {
	        "type": "Unknown",
	        "attrName": "urn",
	        "isObsolete": true
	    },
	    "useMap": {
	        "type": "String",
	        "attrName": "usemap"
	    },
	    "username": {
	        "type": "String",
	        "isProperty": true
	    },
	    "vAlign": {
	        "type": "String",
	        "attrName": "valign"
	    },
	    "vLink": {
	        "type": "String",
	        "attrName": "vlink"
	    },
	    "value": {
	        "attrName": "value"
	    },
	    "valueAsDate": {
	        "type": "object",
	        "isProperty": true
	    },
	    "valueType": {
	        "type": "String",
	        "attrName": "valuetype"
	    },
	    "version": {
	        "type": "String",
	        "attrName": "version"
	    },
	    "vspace": {
	        "type": "unsigned long",
	        "isPositive": true,
	        "isInteger": true,
	        "isNumber": true,
	        "attrName": "vspace"
	    },
	    "webkitDirectory": {
	        "attrName": "webkitdirectory"
	    },
	    "width": {
	        "attrName": "width"
	    },
	    "wrap": {
	        "type": "String",
	        "attrName": "wrap"
	    },
	    "xMozErrorMessage": {
	        "attrName": "x-moz-errormessage"
	    },
	    "accentHeight": {
	        "attrName": "accent-height"
	    },
	    "accumulate": {
	        "attrName": "accumulate"
	    },
	    "additive": {
	        "attrName": "additive"
	    },
	    "alignmentBaseline": {
	        "attrName": "alignment-baseline"
	    },
	    "alphabetic": {
	        "attrName": "alphabetic"
	    },
	    "amplitude": {
	        "attrName": "amplitude"
	    },
	    "arabicForm": {
	        "attrName": "arabic-form"
	    },
	    "ascent": {
	        "attrName": "ascent"
	    },
	    "attributeName": {
	        "attrName": "attributeName"
	    },
	    "attributeType": {
	        "attrName": "attributeType"
	    },
	    "azimuth": {
	        "attrName": "azimuth"
	    },
	    "baseFrequency": {
	        "attrName": "baseFrequency"
	    },
	    "baseProfile": {
	        "attrName": "baseProfile"
	    },
	    "baselineShift": {
	        "attrName": "baseline-shift"
	    },
	    "bbox": {
	        "attrName": "bbox"
	    },
	    "begin": {
	        "attrName": "begin"
	    },
	    "bias": {
	        "attrName": "bias"
	    },
	    "bufferedRendering": {
	        "attrName": "buffered-rendering"
	    },
	    "by": {
	        "attrName": "by"
	    },
	    "calcMode": {
	        "attrName": "calcMode"
	    },
	    "capHeight": {
	        "attrName": "cap-height"
	    },
	    "clip": {
	        "attrName": "clip"
	    },
	    "clipPath": {
	        "attrName": "clip-path"
	    },
	    "clipRule": {
	        "attrName": "clip-rule"
	    },
	    "clipPathUnits": {
	        "attrName": "clipPathUnits"
	    },
	    "colorInterpolation": {
	        "attrName": "color-interpolation"
	    },
	    "colorInterpolationFilters": {
	        "attrName": "color-interpolation-filters"
	    },
	    "colorProfile": {
	        "attrName": "color-profile"
	    },
	    "colorRendering": {
	        "attrName": "color-rendering"
	    },
	    "contentScriptType": {
	        "attrName": "contentScriptType"
	    },
	    "contentStyleType": {
	        "attrName": "contentStyleType"
	    },
	    "cursor": {
	        "attrName": "cursor"
	    },
	    "cx": {
	        "attrName": "cx"
	    },
	    "cy": {
	        "attrName": "cy"
	    },
	    "d": {
	        "attrName": "d"
	    },
	    "descent": {
	        "attrName": "descent"
	    },
	    "diffuseConstant": {
	        "attrName": "diffuseConstant"
	    },
	    "display": {
	        "attrName": "display"
	    },
	    "divisor": {
	        "attrName": "divisor"
	    },
	    "dominantBaseline": {
	        "attrName": "dominant-baseline"
	    },
	    "dur": {
	        "attrName": "dur"
	    },
	    "dx": {
	        "attrName": "dx"
	    },
	    "dy": {
	        "attrName": "dy"
	    },
	    "edgeMode": {
	        "attrName": "edgeMode"
	    },
	    "elevation": {
	        "attrName": "elevation"
	    },
	    "enableBackground": {
	        "attrName": "enable-background"
	    },
	    "end": {
	        "attrName": "end"
	    },
	    "exponent": {
	        "attrName": "exponent"
	    },
	    "externalResourcesRequired": {
	        "attrName": "externalResourcesRequired"
	    },
	    "fill": {
	        "attrName": "fill"
	    },
	    "fillOpacity": {
	        "attrName": "fill-opacity"
	    },
	    "fillRule": {
	        "attrName": "fill-rule"
	    },
	    "filter": {
	        "attrName": "filter"
	    },
	    "filterRes": {
	        "attrName": "filterRes"
	    },
	    "filterUnits": {
	        "attrName": "filterUnits"
	    },
	    "floodColor": {
	        "attrName": "flood-color"
	    },
	    "floodOpacity": {
	        "attrName": "flood-opacity"
	    },
	    "fontFamily": {
	        "attrName": "font-family"
	    },
	    "fontSize": {
	        "attrName": "font-size"
	    },
	    "fontSizeAdjust": {
	        "attrName": "font-size-adjust"
	    },
	    "fontStretch": {
	        "attrName": "font-stretch"
	    },
	    "fontStyle": {
	        "attrName": "font-style"
	    },
	    "fontVariant": {
	        "attrName": "font-variant"
	    },
	    "fontWeight": {
	        "attrName": "font-weight"
	    },
	    "format": {
	        "attrName": "format"
	    },
	    "fr": {
	        "attrName": "fr"
	    },
	    "from": {
	        "attrName": "from"
	    },
	    "fx": {
	        "attrName": "fx"
	    },
	    "fy": {
	        "attrName": "fy"
	    },
	    "g1": {
	        "attrName": "g1"
	    },
	    "g2": {
	        "attrName": "g2"
	    },
	    "glyphName": {
	        "attrName": "glyph-name"
	    },
	    "glyphOrientationHorizontal": {
	        "attrName": "glyph-orientation-horizontal"
	    },
	    "glyphOrientationVertical": {
	        "attrName": "glyph-orientation-vertical"
	    },
	    "glyphRef": {
	        "attrName": "glyphRef"
	    },
	    "gradientTransform": {
	        "attrName": "gradientTransform"
	    },
	    "gradientUnits": {
	        "attrName": "gradientUnits"
	    },
	    "hanging": {
	        "attrName": "hanging"
	    },
	    "hatchContentUnits": {
	        "attrName": "hatchContentUnits"
	    },
	    "hatchUnits": {
	        "attrName": "hatchUnits"
	    },
	    "horizAdvX": {
	        "attrName": "horiz-adv-x"
	    },
	    "horizOriginX": {
	        "attrName": "horiz-origin-x"
	    },
	    "horizOriginY": {
	        "attrName": "horiz-origin-y"
	    },
	    "ideographic": {
	        "attrName": "ideographic"
	    },
	    "imageRendering": {
	        "attrName": "image-rendering"
	    },
	    "in": {
	        "attrName": "in"
	    },
	    "in2": {
	        "attrName": "in2"
	    },
	    "inlineSize": {
	        "attrName": "inline-size"
	    },
	    "intercept": {
	        "attrName": "intercept"
	    },
	    "k": {
	        "attrName": "k"
	    },
	    "k1": {
	        "attrName": "k1"
	    },
	    "k2": {
	        "attrName": "k2"
	    },
	    "k3": {
	        "attrName": "k3"
	    },
	    "k4": {
	        "attrName": "k4"
	    },
	    "kernelMatrix": {
	        "attrName": "kernelMatrix"
	    },
	    "kernelUnitLength": {
	        "attrName": "kernelUnitLength"
	    },
	    "kerning": {
	        "attrName": "kerning"
	    },
	    "keyPoints": {
	        "attrName": "keyPoints"
	    },
	    "keySplines": {
	        "attrName": "keySplines"
	    },
	    "keyTimes": {
	        "attrName": "keyTimes"
	    },
	    "lengthAdjust": {
	        "attrName": "lengthAdjust"
	    },
	    "letterSpacing": {
	        "attrName": "letter-spacing"
	    },
	    "lightingColor": {
	        "attrName": "lighting-color"
	    },
	    "limitingConeAngle": {
	        "attrName": "limitingConeAngle"
	    },
	    "local": {
	        "attrName": "local"
	    },
	    "markerEnd": {
	        "attrName": "marker-end"
	    },
	    "markerMid": {
	        "attrName": "marker-mid"
	    },
	    "markerStart": {
	        "attrName": "marker-start"
	    },
	    "markerHeight": {
	        "attrName": "markerHeight"
	    },
	    "markerUnits": {
	        "attrName": "markerUnits"
	    },
	    "markerWidth": {
	        "attrName": "markerWidth"
	    },
	    "mask": {
	        "attrName": "mask"
	    },
	    "maskContentUnits": {
	        "attrName": "maskContentUnits"
	    },
	    "maskUnits": {
	        "attrName": "maskUnits"
	    },
	    "mathematical": {
	        "attrName": "mathematical"
	    },
	    "mode": {
	        "attrName": "mode"
	    },
	    "numOctaves": {
	        "attrName": "numOctaves"
	    },
	    "offset": {
	        "attrName": "offset"
	    },
	    "opacity": {
	        "attrName": "opacity"
	    },
	    "operator": {
	        "attrName": "operator"
	    },
	    "order": {
	        "attrName": "order"
	    },
	    "orient": {
	        "attrName": "orient"
	    },
	    "orientation": {
	        "attrName": "orientation"
	    },
	    "origin": {
	        "attrName": "origin"
	    },
	    "overflow": {
	        "attrName": "overflow"
	    },
	    "overlinePosition": {
	        "attrName": "overline-position"
	    },
	    "overlineThickness": {
	        "attrName": "overline-thickness"
	    },
	    "paintOrder": {
	        "attrName": "paint-order"
	    },
	    "panose1": {
	        "attrName": "panose-1"
	    },
	    "path": {
	        "attrName": "path"
	    },
	    "pathLength": {
	        "attrName": "pathLength"
	    },
	    "patternContentUnits": {
	        "attrName": "patternContentUnits"
	    },
	    "patternTransform": {
	        "attrName": "patternTransform"
	    },
	    "patternUnits": {
	        "attrName": "patternUnits"
	    },
	    "pitch": {
	        "attrName": "pitch"
	    },
	    "playbackorder": {
	        "attrName": "playbackorder"
	    },
	    "pointerEvents": {
	        "attrName": "pointer-events"
	    },
	    "points": {
	        "attrName": "points"
	    },
	    "pointsAtX": {
	        "attrName": "pointsAtX"
	    },
	    "pointsAtY": {
	        "attrName": "pointsAtY"
	    },
	    "pointsAtZ": {
	        "attrName": "pointsAtZ"
	    },
	    "preserveAlpha": {
	        "attrName": "preserveAlpha"
	    },
	    "preserveAspectRatio": {
	        "attrName": "preserveAspectRatio"
	    },
	    "primitiveUnits": {
	        "attrName": "primitiveUnits"
	    },
	    "r": {
	        "attrName": "r"
	    },
	    "radius": {
	        "attrName": "radius"
	    },
	    "refX": {
	        "attrName": "refX"
	    },
	    "refY": {
	        "attrName": "refY"
	    },
	    "renderingIntent": {
	        "attrName": "rendering-intent"
	    },
	    "repeatCount": {
	        "attrName": "repeatCount"
	    },
	    "repeatDur": {
	        "attrName": "repeatDur"
	    },
	    "requiredExtensions": {
	        "attrName": "requiredExtensions"
	    },
	    "requiredFeatures": {
	        "attrName": "requiredFeatures"
	    },
	    "restart": {
	        "attrName": "restart"
	    },
	    "result": {
	        "attrName": "result"
	    },
	    "role": {
	        "attrName": "role"
	    },
	    "rotate": {
	        "attrName": "rotate"
	    },
	    "rx": {
	        "attrName": "rx"
	    },
	    "ry": {
	        "attrName": "ry"
	    },
	    "scale": {
	        "attrName": "scale"
	    },
	    "seed": {
	        "attrName": "seed"
	    },
	    "shapeInside": {
	        "attrName": "shape-inside"
	    },
	    "shapeMargin": {
	        "attrName": "shape-margin"
	    },
	    "shapeOutside": {
	        "attrName": "shape-outside"
	    },
	    "shapePadding": {
	        "attrName": "shape-padding"
	    },
	    "shapeRendering": {
	        "attrName": "shape-rendering"
	    },
	    "side": {
	        "attrName": "side"
	    },
	    "slope": {
	        "attrName": "slope"
	    },
	    "solidColor": {
	        "attrName": "solid-color"
	    },
	    "solidOpacity": {
	        "attrName": "solid-opacity"
	    },
	    "spacing": {
	        "attrName": "spacing"
	    },
	    "specularConstant": {
	        "attrName": "specularConstant"
	    },
	    "specularExponent": {
	        "attrName": "specularExponent"
	    },
	    "spreadMethod": {
	        "attrName": "spreadMethod"
	    },
	    "startOffset": {
	        "attrName": "startOffset"
	    },
	    "stdDeviation": {
	        "attrName": "stdDeviation"
	    },
	    "stemh": {
	        "attrName": "stemh"
	    },
	    "stemv": {
	        "attrName": "stemv"
	    },
	    "stitchTiles": {
	        "attrName": "stitchTiles"
	    },
	    "stopColor": {
	        "attrName": "stop-color"
	    },
	    "stopOpacity": {
	        "attrName": "stop-opacity"
	    },
	    "strikethroughPosition": {
	        "attrName": "strikethrough-position"
	    },
	    "strikethroughThickness": {
	        "attrName": "strikethrough-thickness"
	    },
	    "string": {
	        "attrName": "string"
	    },
	    "stroke": {
	        "attrName": "stroke"
	    },
	    "strokeDasharray": {
	        "attrName": "stroke-dasharray"
	    },
	    "strokeDashoffset": {
	        "attrName": "stroke-dashoffset"
	    },
	    "strokeLinecap": {
	        "attrName": "stroke-linecap"
	    },
	    "strokeLinejoin": {
	        "attrName": "stroke-linejoin"
	    },
	    "strokeMiterlimit": {
	        "attrName": "stroke-miterlimit"
	    },
	    "strokeOpacity": {
	        "attrName": "stroke-opacity"
	    },
	    "strokeWidth": {
	        "attrName": "stroke-width"
	    },
	    "surfaceScale": {
	        "attrName": "surfaceScale"
	    },
	    "systemLanguage": {
	        "attrName": "systemLanguage"
	    },
	    "tableValues": {
	        "attrName": "tableValues"
	    },
	    "targetX": {
	        "attrName": "targetX"
	    },
	    "targetY": {
	        "attrName": "targetY"
	    },
	    "textAnchor": {
	        "attrName": "text-anchor"
	    },
	    "textDecoration": {
	        "attrName": "text-decoration"
	    },
	    "textOverflow": {
	        "attrName": "text-overflow"
	    },
	    "textRendering": {
	        "attrName": "text-rendering"
	    },
	    "textLength": {
	        "attrName": "textLength"
	    },
	    "timelinebegin": {
	        "attrName": "timelinebegin"
	    },
	    "to": {
	        "attrName": "to"
	    },
	    "transform": {
	        "attrName": "transform"
	    },
	    "u1": {
	        "attrName": "u1"
	    },
	    "u2": {
	        "attrName": "u2"
	    },
	    "underlinePosition": {
	        "attrName": "underline-position"
	    },
	    "underlineThickness": {
	        "attrName": "underline-thickness"
	    },
	    "unicode": {
	        "attrName": "unicode"
	    },
	    "unicodeBidi": {
	        "attrName": "unicode-bidi"
	    },
	    "unicodeRange": {
	        "attrName": "unicode-range"
	    },
	    "unitsPerEm": {
	        "attrName": "units-per-em"
	    },
	    "vAlphabetic": {
	        "attrName": "v-alphabetic"
	    },
	    "vHanging": {
	        "attrName": "v-hanging"
	    },
	    "vIdeographic": {
	        "attrName": "v-ideographic"
	    },
	    "vMathematical": {
	        "attrName": "v-mathematical"
	    },
	    "values": {
	        "attrName": "values"
	    },
	    "vectorEffect": {
	        "attrName": "vector-effect"
	    },
	    "vertAdvY": {
	        "attrName": "vert-adv-y"
	    },
	    "vertOriginX": {
	        "attrName": "vert-origin-x"
	    },
	    "vertOriginY": {
	        "attrName": "vert-origin-y"
	    },
	    "viewBox": {
	        "attrName": "viewBox"
	    },
	    "viewTarget": {
	        "attrName": "viewTarget"
	    },
	    "visibility": {
	        "attrName": "visibility"
	    },
	    "whiteSpace": {
	        "attrName": "white-space"
	    },
	    "widths": {
	        "attrName": "widths"
	    },
	    "wordSpacing": {
	        "attrName": "word-spacing"
	    },
	    "writingMode": {
	        "attrName": "writing-mode"
	    },
	    "x": {
	        "attrName": "x"
	    },
	    "xHeight": {
	        "attrName": "x-height"
	    },
	    "x1": {
	        "attrName": "x1"
	    },
	    "x2": {
	        "attrName": "x2"
	    },
	    "xChannelSelector": {
	        "attrName": "xChannelSelector"
	    },
	    "xlinkActuate": {
	        "namespace": "http://www.w3.org/1999/xlink",
	        "attrName": "xlink:actuate"
	    },
	    "xlinkArcrole": {
	        "namespace": "http://www.w3.org/1999/xlink",
	        "attrName": "xlink:arcrole"
	    },
	    "xlinkHref": {
	        "namespace": "http://www.w3.org/1999/xlink",
	        "attrName": "xlink:href"
	    },
	    "xlinkRole": {
	        "namespace": "http://www.w3.org/1999/xlink",
	        "attrName": "xlink:role"
	    },
	    "xlinkShow": {
	        "namespace": "http://www.w3.org/1999/xlink",
	        "attrName": "xlink:show"
	    },
	    "xlinkTitle": {
	        "namespace": "http://www.w3.org/1999/xlink",
	        "attrName": "xlink:title"
	    },
	    "xlinkType": {
	        "namespace": "http://www.w3.org/1999/xlink",
	        "attrName": "xlink:type"
	    },
	    "xmlBase": {
	        "namespace": "http://www.w3.org/XML/1998/namespace",
	        "attrName": "xml:base"
	    },
	    "xmlLang": {
	        "namespace": "http://www.w3.org/XML/1998/namespace",
	        "attrName": "xml:lang"
	    },
	    "xmlSpace": {
	        "namespace": "http://www.w3.org/XML/1998/namespace",
	        "attrName": "xml:space"
	    },
	    "y": {
	        "attrName": "y"
	    },
	    "y1": {
	        "attrName": "y1"
	    },
	    "y2": {
	        "attrName": "y2"
	    },
	    "yChannelSelector": {
	        "attrName": "yChannelSelector"
	    },
	    "z": {
	        "attrName": "z"
	    },
	    "zoomAndPan": {
	        "attrName": "zoomAndPan"
	    }
	};

/***/ }),
/* 58 */
/***/ (function(module, exports) {

	module.exports = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "math", "menu", "menuitem", "meta", "meter", "multicol", "nav", "nextid", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp", "altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor", "animateMotion", "animateTransform", "circle", "clipPath", "color-profile", "cursor", "defs", "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignObject", "g", "glyph", "glyphRef", "hkern", "image", "line", "linearGradient", "marker", "mask", "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "set", "stop", "switch", "symbol", "text", "textPath", "tref", "tspan", "use", "view", "vkern", "discard", "feDropShadow", "hatch", "hatchpath", "mesh", "meshpatch", "meshrow", "solidcolor", "unknown"];

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	var hasEditableValue = __webpack_require__(3).hasEditableValue;
	
	module.exports = {
	    onChange: {
	        input: controlInputOnChange,
	        textarea: controlInputOnChange,
	        select: controlSelectOnChange
	    },
	    afterUpdates: {
	        input: controlInputAfterUpdates,
	        textarea: controlInputAfterUpdates,
	        option: controlOptionAfterUpdates,
	        select: controlSelectAfterUpdates
	    }
	};
	
	var controlInputChecked = __webpack_require__(60);
	var controlInputValue = __webpack_require__(62);
	var controlOptionSelected = __webpack_require__(63);
	var controlSelectValue = __webpack_require__(64);
	
	function controlInputOnChange(type, props) {
	    var control;
	    var ref = props.type;
	
	    if (type === "input" && (ref === "checkbox" || ref === "radio")) {
	        control = controlInputChecked;
	    } else if (hasEditableValue(type, props)) {
	        control = controlInputValue;
	    } else {
	        return props.onChange;
	    }
	
	    if ("function" === typeof props.onChange) {
	        return [props.onChange, control];
	    }
	    return control;
	}
	
	function controlSelectOnChange(type, props) {
	    var control = controlSelectValue;
	    if ("function" === typeof props.onChange) {
	        return [props.onChange, control];
	    }
	    return control;
	}
	
	function controlInputAfterUpdates(vnode, domNode) {
	    var props, ref;
	    props = vnode.props;
	    if (vnode.tagName === "input" && ((ref = props.type) === "checkbox" || ref === "radio")) {
	        controlInputChecked({
	            target: domNode,
	            afterUpdates: true
	        });
	    } else if (hasEditableValue(vnode.tagName, props)) {
	        controlInputValue({
	            target: domNode,
	            afterUpdates: true
	        });
	    }
	    return vnode;
	}
	
	function controlOptionAfterUpdates(vnode, domNode) {
	    controlOptionSelected({
	        target: domNode,
	        afterUpdates: true
	    });
	    return vnode;
	}
	
	function controlSelectAfterUpdates(vnode, domNode) {
	    controlSelectValue({
	        target: domNode,
	        afterUpdates: true
	    });
	    return vnode;
	}

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2),
	    functions = __webpack_require__(3),
	    clone = functions.clone,
	    hasProp = functions.hasProp,
	    LinkUtils = __webpack_require__(61);
	
	var Renderer;
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11),
	    shouldWarnInputCheckedNull = true,
	    shouldWarnInputCheckedDefault = true,
	    shouldWarndUncontrolledToControlled = true,
	    shouldWarndControlledToUncontrolled = true;
	
	var destroyers = __webpack_require__(26);
	destroyers.reset.push(function () {
	    shouldWarnInputCheckedNull = true;
	    shouldWarnInputCheckedDefault = true;
	    shouldWarndUncontrolledToControlled = true;
	    shouldWarndControlledToUncontrolled = true;
	});
	//////////
	
	module.exports = function controlInputChecked(evt) {
	    /* eslint-disable consistent-return */
	    var target = evt.target,
	        preventDefault = evt.preventDefault,
	        vnode = Renderer.findVNodeAtNode(target);
	
	    if (vnode == null) {
	        // not created by us this instance of vrdom
	        return;
	    }
	
	    if (preventDefault) {
	        Renderer._afterUpdates[vnode.key] = true;
	        return LinkUtils.onCheckedChange(evt, vnode.props);
	    }
	
	    var inst = target[expando],
	        isNew = !hasProp.call(inst, "skipDefault"),
	        type = vnode.props.type,
	        name = target.name,
	        form = target.form,
	        originalTarget = target;
	
	    var parentNode, targets;
	
	    if (!isNew && type === "radio" && name) {
	        parentNode = originalTarget.parentNode;
	        if (parentNode) {
	            while (parentNode.parentNode) {
	                parentNode = parentNode.parentNode;
	            }
	            targets = parentNode.querySelectorAll("input[type=radio][name=" + JSON.stringify(name) + "]");
	        } else {
	            // some code messes up with vrdom behaviour
	            targets = [originalTarget];
	        }
	    } else {
	        targets = [originalTarget];
	    }
	
	    for (var i = 0, len = targets.length; i < len; i++) {
	        target = targets[i];
	
	        if (target === originalTarget) {
	            _controlInputChecked(evt);
	        } else if (form === target.form) {
	            if (hasProp.call(target, expando)) {
	                // only update inputs created by this instance of vrdom
	                _controlInputChecked({
	                    target: target
	                });
	            }
	        }
	    }
	    /* eslint-enable consistent-return */
	};
	
	function _controlInputChecked(evt) {
	    var target = evt.target,
	        vnode = Renderer.findVNodeAtNode(target);
	
	    if (vnode == null) {
	        return;
	    }
	
	    var inst = target[expando],
	        isNew = !hasProp.call(inst, "skipDefault"),
	        props = vnode.props,
	        checked = LinkUtils.getChecked(props),
	        defaultChecked = props.defaultChecked,
	        shouldControl = isNew || hasProp.call(vnode.props, "checked") || hasProp.call(vnode.props, "checkedLink");
	
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    var prevProps = isNew ? null : inst.props;
	    //////////
	
	    if (checked === null) {
	        ////////////////////////////////////////////////////////////////////
	        if (shouldWarnInputCheckedNull) {
	            msg = translator.translate("errors.input.checked-null", "<input type=\"" + props.type + "\" />", "checked");
	            shouldWarnInputCheckedNull = false;
	        }
	        //////////
	    } else if (checked !== undefined) {
	        ////////////////////////////////////////////////////////////////////
	        if (!prevProps && !msg && shouldWarnInputCheckedDefault && defaultChecked) {
	            msg = translator.translate("errors.input.both-default", "<input type=\"" + props.type + "\" />", "Input", "input element", "checked", "defaultChecked");
	            shouldWarnInputCheckedDefault = false;
	        }
	        //////////
	
	        if (isNew || shouldControl && target.checked !== checked) {
	            // according to w3c HTML spec,
	            // defaultChecked must reflect checked
	            // https://www.w3.org/TR/html/sec-forms.html#sec-forms
	            target.checked = checked;
	            target.defaultChecked = defaultChecked || checked;
	        }
	    } else if (shouldControl && defaultChecked && !inst.skipDefault) {
	        if (isNew || target.checked !== defaultChecked) {
	            target.checked = defaultChecked;
	        }
	    }
	
	    ////////////////////////////////////////////////////////////////////
	    if (prevProps) {
	        if (prevProps.checked != null && props.checked == null) {
	            if (shouldWarndUncontrolledToControlled) {
	                shouldWarndUncontrolledToControlled = false;
	                msg = translator.translate("errors.input.controlled-to-uncontrolled", "<input type=\"" + props.type + "\" />", "Input", "input element");
	            }
	        } else if (prevProps.checked == null && props.checked != null) {
	            if (shouldWarndControlledToUncontrolled) {
	                shouldWarndControlledToUncontrolled = false;
	                msg = translator.translate("errors.input.uncontrolled-to-controlled", "<input type=\"" + props.type + "\" />", "Input", "input element");
	            }
	        }
	    }
	
	    if (msg) {
	        console.error(msg);
	    }
	    //////////
	
	    inst.props = clone(props);
	    inst.skipDefault = true;
	}
	
	Renderer = __webpack_require__(44);

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	
	function assertValidCheckedLink(props) {
	    var msg;
	
	    if (props.valueLink != null) {
	        msg = translator.translate("errors.checkedLink-and-valueLink");
	        throw new Error(msg);
	    }
	
	    if (props.checked != null || props.onChange != null) {
	        msg = translator.translate("errors.checkedLink-and-value-or-onChange");
	        throw new Error(msg);
	    }
	}
	
	function assertValidValueLink(props) {
	    var msg;
	
	    if (props.checkedLink != null) {
	        msg = translator.translate("errors.checkedLink-and-valueLink");
	        throw new Error(msg);
	    }
	
	    if (props.value != null || props.onChange != null) {
	        msg = translator.translate("errors.valueLink-and-value-or-onChange");
	        throw new Error(msg);
	    }
	}
	//////////
	
	module.exports = {
	    getChecked: function getChecked(props) {
	        if (props.checkedLink != null) {
	            ////////////////////////////////////////////////////////////////////
	            assertValidCheckedLink(props);
	            //////////
	            return props.checkedLink.value;
	        }
	        return props.checked;
	    },
	
	    onCheckedChange: function onCheckedChange(evt, props) {
	        // eslint-disable-line consistent-return
	        if (props.checkedLink != null) {
	            ////////////////////////////////////////////////////////////////////
	            assertValidCheckedLink(props);
	            //////////
	            return props.checkedLink.requestChange(evt.target.checked);
	        }
	    },
	
	    getValue: function getValue(props) {
	        if (props.valueLink != null) {
	            ////////////////////////////////////////////////////////////////////
	            assertValidValueLink(props);
	            //////////
	            return props.valueLink.value;
	        }
	        return props.value;
	    },
	
	    onValueChange: function onValueChange(evt, props) {
	        // eslint-disable-line consistent-return
	        if (props.valueLink != null) {
	            ////////////////////////////////////////////////////////////////////
	            assertValidValueLink(props);
	            //////////
	            return props.valueLink.requestChange(evt.target.value);
	        }
	    }
	};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2),
	    clone = __webpack_require__(3).clone,
	    hasProp = __webpack_require__(3).hasProp,
	    LinkUtils = __webpack_require__(61);
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11),
	    shouldWarnInputValueNull = true,
	    shouldWarnInputValueDefault = true,
	    shouldWarndUncontrolledToControlled = true,
	    shouldWarndControlledToUncontrolled = true;
	
	var destroyers = __webpack_require__(26);
	destroyers.reset.push(function () {
	    shouldWarnInputValueNull = true;
	    shouldWarnInputValueDefault = true;
	    shouldWarndUncontrolledToControlled = true;
	    shouldWarndControlledToUncontrolled = true;
	});
	//////////
	
	var Renderer;
	
	module.exports = function controlInputValue(evt) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    var target = evt.target,
	        preventDefault = evt.preventDefault,
	        vnode = Renderer.findVNodeAtNode(target);
	
	    if (vnode == null) {
	        return;
	    }
	
	    if (preventDefault) {
	        Renderer._afterUpdates[vnode.key] = true;
	        return LinkUtils.onValueChange(evt, vnode.props); // eslint-disable-line consistent-return
	    }
	
	    var inst = target[expando],
	        isNew = !hasProp.call(inst, "skipDefault"),
	        props = vnode.props,
	        value = LinkUtils.getValue(props),
	        defaultValue = vnode.props.defaultValue,
	        shouldControl = isNew || hasProp.call(vnode.props, "value") || hasProp.call(vnode.props, "valueLink");
	
	    ////////////////////////////////////////////////////////////////////
	    var prevProps = isNew ? null : inst.props;
	    var description, lname, typeName;
	
	    switch (target.tagName) {// eslint-disable-line default-case
	        case "INPUT":
	            description = "<input" + (props.type ? " type=\"" + props.type + "\"" : "") + " />";
	            typeName = "Input";
	            lname = "input element";
	            break;
	        case "TEXTAREA":
	            description = "<textarea>";
	            typeName = "Textarea";
	            lname = "textarea";
	            break;
	    }
	    //////////
	
	    if (value === null) {
	        ////////////////////////////////////////////////////////////////////
	        if (shouldWarnInputValueNull) {
	            msg = translator.translate("errors.input.value-null", description, "value");
	            shouldWarnInputValueNull = false;
	        }
	        //////////
	    } else if (value !== undefined) {
	        ////////////////////////////////////////////////////////////////////
	        if (!prevProps && shouldWarnInputValueDefault && defaultValue != null) {
	            msg = translator.translate("errors.input.both-default", description, typeName, lname, "value", "defaultValue");
	            shouldWarnInputValueDefault = false;
	        }
	        //////////
	
	        if (isNew || shouldControl && String(target.value) !== String(value)) {
	            target.value = value;
	            target.defaultValue = defaultValue == null ? value : defaultValue;
	        }
	    } else if (shouldControl && defaultValue != null && !inst.skipDefault) {
	        if (isNew || String(target.value) !== String(defaultValue)) {
	            target.value = defaultValue;
	        }
	    }
	
	    ////////////////////////////////////////////////////////////////////
	    if (prevProps) {
	        if (prevProps.value != null && props.value == null) {
	            if (shouldWarndUncontrolledToControlled) {
	                shouldWarndUncontrolledToControlled = false;
	                msg = translator.translate("errors.input.controlled-to-uncontrolled", description, typeName, lname);
	            }
	        } else if (prevProps.value == null && props.value != null) {
	            if (shouldWarndControlledToUncontrolled) {
	                shouldWarndControlledToUncontrolled = false;
	                msg = translator.translate("errors.input.uncontrolled-to-controlled", description, typeName, lname);
	            }
	        }
	    }
	
	    if (msg) {
	        console.error(msg);
	    }
	    //////////
	
	    inst.props = clone(props);
	    inst.skipDefault = true;
	};
	
	Renderer = __webpack_require__(44);

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2),
	    hasProp = __webpack_require__(3).hasProp;
	
	var Renderer;
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	module.exports = function controlOptionSelected(evt) {
	    var target = evt.target;
	
	    var vnode = Renderer.findVNodeAtNode(target);
	    if (vnode == null) {
	        return;
	    }
	
	    var parentNode = target.parentNode;
	    if (!parentNode) {
	        return;
	    }
	
	    if (parentNode.tagName !== "SELECT") {
	        if (parentNode.tagName !== "OPTGROUP") {
	            return;
	        }
	
	        var grandParentNode = parentNode.parentNode;
	        if (!grandParentNode || grandParentNode.tagName !== "SELECT") {
	            return;
	        }
	
	        parentNode = grandParentNode;
	    }
	
	    if (!parentNode || !hasProp.call(parentNode, expando)) {
	        return;
	    }
	
	    var props = vnode.props;
	    var parentVNode = Renderer.findVNodeAtNode(parentNode);
	    var parentInst = parentNode[expando];
	
	    ////////////////////////////////////////////////////////////////////
	    if (props.selected != null) {
	        var msg = "Warning: " + translator.translate("errors.option-selected");
	        console.error(msg);
	    }
	    //////////
	
	    if (hasProp.call(parentInst, "skipDefault")) {
	        return;
	    }
	
	    var parentProps = parentVNode.props,
	        value = parentProps.value,
	        defaultValue = parentProps.defaultValue,
	        multiple = parentProps.multiple,
	        skipDefault = parentInst.skipDefault,
	        selectValue = skipDefault || defaultValue == null ? value : defaultValue;
	
	    var selected;
	
	    if (selectValue != null) {
	        value = String(props.value);
	        selected = false;
	        if (multiple) {
	            if (Array.isArray(selectValue)) {
	                for (var i = 0, len = selectValue.length; i < len; i++) {
	                    if (String(selectValue[i]) === value) {
	                        selected = true;
	                        break;
	                    }
	                }
	            }
	        } else {
	            selected = String(selectValue) === value;
	        }
	        target.selected = selected;
	    }
	};
	
	Renderer = __webpack_require__(44);

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	var hasProp = Object.prototype.hasOwnProperty;
	
	var expando = __webpack_require__(2);
	var clone = __webpack_require__(3).clone;
	var LinkUtils = __webpack_require__(61);
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	var shouldWarnSelectValueNull = true,
	    shouldWarnSelectValueDefault = true,
	    shouldWarndUncontrolledToControlled = true,
	    shouldWarndControlledToUncontrolled = true;
	
	var destroyers = __webpack_require__(26);
	destroyers.reset.push(function () {
	    shouldWarnSelectValueNull = true;
	    shouldWarnSelectValueDefault = true;
	    shouldWarndUncontrolledToControlled = true;
	    shouldWarndControlledToUncontrolled = true;
	});
	//////////
	
	var Renderer;
	
	module.exports = function controlSelectValue(evt) {
	    var target = evt.target,
	        preventDefault = evt.preventDefault;
	
	    var vnode = Renderer.findVNodeAtNode(target);
	
	    if (vnode == null) {
	        return;
	    }
	
	    if (preventDefault) {
	        Renderer._afterUpdates[vnode.key] = true;
	        return LinkUtils.onValueChange(evt, vnode.props); // eslint-disable-line consistent-return
	    }
	
	    var inst = target[expando],
	        isNew = !hasProp.call(inst, "skipDefault"),
	        props = vnode.props,
	        prevProps = isNew ? null : inst.props,
	        shouldControl = isNew || hasProp.call(vnode.props, "value") || hasProp.call(vnode.props, "valueLink");
	
	    inst.props = clone(props);
	
	    var value = LinkUtils.getValue(props),
	        defaultValue = props.defaultValue,
	        multiple = props.multiple;
	
	    if (prevProps && prevProps.multiple !== multiple) {
	        shouldControl = true;
	        inst.skipDefault = false;
	    }
	
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	
	    if (value === null) {
	        if (shouldWarnSelectValueNull) {
	            shouldWarnSelectValueNull = false;
	            msg = translator.translate("errors.input.value-null", "<select>", "value");
	        }
	    } else if (value != null && defaultValue != null) {
	        if (shouldWarnSelectValueDefault) {
	            shouldWarnSelectValueDefault = false;
	            msg = translator.translate("errors.input.both-default", "<select>", "Select", "select element", "value", "defaultValue");
	        }
	    }
	
	    if (prevProps) {
	        if (prevProps.value != null && value == null) {
	            if (shouldWarndUncontrolledToControlled) {
	                shouldWarndUncontrolledToControlled = false;
	                msg = translator.translate("errors.input.controlled-to-uncontrolled", "<select>", "Select", "select element");
	            }
	        } else if (prevProps.value == null && value != null) {
	            if (shouldWarndControlledToUncontrolled) {
	                shouldWarndControlledToUncontrolled = false;
	                msg = translator.translate("errors.input.uncontrolled-to-controlled", "<select>", "Select", "select element");
	            }
	        }
	    }
	
	    if (msg) {
	        console.error(msg);
	    }
	    //////////
	
	    if (!shouldControl) {
	        return;
	    }
	
	    if (isNew) {
	        inst.skipDefault = true;
	    }
	
	    var options = target.options;
	    if (!options) {
	        return;
	    }
	
	    if (value == null && !inst.skipDefault) {
	        value = defaultValue;
	    }
	
	    if (value == null) {
	        if (!multiple && defaultValue != null) {
	            target.defaultValue = String(defaultValue);
	        }
	        return;
	    }
	
	    var option, selected;
	    if (multiple) {
	        if (Array.isArray(value)) {
	            var selectedValues = {};
	
	            for (var i = 0, len = value.length; i < len; i++) {
	                selectedValues[String(value[i])] = true;
	            }
	
	            for (var j = 0, len1 = options.length; j < len1; j++) {
	                option = options[j];
	                selected = hasProp.call(selectedValues, String(option.value));
	                if (option.selected !== selected) {
	                    option.selected = selected;
	                }
	            }
	        }
	    } else {
	        var selectedValue = String(value);
	
	        for (var k = 0, len2 = options.length; k < len2; k++) {
	            option = options[k];
	            selected = selectedValue === String(option.value);
	            if (option.selected !== selected) {
	                option.selected = selected;
	            }
	        }
	
	        if (defaultValue != null) {
	            target.defaultValue = String(defaultValue);
	        }
	    }
	
	    inst.skipDefault = true;
	};
	
	Renderer = __webpack_require__(44);

/***/ }),
/* 65 */
/***/ (function(module, exports) {

	module.exports = {
	    "background": true,
	    "backgroundPosition": true,
	    "backgroundSize": true,
	    "baselineShift": true,
	    "blockSize": true,
	    "border": true,
	    "borderBefore": true,
	    "borderBlockEnd": true,
	    "borderBlockEndWidth": true,
	    "borderBlockStart": true,
	    "borderBlockStartWidth": true,
	    "borderBottom": true,
	    "borderBottomLeftRadius": true,
	    "borderBottomRightRadius": true,
	    "borderBottomWidth": true,
	    "borderImageOutset": true,
	    "borderImageWidth": true,
	    "borderInlineEnd": true,
	    "borderInlineEndWidth": true,
	    "borderInlineStart": true,
	    "borderInlineStartWidth": true,
	    "borderLeft": true,
	    "borderLeftWidth": true,
	    "borderRadius": true,
	    "borderRight": true,
	    "borderRightWidth": true,
	    "borderSpacing": true,
	    "borderTop": true,
	    "borderTopLeftRadius": true,
	    "borderTopRightRadius": true,
	    "borderTopWidth": true,
	    "borderWidth": true,
	    "bottom": true,
	    "columnGap": true,
	    "columnRuleWidth": true,
	    "columnWidth": true,
	    "columns": true,
	    "flexBasis": true,
	    "fontSize": true,
	    "gridAutoColumns": true,
	    "gridAutoRows": true,
	    "gridColumnGap": true,
	    "gridGap": true,
	    "gridRowGap": true,
	    "height": true,
	    "inlineSize": true,
	    "kerning": true,
	    "left": true,
	    "letterSpacing": true,
	    "lineHeight": true,
	    "margin": true,
	    "marginBlockEnd": true,
	    "marginBlockStart": true,
	    "marginBottom": true,
	    "marginInlineEnd": true,
	    "marginInlineStart": true,
	    "marginLeft": true,
	    "marginRight": true,
	    "marginTop": true,
	    "maskPositionX": true,
	    "maskPositionY": true,
	    "maskSize": true,
	    "maxBlockSize": true,
	    "maxHeight": true,
	    "maxInlineSize": true,
	    "maxWidth": true,
	    "minBlockSize": true,
	    "minHeight": true,
	    "minInlineSize": true,
	    "minWidth": true,
	    "objectPosition": true,
	    "offsetBlockEnd": true,
	    "offsetBlockStart": true,
	    "offsetInlineEnd": true,
	    "offsetInlineStart": true,
	    "outlineOffset": true,
	    "outlineRadius": true,
	    "outlineWidth": true,
	    "padding": true,
	    "paddingBlockEnd": true,
	    "paddingBlockStart": true,
	    "paddingBottom": true,
	    "paddingInlineEnd": true,
	    "paddingInlineStart": true,
	    "paddingLeft": true,
	    "paddingRight": true,
	    "paddingTop": true,
	    "perspective": true,
	    "perspectiveOrigin": true,
	    "right": true,
	    "shapeMargin": true,
	    "strokeDasharray": true,
	    "strokeDashoffset": true,
	    "strokeWidth": true,
	    "tabSize": true,
	    "textIndent": true,
	    "textStroke": true,
	    "textStrokeWidth": true,
	    "top": true,
	    "transformOrigin": true,
	    "verticalAlign": true,
	    "width": true,
	    "wordSpacing": true
	};

/***/ }),
/* 66 */
/***/ (function(module, exports) {

	module.exports = {
	    "animation": true,
	    "animationIterationCount": true,
	    "baselineShift": true,
	    "borderImageOutset": true,
	    "borderImageSlice": true,
	    "borderImageWidth": true,
	    "boxFlex": true,
	    "boxFlexGroup": true,
	    "boxOrdinalGroup": true,
	    "columnCount": true,
	    "columns": true,
	    "fillOpacity": true,
	    "flex": true,
	    "flexGrow": true,
	    "flexNegative": true,
	    "flexOrder": true,
	    "flexPositive": true,
	    "flexShrink": true,
	    "floodOpacity": true,
	    "fontSizeAdjust": true,
	    "fontWeight": true,
	    "forceBrokenImageIcon": true,
	    "gridColumnEnd": true,
	    "gridColumnStart": true,
	    "gridRowEnd": true,
	    "gridRowStart": true,
	    "lineClamp": true,
	    "lineHeight": true,
	    "maxZoom": true,
	    "minZoom": true,
	    "opacity": true,
	    "order": true,
	    "orphans": true,
	    "shapeImageThreshold": true,
	    "stopOpacity": true,
	    "strokeDasharray": true,
	    "strokeDashoffset": true,
	    "strokeMiterlimit": true,
	    "strokeOpacity": true,
	    "strokeWidth": true,
	    "tabSize": true,
	    "widows": true,
	    "zIndex": true,
	    "zoom": true
	};

/***/ }),
/* 67 */
/***/ (function(module, exports) {

	// https://www.w3.org/TR/html51/infrastructure.html#namespaces
	module.exports = {
	    HTMLnamespace: "http://www.w3.org/1999/xhtml",
	    MathMLnamespace: "http://www.w3.org/1998/Math/MathML",
	    SVGnamespace: "http://www.w3.org/2000/svg",
	    XLinknamespace: "http://www.w3.org/1999/xlink",
	    XMLnamespace: "http://www.w3.org/XML/1998/namespace",
	    XMLNSnamespace: "http://www.w3.org/2000/xmlns/"
	};

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = updateTree;
	
	var expando = __webpack_require__(2);
	
	var VirtualText = __webpack_require__(23);
	
	var setProperties = __webpack_require__(47);
	var createNode = __webpack_require__(46);
	
	var functions = __webpack_require__(3);
	var assign = functions.assign;
	var flattenChildren = functions.flattenChildren;
	var getKeyAndPrefixFromCanonicalKey = functions.getKeyAndPrefixFromCanonicalKey;
	var getOwnerDocument = functions.getOwnerDocument;
	var hasProp = functions.hasProp;
	var isObject = functions.isObject;
	var updateNodeMap = functions.updateNodeMap;
	
	var Renderer = __webpack_require__(44);
	var callVNodeHooks = __webpack_require__(45).callVNodeHooks;
	
	function updateTree(a, b, renderOptions, context) {
	    if (a === b) {
	        return a;
	    }
	
	    if (b == null) {
	        // destroy if next child is null
	        return destroyChildren(a, null, renderOptions);
	    }
	
	    if (!a.isWidget && a.element === b && a.context === context) {
	        // huge diff performance optimization
	        // quickly get out when the same non widget element is used
	        if (!a.parent) {
	            Renderer._rendered.push([a]);
	        }
	        return a;
	    }
	
	    var placeholder;
	    if (a.type !== b.type) {
	        placeholder = new VirtualText("");
	        placeholder.key = a.key;
	        placeholder.prefix = a.prefix;
	        placeholder.originalKey = a.originalKey;
	        placeholder.context = a.context;
	        placeholder.childContext = a.childContext;
	        placeholder.parent = a.parent;
	
	        a = destroyChildren(a, placeholder, renderOptions);
	    }
	
	    if (b.isVText) {
	        if (a.text !== b.text) {
	            return updateVText(a, b, renderOptions, !placeholder);
	        }
	
	        return a;
	    }
	
	    var typeOfb = typeof b.type;
	
	    if ("function" === typeOfb) {
	        return updateWidget(a, b, renderOptions, context);
	    }
	
	    if (a.isVText) {
	        return replaceVTextWithVNode(a, b, renderOptions, context);
	    }
	
	    return updateVNode(a, b, renderOptions, context);
	}
	
	function updateVNode(a, b, renderOptions, context) {
	    var hasChanged = false;
	
	    if (a.ref !== b.ref) {
	        hasChanged = true;
	        a.setRef(null);
	    }
	
	    var aProps = a.props;
	    var bProps = b.props;
	
	    var aChildren = a.children;
	    var bChildren = bProps.children;
	
	    var aInnerHTML = isObject(aProps.dangerouslySetInnerHTML) && aProps.dangerouslySetInnerHTML.__html;
	    var aTextContent = "string" === typeof aChildren || "number" === typeof aChildren ? aChildren : null;
	
	    var bInnerHTML = isObject(bProps.dangerouslySetInnerHTML) && bProps.dangerouslySetInnerHTML.__html;
	    var bTextContent = "string" === typeof bChildren || "number" === typeof bChildren ? bChildren : null;
	
	    if (aInnerHTML != null || aTextContent != null) {
	        aChildren = null;
	    }
	
	    if (bInnerHTML != null || bTextContent != null) {
	        bChildren = null;
	    }
	
	    hasChanged = setProperties(a, a.node, bProps, aProps) || hasChanged;
	
	    if (bInnerHTML != null || bTextContent != null) {
	        if (aInnerHTML == null && aTextContent == null) {
	            // remove previous children first
	            hasChanged = true;
	            updateChildren(a, aChildren, bChildren, renderOptions, context);
	            a.children = aChildren;
	        }
	
	        if (bInnerHTML != null) {
	            if (bInnerHTML !== aInnerHTML) {
	                // then set innerHTML
	                hasChanged = true;
	                a.node.innerHTML = bInnerHTML;
	                aProps.dangerouslySetInnerHTML = {
	                    __html: bInnerHTML
	                };
	            }
	        } else if (aTextContent !== bTextContent) {
	            hasChanged = true;
	            a.node.textContent = bTextContent;
	            a.children = bTextContent;
	        }
	    } else if (aInnerHTML != null || aTextContent != null) {
	        // clean innerHTML first
	        a.node.innerHTML = "";
	        a.children = aChildren;
	
	        // then add children
	        updateChildren(a, aChildren, bChildren, renderOptions, context);
	    } else {
	        // no innerHTML change
	        // only diff children
	        updateChildren(a, aChildren, bChildren, renderOptions, context);
	    }
	
	    if (hasChanged || aChildren !== a.children) {
	        Renderer._afterUpdates[a.key] = true;
	        Renderer._rendered.push([a, "componentDidUpdate", [a.element]]);
	    } else if (!a.parent) {
	        Renderer._rendered.push([a]);
	    }
	
	    a.update(b, null, null, renderOptions);
	
	    return a;
	}
	
	function destroyChildren(vnode, placeholder, renderOptions) {
	    callVNodeHooks("componentWillUnmount", vnode);
	
	    if (vnode.isVNode) {
	        setProperties(vnode, vnode.node, null, vnode.props);
	
	        var children = vnode.children;
	
	        if (children != null && "object" === typeof children) {
	            var keys = Object.keys(children);
	
	            // first, destroy children
	            // reverse order to ensure correct nodeIndex
	            for (var i = keys.length - 1; i !== -1; i--) {
	                destroyChildren(children[keys[i]], null, renderOptions);
	            }
	        }
	    }
	
	    removeNode(vnode, placeholder, renderOptions);
	
	    return placeholder;
	}
	
	function updateChildren(a, aChildren, bChildren, renderOptions, context) {
	    var aVNode, bVNode, bElement;
	    var hasChanged = false;
	
	    var aHasChildren = aChildren != null;
	    var bHasChildren = bChildren != null;
	
	    if (bHasChildren) {
	        bChildren = flattenChildren(bChildren, {}, a.type, {
	            prefix: a.key,
	            warnKey: false,
	            checkDuplicate: true,
	            ignoreError: false
	        }, a.element._owner);
	    }
	
	    var childrenLen = 0;
	    var keyPrefix;
	    var childNodes = a.node.childNodes;
	
	    if (aHasChildren) {
	        // remove deleted vnodes
	        for (var aKey in aChildren) {
	            if (!bHasChildren || !(aKey in bChildren)) {
	                // child has been removed
	                aVNode = aChildren[aKey];
	                updateTree(aVNode, null, renderOptions);
	                hasChanged = true;
	                delete aChildren[aKey];
	            }
	        }
	    }
	
	    if (bHasChildren) {
	
	        // add new nodes and diff existing ones
	        // eslint-disable-next-line guard-for-in
	        for (var bKey in bChildren) {
	            bElement = bChildren[bKey];
	
	            if (aHasChildren && bKey in aChildren) {
	                // child exists
	                aVNode = aChildren[bKey];
	                if (aVNode.isWidget) {
	                    aVNode.willReceive = true;
	                }
	                bVNode = updateTree(aVNode, bElement, renderOptions, context);
	
	                if (childNodes[childrenLen] !== bVNode.node) {
	                    hasChanged = true;
	                    moveNode(bVNode, childrenLen, a, renderOptions);
	                }
	
	                if (!hasChanged && aVNode !== bVNode) {
	                    hasChanged = true;
	                }
	            } else {
	                // new node
	                keyPrefix = getKeyAndPrefixFromCanonicalKey(bKey);
	
	                bVNode = Renderer.toVNode(bElement, a.key, a, keyPrefix[0], context);
	                insertNode(bVNode, childrenLen, a, renderOptions);
	                hasChanged = true;
	            }
	
	            bChildren[bKey] = bVNode;
	            childrenLen++;
	        }
	    }
	
	    if (hasChanged) {
	        a.children = bChildren;
	    }
	
	    a.context = context;
	    aChildren = null;
	    bChildren = null;
	}
	
	function removeNode(prevVNode, placeholder, renderOptions) {
	    var prevNode = prevVNode.node;
	    var nextNode;
	
	    if (prevVNode.isVNode || prevVNode.isWidget) {
	        prevNode = prevVNode.destroy(prevNode, placeholder, renderOptions);
	    }
	
	    if (prevNode.parentNode) {
	        if (placeholder) {
	            nextNode = createNode(placeholder, assign({}, renderOptions, {
	                document: getOwnerDocument(prevNode.parentNode)
	            }));
	            prevNode.parentNode.replaceChild(nextNode, prevNode);
	        } else {
	            prevNode.parentNode.removeChild(prevNode);
	        }
	    }
	
	    cleanDOMNode(prevNode);
	
	    updateNodeMap(prevVNode, placeholder, nextNode, renderOptions.nodeMap);
	}
	
	function insertNode(nextVNode, referenceVNodeIndex, parentVNode, renderOptions) {
	    var parentNode = parentVNode.node;
	
	    var nextNode = createNode(nextVNode, assign({}, renderOptions, {
	        document: getOwnerDocument(parentNode)
	    }));
	
	    var referenceNode = referenceVNodeIndex == null || referenceVNodeIndex >= parentNode.childNodes.length ? null : parentNode.childNodes[referenceVNodeIndex];
	    parentNode.insertBefore(nextNode, referenceNode);
	    updateNodeMap(null, nextVNode, nextNode, renderOptions.nodeMap);
	}
	
	function updateVText(prevVNode, nextVText, renderOptions, isUpdate) {
	    var prevNode = prevVNode.node;
	    var prevText = prevVNode.text;
	    var nextText = nextVText.text;
	
	    prevNode.replaceData(0, prevNode.length, nextText);
	
	    if (isUpdate) {
	        prevVNode.text = nextText;
	        Renderer._rendered.push([prevVNode, "componentDidUpdate", [prevText]]);
	    } else {
	        updateNodeMap(prevVNode, nextVText, prevNode, renderOptions.nodeMap);
	        prevVNode = nextVText;
	        Renderer._rendered.push([prevVNode, "componentDidMount", []]);
	    }
	
	    return prevVNode;
	}
	
	function updateWidget(prevVNode, nextElement, renderOptions, context) {
	    var prevNode = prevVNode.node;
	    var nextWidget, nextNode;
	
	    if (prevVNode.isWidget) {
	        // same widget type, do a widget.update
	        nextNode = prevVNode.update(nextElement, prevNode, context, renderOptions);
	    } else {
	        nextWidget = Renderer.toVNode(nextElement, prevVNode.prefix, prevVNode.parent, prevVNode.originalKey, context);
	
	        nextNode = createNode(nextWidget, assign({}, renderOptions, {
	            document: getOwnerDocument(prevNode.parentNode)
	        }));
	    }
	
	    var parentNode = prevNode.parentNode;
	
	    if (nextNode !== prevNode) {
	        if (parentNode) {
	            cleanDOMNode(prevNode);
	            parentNode.replaceChild(nextNode, prevNode);
	        }
	    }
	
	    if (nextWidget != null) {
	        updateNodeMap(prevVNode, nextWidget, nextNode, renderOptions.nodeMap);
	        prevVNode = nextWidget;
	    } else if (nextNode !== prevNode) {
	        prevVNode.node = nextNode;
	        renderOptions.nodeMap[prevVNode.key].node = nextNode;
	    }
	
	    return prevVNode;
	}
	
	function replaceVTextWithVNode(prevVNode, nextElement, renderOptions, context) {
	    var prevNode = prevVNode.node;
	    var parentNode = prevNode.parentNode;
	
	    var nextVNode = Renderer.toVNode(nextElement, prevVNode.prefix, prevVNode.parent, prevVNode.originalKey, context);
	    var nextNode = createNode(nextVNode, assign({}, renderOptions, {
	        document: getOwnerDocument(parentNode)
	    }));
	    cleanDOMNode(prevNode);
	    parentNode.replaceChild(nextNode, prevNode);
	
	    updateNodeMap(prevVNode, nextVNode, nextNode, renderOptions.nodeMap);
	
	    return nextVNode;
	}
	
	function moveNode(vnode, at, parentVNode) {
	    var domNode = vnode.node;
	
	    var parentNode = parentVNode.node;
	    var len = parentNode.childNodes.length;
	
	    if (len > at) {
	        var referenceNode = parentNode.childNodes[at];
	        if (domNode !== referenceNode && domNode.nextSibling !== referenceNode) {
	            parentNode.insertBefore(domNode, referenceNode);
	        }
	    } else {
	        parentNode.appendChild(domNode);
	    }
	}
	
	function cleanDOMNode(domNode) {
	    var inst, prop;
	    if (domNode && hasProp.call(domNode, expando)) {
	        inst = domNode[expando];
	
	        // eslint-disable-next-line guard-for-in
	        for (prop in inst) {
	            delete inst[prop];
	        }
	        delete domNode[expando];
	    }
	}

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = h;
	
	var functions = __webpack_require__(3);
	var flattenChildren = functions.flattenChildren;
	var flattenChildrenToString = functions.flattenChildrenToString;
	
	var VirtualNode = __webpack_require__(70);
	
	var xml = __webpack_require__(48);
	var XMLNameReg = xml.XMLNameReg;
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	function h(tagName, config, element, owner, context) {
	    var childNodes = {};
	    var props = element.props;
	    var children = props.children;
	
	    if (!isValidTagName(tagName)) {
	        return null;
	    }
	
	    if (tagName === "option") {
	        children = flattenChildrenToString(children);
	    }
	
	    var vnode = new VirtualNode(tagName, config, element, childNodes, owner, context);
	    var typeOfChildren = typeof children;
	    if (children == null || "string" === typeOfChildren || "number" === typeOfChildren) {
	        vnode.children = children;
	    } else {
	        flattenChildren(children, childNodes, tagName, {
	            prefix: vnode.key,
	            warnKey: false,
	            checkDuplicate: true,
	            ignoreError: false,
	            length: 0
	        }, owner);
	    }
	
	    return vnode;
	}
	
	function isValidTagName(type) {
	    if (XMLNameReg.test(type)) {
	        return true;
	    }
	    ////////////////////////////////////////////////////////////////////
	    var msg = translator.translate("errors.invalid-tag", type);
	    throw new Error(msg);
	    /////////
	    /////////////
	    //////////
	}

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	var functions = __webpack_require__(3);
	var attachRef = functions.attachRef;
	var clone = functions.clone;
	var hasProp = functions.hasProp;
	var getCanonicalKey = functions.getCanonicalKey;
	var uniqueId = functions.uniqueId;
	
	module.exports = VirtualNode;
	
	var Namespaces = __webpack_require__(67);
	var HTMLnamespace = Namespaces.HTMLnamespace;
	var MathMLnamespace = Namespaces.MathMLnamespace;
	var SVGnamespace = Namespaces.SVGnamespace;
	
	function VirtualNode(type, config, element, children, owner, context) {
	    this.id = uniqueId("VirtualNode");
	    this.type = type;
	    this.tagName = type;
	    this.children = children;
	    this.namespace = getNamespace(type, config.parent);
	    this.owner = owner;
	    this.element = element;
	    this.props = clone(element.props);
	    this.context = context;
	
	    var key = config.key;
	    this.ref = element.ref;
	    this.prefix = config.prefix;
	    this.parent = config.parent;
	    this.key = getCanonicalKey(key, this.prefix);
	    this.originalKey = key;
	    this.hasKey = key != null;
	    this.is = element.props.is;
	
	    this.updateRef = true;
	}
	
	VirtualNode.prototype.isVNode = true;
	
	VirtualNode.prototype.update = function (element) {
	    this.element = element;
	    // this.props = element.props; // incremental update in setProperties
	    if (this.ref !== this.element.ref) {
	        this.ref = this.element.ref;
	        this.updateRef = true;
	    }
	};
	
	VirtualNode.prototype.componentDidMount = function () {
	    this.setRef(this.node);
	};
	
	VirtualNode.prototype.componentDidUpdate = function () /* previous */{
	    this.setRef(this.node);
	};
	
	VirtualNode.prototype.setRef = function (domNode) {
	    if (domNode == null || this.updateRef) {
	        this.updateRef = false;
	        attachRef(this.owner, this.ref, domNode);
	    }
	};
	
	VirtualNode.prototype.destroy = function (domNode /* , placeholder */) {
	    if (this.willUnmount) {
	        return domNode;
	    }
	
	    this.willUnmount = true;
	
	    var vnode = this;
	
	    vnode.setRef(null);
	
	    for (var key in vnode) {
	        if (key !== "id" && key !== "key" && hasProp.call(vnode, key)) {
	            delete vnode[key];
	        }
	    }
	
	    return domNode;
	};
	
	VirtualNode.prototype.getInstance = function () {
	    return this.node || null;
	};
	
	function getNamespace(type, parent) {
	    switch (type) {
	        case "math":
	            return MathMLnamespace;
	        case "svg":
	            return SVGnamespace;
	        default:
	            return parent && parent.namespace || HTMLnamespace;
	    }
	}

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	
	var functions = __webpack_require__(3),
	
	////////////////////////////////////////////////////////////////////
	getDisplayName = functions.getDisplayName,
	    getDisplayRender = functions.getDisplayRender,
	
	//////////
	assign = functions.assign,
	    attachRef = functions.attachRef,
	    clone = functions.clone,
	    hasProp = functions.hasProp,
	    getCanonicalKey = functions.getCanonicalKey,
	    setExpandoData = functions.setExpandoData,
	    uniqueId = functions.uniqueId;
	
	var push = Array.prototype.push;
	
	////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	var Renderer, ComponentThunk, createNode, updateTree;
	
	module.exports = ComponentWidget;
	
	function ComponentWidget(type, config, element, owner, context) {
	    var key = config.key;
	
	    this.id = uniqueId("Widget");
	    this.emptyContext = {};
	    this.emptyPublicContext = {};
	
	    this.type = type;
	    this.owner = owner;
	    this.element = element;
	    this.props = element.props;
	    this.context = this.getContext(type, context);
	    this.ref = element.ref;
	
	    this.prefix = config.prefix;
	    this.parent = config.parent;
	    this.namespace = config.parent && config.parent.namespace;
	
	    this.key = getCanonicalKey(key, this.prefix);
	    this.originalKey = key;
	    this.hasKey = key != null;
	
	    this.thunk = new ComponentThunk(this);
	}
	
	ComponentWidget.prototype.isWidget = true;
	
	ComponentWidget.prototype.getInstance = function () {
	    var thunk = this.thunk;
	
	    if (thunk._type === "Stateless") {
	        return null;
	    }
	    return thunk.component;
	};
	
	ComponentWidget.prototype.init = function (renderOptions) {
	    var nextThunk = this.thunk;
	    var domNode, vnode;
	
	    this.cycle = true;
	    this.delayEnd = false;
	
	    try {
	        vnode = nextThunk.vnode = Renderer.toVNode(nextThunk.render(), this.key, this, 0, this.childContext);
	        domNode = createNode(vnode, renderOptions);
	        domNode = this.didMountOrUpdate(nextThunk, domNode, this);
	        this.componentWillDOMMount(domNode);
	    } finally {
	        if (!this.delayEnd) {
	            // an error occured before end process
	            // end component cycle
	            Renderer._rendered.push([this]);
	        }
	    }
	
	    return domNode;
	};
	
	ComponentWidget.prototype.update = function (nextElement, domNode, nextContext, renderOptions) {
	    var prevWidget = this,
	        prevThunk = prevWidget.thunk,
	        prevVNode = prevThunk.vnode;
	
	    var nextChildElement, vnode, newNode;
	
	    this.cycle = true;
	    this.delayEnd = false;
	
	    try {
	        if (nextElement.ref !== prevWidget.ref) {
	            prevWidget.setRef(null);
	            prevWidget.ref = nextElement.ref;
	            prevWidget.updateRef = true;
	        }
	
	        if (prevVNode.isWidget) {
	            prevVNode.willReceive = true;
	        }
	
	        nextChildElement = prevThunk.render(nextElement, nextContext);
	        // this.componentWillDOMUpdate(prevThunk, domNode);
	        vnode = updateTree(prevVNode, nextChildElement, renderOptions, prevWidget.childContext);
	        newNode = vnode.node;
	
	        if (vnode !== prevVNode) {
	            prevThunk.vnode = vnode;
	        }
	
	        if (newNode !== domNode) {
	            domNode = newNode;
	        }
	
	        domNode = this.didMountOrUpdate(prevThunk, domNode, prevWidget);
	    } finally {
	        if (this.delayEnd) {
	            this.element = nextElement;
	            this.props = nextElement.props;
	        } else {
	            // an error occured before end process
	            // end component cycle
	            Renderer._rendered.push([prevWidget]);
	        }
	    }
	    return domNode;
	};
	
	ComponentWidget.prototype.didMountOrUpdate = function (nextThunk, domNode, widget) {
	    var owner = this.owner,
	        component = nextThunk.component,
	        _type = nextThunk._type;
	
	    var endCycle = false;
	    var removed, prevProps, prevState, prevContext;
	
	    if (_type !== "Stateless") {
	        component[expando].vnode = this;
	        component[expando].vrdomID = this.key;
	
	        component[expando].isMounted = true;
	
	        if (hasProp.call(domNode, expando) && domNode[expando].removed) {
	            component[expando].removed = true;
	        }
	
	        removed = component[expando].removed;
	
	        setExpandoData(domNode, {
	            removed: removed
	        });
	    }
	
	    if (nextThunk.updated) {
	        prevProps = nextThunk.prevProps;
	        prevState = nextThunk.prevState;
	        prevContext = nextThunk.prevContext;
	
	        endCycle = true;
	        Renderer._rendered.push([widget, "componentDidUpdate", [prevProps, prevState, prevContext]]);
	    } else if (this.ref !== null || !owner || component.componentDidMount) {
	        // for performance in case there a many components, only track those with componentDidMount
	        // At end of rendering process, the last component is returned.
	        // No owner means top component and should be returned
	        endCycle = true;
	        Renderer._rendered.push([widget, "componentDidMount", []]);
	    }
	
	    if (!endCycle) {
	        Renderer._rendered.push([widget]);
	    }
	
	    this.delayEnd = true;
	    return domNode;
	};
	
	ComponentWidget.prototype.componentWillDOMMount = function (domNode) {
	    var thunk = this.thunk,
	        component = thunk.component,
	        _type = thunk._type;
	
	    if (_type !== "Stateless" && component.componentWillDOMMount) {
	        component.componentWillDOMMount(domNode);
	    }
	};
	
	// ComponentWidget.prototype.componentWillDOMUpdate = function(nextThunk, domNode) {
	//     var component = nextThunk.component,
	//         _type = nextThunk._type;
	
	//     var prevProps, prevState, prevContext;
	//     if (nextThunk.updated) {
	//         prevProps = nextThunk.prevProps;
	//         prevState = nextThunk.prevState;
	//         prevContext = nextThunk.prevContext;
	
	//         if (_type !== "Stateless" && component.componentWillDOMUpdate) {
	//             component.componentWillDOMUpdate(domNode, prevProps, prevState, prevContext);
	//         }
	//     }
	// };
	
	ComponentWidget.prototype.componentDidMount = function () {
	    var thunk = this.thunk,
	        component = thunk.component,
	        _type = thunk._type,
	        domNode = this.node;
	
	    if (_type !== "Stateless" && component.componentDidMount) {
	        component.componentDidMount();
	    }
	
	    this.setRef(domNode);
	};
	
	ComponentWidget.prototype.componentDidUpdate = function (prevProps, prevState, prevContext) {
	    var component = this.thunk.component,
	        domNode = this.node;
	
	    if (this.thunk.shouldUpdate) {
	        this.thunk.shouldUpdate = false;
	
	        if (component.componentDidUpdate) {
	            component.componentDidUpdate(prevProps, prevState, prevContext);
	        }
	    }
	
	    if (this.updateRef) {
	        this.updateRef = false;
	        this.setRef(domNode);
	    }
	};
	
	ComponentWidget.prototype.setRef = function (domNode) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    var type = this.type;
	    //////////
	    var ref = this.ref,
	        owner = this.owner,
	        thunk = this.thunk,
	        component = thunk.component,
	        _type = thunk._type;
	
	    if (ref == null) {
	        return;
	    }
	
	    if (_type === "Stateless") {
	        ////////////////////////////////////////////////////////////////////
	        msg = [translator.translate("errors.stateless-receive-ref", getDisplayName(type))];
	        if (owner) {
	            msg.push(translator.translate("common.created-in", getDisplayRender(owner)));
	        }
	        console.error(msg.join(" "));
	        //////////
	        return;
	    }
	
	    if (domNode == null) {
	        component = null;
	    }
	
	    attachRef(owner, ref, component);
	};
	
	ComponentWidget.prototype.enqueueState = function (method, state, replace, callback) {
	    var pendingMethod = this.pendingMethod;
	
	    if (!pendingMethod) {
	        this.pendingMethod = method;
	    } else if (method === "forceUpdate") {
	        this.pendingMethod = method;
	    } else if (pendingMethod !== "forceUpdate" && pendingMethod !== "replaceState") {
	        this.pendingMethod = method;
	    } else {
	        this.pendingMethod = method;
	    }
	
	    if (replace) {
	        this.pendingReplace = replace;
	        this.pendingState = state;
	    } else if (this.pendingState) {
	        push.apply(this.pendingState, state);
	    } else {
	        this.pendingState = state;
	    }
	
	    if (callback) {
	        if (this.pendingCallbacks) {
	            push.apply(this.pendingCallbacks, callback);
	        } else {
	            this.pendingCallbacks = callback;
	        }
	    }
	};
	
	ComponentWidget.prototype.processPendingState = function (component, nextProps, initial, nextContext) {
	    var pendingReplace = this.pendingReplace,
	        pendingState = this.pendingState,
	        pendingCallbacks = this.pendingCallbacks;
	
	    var start, state, nextState;
	
	    this.callbacks = pendingCallbacks;
	    this.pendingMethod = undefined;
	    this.pendingState = undefined;
	    this.pendingReplace = undefined;
	    this.pendingCallbacks = undefined;
	
	    if (!pendingState) {
	        if (pendingReplace) {
	            return pendingState;
	        }
	
	        if (initial) {
	            return component.state;
	        }
	
	        return clone(component.state);
	    }
	
	    if (pendingReplace) {
	        start = 1;
	        nextState = pendingState[0];
	    } else {
	        start = 0;
	        nextState = clone(component.state);
	    }
	
	    for (var i = start, len = pendingState.length; i < len; i++) {
	        state = pendingState[i];
	
	        if (typeof state === "function") {
	            state = state.call(component, nextState, nextProps, nextContext);
	        }
	
	        // deal with possible null state by replace state
	        nextState = assign({}, nextState, state);
	    }
	
	    return nextState;
	};
	
	ComponentWidget.prototype.getContext = function (type, context) {
	    var contextTypes = type.contextTypes;
	
	    if (contextTypes) {
	        var currentContext = this.emptyContext;
	
	        if (context !== null && "object" === typeof context) {
	            currentContext = {};
	
	            for (var propType in contextTypes) {
	                if (hasProp.call(contextTypes, propType)) {
	                    currentContext[propType] = context[propType];
	                }
	            }
	        }
	
	        context = currentContext;
	    } else if (!context) {
	        context = this.emptyContext;
	    }
	
	    return context;
	};
	
	ComponentWidget.prototype.getPublicContext = function (type, context) {
	    if (type.contextTypes) {
	        return context;
	    }
	    return this.emptyPublicContext;
	};
	
	ComponentWidget.prototype.destroy = function (domNode, placeholder, renderOptions) {
	    var type = this.type,
	        thunk = this.thunk,
	        _type = thunk._type,
	        willUnmount = this.willUnmount;
	
	    if (willUnmount) {
	        return domNode;
	    }
	
	    this.willUnmount = true;
	
	    var component = thunk.component,
	        vnode = thunk.vnode;
	
	    var inst;
	
	    if (_type !== "Stateless") {
	        if (hasProp.call(component, expando)) {
	            inst = component[expando];
	            willUnmount = inst.willUnmount;
	        }
	
	        if (!inst || willUnmount) {
	            return domNode;
	        }
	
	        this.setRef(null);
	
	        thunk.willUnmount();
	    }
	
	    placeholder = updateTree(vnode, placeholder, renderOptions);
	    if (placeholder) {
	        domNode = placeholder.node;
	    }
	
	    thunk.destroy();
	
	    if (_type !== "Stateless") {
	        var refs = component.refs;
	        if ("function" === typeof type && refs) {
	            // eslint-disable-next-line guard-for-in
	            for (var ref in refs) {
	                delete refs[ref];
	            }
	        }
	    }
	
	    for (var key in this) {
	        if (hasProp.call(this, key) && key !== "id" && key !== "key") {
	            delete this[key];
	        }
	    }
	    return domNode;
	};
	
	Renderer = __webpack_require__(44);
	ComponentThunk = __webpack_require__(72);
	createNode = __webpack_require__(46);
	updateTree = __webpack_require__(68);

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	var expando = __webpack_require__(2);
	
	var functions = __webpack_require__(3),
	
	////////////////////////////////////////////////////////////////////
	formatArgument = functions.formatArgument,
	    getDisplayName = functions.getDisplayName,
	
	//////////
	assign = functions.assign,
	    clone = functions.clone,
	    hasProp = functions.hasProp,
	    isComponentConstructor = functions.isComponentConstructor,
	    setExpandoData = functions.setExpandoData,
	    uniqueId = functions.uniqueId;
	
	var VirtualText = __webpack_require__(23);
	
	/////////////////////////////////////////////////////////////////////
	var translator = __webpack_require__(11);
	//////////
	
	var Renderer;
	
	module.exports = ComponentThunk;
	
	function ComponentThunk(widget) {
	    this.widget = widget;
	    this.id = uniqueId("Thunk");
	}
	
	ComponentThunk.prototype.type = "Thunk";
	
	ComponentThunk.prototype.render = function (nextElement, nextContext) {
	    if (nextElement) {
	        return this.updateComponent(nextElement, nextContext);
	    }
	    return this.renderComponent();
	};
	
	ComponentThunk.prototype.renderComponent = function () {
	    var component;
	
	    var widget = this.widget,
	        props = widget.props,
	        Constructor = widget.type,
	        context = widget.context,
	        publicContext = widget.getPublicContext(Constructor, context);
	
	    this.updated = false;
	    if (isComponentConstructor(Constructor)) {
	        component = new Constructor(props, publicContext);
	        this.initialRender(Constructor, component, props, context, publicContext);
	        this.component = component;
	    } else {
	        this._plainRender(Constructor, props, publicContext);
	        if (this._type !== "Stateless") {
	            this.initialRender(Constructor, this.component, props, context, publicContext);
	        } else {
	            widget.childContext = context;
	        }
	    }
	
	    return this._render();
	};
	
	ComponentThunk.prototype.initialRender = function (Constructor, component, props, context, publicContext) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    this.widget.childContext = this.getChildContext(Constructor, component, context);
	
	    if (component.props !== props) {
	        ////////////////////////////////////////////////////////////////////
	        if (component.props !== undefined) {
	            msg = "Warning: " + translator.translate("errors.component-super-no-props", getDisplayName(Constructor));
	            console.error(msg);
	        }
	        //////////
	        component.props = props;
	    }
	
	    if (component.context !== publicContext) {
	        ////////////////////////////////////////////////////////////////////
	        if (component.context !== undefined) {
	            msg = "Warning: " + translator.translate("errors.component-super-no-context", getDisplayName(Constructor));
	            console.error(msg);
	        }
	        //////////
	        component.context = publicContext;
	    }
	
	    if (component.state === undefined) {
	        component.state = null;
	    }
	
	    setExpandoData(component, {
	        vnode: this.widget,
	        vrdomID: this.widget.key,
	        willMount: true
	    });
	
	    ////////////////////////////////////////////////////////////////////
	    if (component.componentDidUnmount) {
	        msg = "Warning: " + translator.translate("errors.componentDidUnmount", getDisplayName(Constructor));
	        console.error(msg);
	    }
	    //////////
	
	    if (component.componentWillMount) {
	        component.componentWillMount();
	    }
	
	    component.state = this.widget.processPendingState(component, props, true, publicContext);
	
	    return component;
	};
	
	ComponentThunk.prototype.updateComponent = function (nextElement, nextContext) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    var prevThunk = this,
	        component = this.component,
	        widget = this.widget;
	
	    var type = widget.type,
	        prevElement = widget.element,
	        willReceive = widget.willReceive,
	        context = widget.context;
	
	    var nextCurrentContext, nextProps, prevProps, prevState, prevContext, pendingMethod, pendingReplace, pendingState, nextState;
	
	    nextContext = widget.getContext(type, nextContext);
	    nextCurrentContext = widget.getPublicContext(type, nextContext);
	    nextProps = nextElement.props;
	
	    if (this._type === "Stateless") {
	        this.updated = true;
	        widget.childContext = nextContext;
	        this._plainRender(type, nextProps, nextCurrentContext);
	    } else {
	        this.updated = component[expando].isMounted;
	
	        prevProps = component.props;
	        prevState = clone(component.state);
	        prevContext = clone(component.context);
	
	        if (willReceive) {
	            widget.willReceive = false;
	            if (component.componentWillReceiveProps) {
	                component.componentWillReceiveProps(nextProps, nextCurrentContext);
	            }
	        }
	
	        pendingMethod = widget.pendingMethod;
	        pendingReplace = widget.pendingReplace;
	        pendingState = widget.pendingState;
	
	        // if no set/replace/update state and same element
	        // return the previous vnode
	        if (!pendingMethod && prevElement === nextElement && context === nextContext) {
	            return prevThunk.vnode;
	        }
	
	        nextState = widget.processPendingState(component, nextProps, false, nextCurrentContext);
	
	        this.shouldUpdate = true;
	        if (component.shouldComponentUpdate && pendingMethod !== "forceUpdate" && (willReceive || pendingMethod)) {
	            this.shouldUpdate = component.shouldComponentUpdate(nextProps, nextState, nextCurrentContext);
	
	            if (this.shouldUpdate === false) {
	                // set new props/state/context even if no update
	
	                if (willReceive) {
	                    component.props = nextProps;
	                }
	
	                if (pendingState || pendingReplace) {
	                    component.state = nextState;
	                }
	
	                this.prevProps = prevProps;
	                this.prevState = prevState;
	                this.prevContext = prevContext;
	                component.context = nextCurrentContext;
	                widget.context = nextContext;
	                widget.childContext = this.getChildContext(type, component, nextContext);
	                return prevThunk.vnode;
	            }
	
	            ////////////////////////////////////////////////////////////////////
	            if (this.shouldUpdate !== true) {
	                msg = "Warning: " + translator.translate("errors.shouldComponentUpdate-not-boolean", getDisplayName(type), formatArgument(this.shouldUpdate));
	                console.error(msg);
	            }
	            //////////
	        }
	
	        if (this.shouldUpdate !== false && component.componentWillUpdate) {
	            component.componentWillUpdate(nextProps, nextState, nextCurrentContext);
	        }
	
	        if (willReceive || pendingMethod === "forceUpdate") {
	            component.props = nextProps;
	        }
	        this.prevProps = prevProps;
	        this.prevState = prevState;
	        this.prevContext = prevContext;
	        component.state = nextState;
	        component.context = nextCurrentContext;
	        widget.context = nextContext;
	        widget.childContext = this.getChildContext(type, component, nextContext);
	    }
	
	    return this._render();
	};
	
	ComponentThunk.prototype.getChildContext = function (type, component, context) {
	    var childContext;
	
	    ////////////////////////////////////////////////////////////////////
	    var displayName, childContextTypes, msg;
	    //////////
	
	    if (component.getChildContext) {
	        childContext = component.getChildContext();
	
	        if (childContext != null && "object" === typeof childContext) {
	
	            ////////////////////////////////////////////////////////////////////
	            displayName = getDisplayName(type);
	            childContextTypes = type.childContextTypes;
	
	            if (childContextTypes == null || "object" !== typeof childContextTypes) {
	                msg = translator.translate("errors.childContextTypes-missing", displayName);
	                throw new Error(msg);
	            }
	
	            for (var key in childContext) {
	                if (!hasProp.call(childContextTypes, key)) {
	                    msg = translator.translate("errors.childContextTypes-key", displayName, key);
	                    throw new Error(msg);
	                }
	            }
	            //////////
	
	            context = assign({}, context, childContext);
	        }
	    }
	
	    return context;
	};
	
	ComponentThunk.prototype._plainRender = function (type, props, context) {
	    ////////////////////////////////////////////////////////////////////
	    var msg;
	    //////////
	
	    var el;
	    var _currentOwner = Renderer._currentOwner;
	    Renderer._currentOwner = type;
	    el = type(props, context);
	    Renderer._currentOwner = _currentOwner;
	
	    if (el === null || el === false) {
	        this._type = "Stateless";
	        this.component = null;
	    } else if ("object" === typeof el && el.render) {
	        this.component = el;
	    } else if (functions.isValidElement(el)) {
	        this._type = "Stateless";
	
	        if ("string" === typeof el.ref) {
	            ////////////////////////////////////////////////////////////////////
	            msg = translator.translate("errors.stateless-set-ref", getDisplayName(type));
	            throw new Error(msg);
	            /////////
	            //////////////
	            //////////
	        }
	
	        this.component = el;
	    }
	    ////////////////////////////////////////////////////////////////////
	    else {
	            msg = translator.translate("errors.invalid-element", getDisplayName(type) + "(...)");
	            throw new Error(msg);
	        }
	    //////////
	
	    return el;
	};
	
	ComponentThunk.prototype._render = function () {
	    var component = this.component;
	
	    var el, inst, prevOwner;
	
	    ////////////////////////////////////////////////////////////////////
	    var name, msg;
	    var type = this.widget.type;
	    //////////
	
	    if (this._type === "Stateless") {
	        el = component;
	    } else {
	        inst = setExpandoData(component, {
	            willMount: false
	        });
	
	        prevOwner = Renderer._currentOwner;
	        Renderer._currentOwner = component;
	        inst.removed = false;
	
	        try {
	            el = component.render();
	
	            if (!functions.isValidElement(el)) {
	                if (el === null || typeof el === "boolean") {
	                    el = null;
	                } else {
	                    ////////////////////////////////////////////////////////////////////
	                    name = getDisplayName(type) + ".render()";
	                    msg = translator.translate("errors.invalid-element", name);
	                    throw new Error(msg);
	                    /////////
	                    //////////
	                    //////////
	                }
	            }
	        } finally {
	            Renderer._currentOwner = prevOwner;
	        }
	    }
	
	    if (el == null) {
	        if (inst) {
	            inst.removed = true;
	        }
	        el = new VirtualText("");
	    }
	
	    return el;
	};
	
	ComponentThunk.prototype.willUnmount = function () {
	    var component = this.component;
	
	    component[expando].willUnmount = true;
	    if (component[expando].isMounted && component.componentWillUnmount) {
	        component.componentWillUnmount();
	    }
	
	    delete component[expando];
	};
	
	ComponentThunk.prototype.destroy = function () {
	    var key;
	
	    if (this._type !== "Stateless") {
	        var component = this.component;
	        var props = component.props;
	        var state = component.state;
	        var context = component.context;
	
	        if (!Object.isFrozen(props)) {
	            for (key in props) {
	                if (hasProp.call(props, key)) {
	                    delete props[key];
	                }
	            }
	        }
	
	        if (state && !Object.isFrozen(state)) {
	            for (key in state) {
	                if (hasProp.call(state, key)) {
	                    delete state[key];
	                }
	            }
	        }
	
	        if (context && !Object.isFrozen(context)) {
	            for (key in context) {
	                if (hasProp.call(context, key)) {
	                    delete context[key];
	                }
	            }
	        }
	    }
	
	    for (key in this) {
	        if (hasProp.call(this, key) && key !== "id" && key !== "key") {
	            delete this[key];
	        }
	    }
	};
	
	Renderer = __webpack_require__(44);

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	var voidElements = __webpack_require__(74);
	
	var functions = __webpack_require__(3),
	    hasProp = functions.hasProp;
	
	////////////////////////////////////////////////////////////////////
	var getDisplayName = functions.getDisplayName,
	    isObject = functions.isObject,
	    hasEditableValue = functions.hasEditableValue;
	
	var translator = __webpack_require__(11);
	var validators = {
	    input: validateCheckedOrValueProp,
	    textarea: validateCheckedOrValueProp
	};
	//////////
	
	module.exports = validateProperties;
	
	function countChildren(children) {
	    if (Array.isArray(children)) {
	        return children.length;
	    }
	
	    if (children != null) {
	        return 1;
	    }
	
	    return 0;
	}
	
	function validateProperties(type, props, children, owner) {
	    ////////////////////////////////////////////////////////////////////
	    var msg, ownerName, value;
	    if (owner) {
	        ownerName = getDisplayName(owner);
	    }
	    //////////
	
	    var hasChildren = countChildren(children) !== 0;
	
	    if (hasProp.call(voidElements, type)) {
	        if (hasChildren || props.dangerouslySetInnerHTML) {
	            ////////////////////////////////////////////////////////////////////
	            msg = [translator.translate("errors.void-with-children", type)];
	            if (ownerName) {
	                msg.push(translator.translate("common.check-render-of", ownerName));
	            }
	            throw new Error(msg.join(" "));
	            /////////
	            //////////////////////
	            /////////////////////////////////////
	            //////////
	        }
	    }
	
	    ////////////////////////////////////////////////////////////////////
	    if (hasChildren && props.dangerouslySetInnerHTML != null) {
	        throw new Error(translator.translate("errors.children-and-dangerouslySetInnerHTML"));
	    }
	
	    if (!props.suppressContentEditableWarning && props.contentEditable && hasChildren) {
	        msg = "Warning: " + translator.translate("errors.editable-with-children", type);
	        console.error(msg);
	    }
	
	    if (props.style != null && "object" !== typeof props.style || Array.isArray(props.style)) {
	        msg = [translator.translate("errors.invalid-style")];
	        if (ownerName) {
	            msg.push(translator.translate("common.render-by", ownerName));
	        }
	        throw new Error(msg.join(" "));
	    }
	
	    if (hasProp.call(props, "innerHTML")) {
	        msg = translator.translate("errors.props-innerHTML");
	        console.error(msg);
	    }
	
	    if (props.dangerouslySetInnerHTML != null) {
	        value = props.dangerouslySetInnerHTML;
	        if (!isObject(value) || !hasProp.call(value, "__html")) {
	            msg = translator.translate("errors.invalid-dangerouslySetInnerHTML");
	            throw new Error(msg);
	        }
	    }
	
	    if (hasProp.call(validators, type)) {
	        validators[type](type, props);
	    }
	    //////////
	}
	
	////////////////////////////////////////////////////////////////////
	function validateCheckedOrValueProp(type, props) {
	    var ref;
	    if (type === "input" && ((ref = props.type) === "checkbox" || ref === "radio")) {
	        validateCheckedProp(type, props);
	    } else if (hasEditableValue(type, props)) {
	        validateValueProp(type, props);
	    }
	}
	
	function validateCheckedProp(type, props) {
	    if (!props.checked || props.readOnly || props.onChange || props.disabled) {
	        return;
	    }
	
	    var msg = translator.translate("errors.checked-without-control", type);
	    console.error(msg);
	}
	
	function validateValueProp(type, props) {
	    if (props.value == null || props.readOnly || props.onChange || props.disabled) {
	        return;
	    }
	
	    var msg = translator.translate("errors.value-without-control", type);
	    console.error(msg);
	}
	//////////

/***/ }),
/* 74 */
/***/ (function(module, exports) {

	/**
	 * This file automatically generated from `pre-publish.js`.
	 * Do not manually edit.
	 */
	
	module.exports = {
	  "area": true,
	  "base": true,
	  "br": true,
	  "col": true,
	  "embed": true,
	  "hr": true,
	  "img": true,
	  "input": true,
	  "keygen": true,
	  "link": true,
	  "menuitem": true,
	  "meta": true,
	  "param": true,
	  "source": true,
	  "track": true,
	  "wbr": true
	};

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	var functions = __webpack_require__(3);
	var flattenChildren = functions.flattenChildren;
	
	exports.map = map;
	exports.forEach = forEach;
	exports.count = count;
	exports.only = only;
	exports.toArray = toArray;
	
	function map(children, fn, ctx) {
	    if (children == null) {
	        return children;
	    }
	
	    var res = [];
	
	    if (ctx === undefined) {
	        ctx = children;
	    }
	
	    toChildNodes(children, function () {
	        res.push(fn.apply(ctx, arguments));
	    });
	
	    return res;
	}
	
	function forEach(children, fn, ctx) {
	    if (children == null) {
	        return;
	    }
	
	    if (ctx === undefined) {
	        ctx = children;
	    }
	
	    toChildNodes(children, fn.bind(ctx));
	}
	
	function count(children) {
	    if (children == null) {
	        return 0;
	    }
	
	    var calls = 0;
	    toChildNodes(children, function () {
	        ++calls;
	    });
	
	    return calls;
	}
	
	function only(children) {
	    if (!functions.isValidElement(children)) {
	        ////////////////////////////////////////////////////////////////////
	        throw new Error("Invalid only child");
	        /////////
	        ////////////////////////////////////
	        ///////////////////////////////////////////////////////
	        //////////
	    }
	
	    return children;
	}
	
	function toArray(children) {
	    return map(children, identity);
	}
	
	function identity(child) {
	    return child;
	}
	
	function toChildNodes(children, callback) {
	    var options = {
	        prefix: "RootID",
	        ignoreError: false,
	        checkDuplicate: false,
	        warnKey: false
	    };
	
	    return flattenChildren(children, {}, "undefined", options, null, callback);
	}

/***/ }),
/* 76 */
/***/ (function(module, exports) {

	module.exports = {
	    array: {},
	    bool: {},
	    func: {},
	    number: {},
	    object: {},
	    string: {},
	    any: {},
	    arrayOf: {},
	    element: {},
	    instanceOf: {},
	    node: {},
	    objectOf: {},
	    oneOf: {},
	    oneOfType: {},
	    shape: {}
	};

/***/ })
/******/ ])
});
;
//# sourceMappingURL=vrdom-dev.js.map
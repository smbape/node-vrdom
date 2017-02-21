(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vrdom"));
	else if(typeof define === 'function' && define.amd)
		define(["vrdom"], factory);
	else if(typeof exports === 'object')
		exports["vrdomCompat"] = factory(require("vrdom"));
	else
		root["vrdomCompat"] = factory(root["vrdom"]);
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
/***/ function(module, exports, __webpack_require__) {

	var vrdom = __webpack_require__(1),
	    expando = vrdom.expando,
	    functions = vrdom.functions,
	    hasProp = functions.hasProp,
	    inherits = functions.inherits,
	    implement = functions.implement,
	    appendHook = vrdom.hooks.appendHook,
	    Component = vrdom.Component;
	
	Object.defineProperty(Component.prototype, "_reactInternalInstance", {
	    configurable: true, // the type of this property descriptor may be changed and if the property may be deleted from the corresponding object.
	    enumerable: true, // this property shows up during enumeration of the properties on the corresponding object.
	    get: function get() {
	        if (!hasProp.call(this, expando) || !hasProp.call(this[expando], "vnode")) {
	            return undefined;
	        }
	        return { _currentElement: this[expando].vnode.element };
	    }
	});
	
	var isEqual = __webpack_require__(2);
	
	// eslint-disable-next-line no-undef, no-magic-numbers
	var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
	
	function reactElementHook(el) {
	    el.$$typeof = REACT_ELEMENT_TYPE;
	    return el;
	}
	
	appendHook("afterCreateElement", reactElementHook);
	
	vrdom.isValidElement = function (object) {
	    return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	};
	
	var PureRenderMixin = {
	    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
	        return !isEqual(this.props, nextProps, true, 1) || !isEqual(this.state, nextState, true, 1);
	    }
	};
	
	vrdom.PureRenderMixin = PureRenderMixin;
	
	vrdom.PureComponent = PureComponent;
	
	function PureComponent() {
	    return PureComponent.__super__.constructor.apply(this, arguments);
	}
	
	inherits(PureComponent, Component);
	implement(PureComponent, PureRenderMixin);
	PureComponent.prototype.isPureReactComponent = true;
	
	module.exports = vrdom;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	var hasProp = Object.prototype.hasOwnProperty,
	    toString = Object.prototype.toString;
	
	module.exports = function isEqual(a, b, strictKeyOrder, depth) {
	    return eq(a, b, strictKeyOrder, depth);
	};
	
	// underscore isEqual
	// Internal recursive comparison function for `isEqual`.
	function eq(a, b, strictKeyOrder, depth, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren"t identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) {
	        return a !== 0 || 1 / a === 1 / b;
	    }
	
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) {
	        return a === b;
	    }
	
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) {
	        return false;
	    }
	
	    // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	    switch (className) {
	        case "[object RegExp]":
	        case "[object String]":
	            return String(a) === String(b);
	
	        case "[object Number]":
	            // `NaN`s are equivalent, but non-reflexive.
	            // Object(NaN) is equivalent to NaN
	            if (Number(a) !== Number(a)) {
	                return Number(b) !== Number(b);
	            }
	
	            // An `egal` comparison is performed for other numeric values.
	            return Number(a) === 0 ? 1 / Number(a) === 1 / b : Number(a) === Number(b);
	
	        case "[object Date]":
	        case "[object Boolean]":
	            // Coerce dates and booleans to numeric primitive values. Dates are compared by their millisecond representations.
	            // Note that invalid dates with millisecond representations of `NaN` are not equivalent.
	            return Number(a) === Number(b);
	        default:
	            // do nothing
	            break;
	    }
	
	    var areArrays = className === "[object Array]";
	
	    if (!areArrays) {
	        if (typeof a !== "object" || typeof b !== "object") {
	            return false;
	        }
	
	        // Objects with different constructors are not equivalent,
	        // but `Object`s or `Array`s from different frames are.
	        var actor = a.constructor;
	        var bctor = b.constructor;
	
	        if (actor !== bctor && !(isFunction(actor) && actor instanceof actor && isFunction(bctor) && bctor instanceof bctor) && "constructor" in a && "constructor" in b) {
	            return false;
	        }
	    }
	
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    // Initializing stack of traversed objects.
	    // It"s done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	
	    while (0 !== length--) {
	        // Linear search. Performance is inversely proportional to the number of
	        // unique nested structures.
	        if (aStack[length] === a) {
	            return bStack[length] === b;
	        }
	    }
	
	    if (depth != null && isFinite(depth)) {
	        if (aStack.length === depth) {
	            return false;
	        }
	    }
	
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	
	    // Recursively compare objects and arrays.
	    if (areArrays) {
	        // Compare array lengths to determine if a deep comparison is necessary.
	        length = a.length;
	
	        if (length !== b.length) {
	            return false;
	        }
	
	        // Deep compare the contents, ignoring non-numeric properties.
	        while (0 !== length--) {
	            if (!eq(a[length], b[length], strictKeyOrder, depth, aStack, bStack)) {
	                return false;
	            }
	        }
	    } else {
	        // Deep compare objects.
	
	        var aKeys = Object.keys(a);
	        var bKeys = Object.keys(b);
	        length = aKeys.length;
	
	        // Ensure that both objects contain the same number of properties before comparing deep equality.
	        if (bKeys.length !== length) {
	            return false;
	        }
	
	        var i, key;
	
	        // array like objects return keys in numerical order
	        if (strictKeyOrder) {
	            i = 0;
	
	            for (key in a) {
	                if (hasProp.call(a, key)) {
	                    aKeys[i++] = key;
	                }
	            }
	
	            i = 0;
	            for (key in b) {
	                if (hasProp.call(b, key)) {
	                    bKeys[i++] = key;
	                }
	            }
	        }
	
	        while (0 !== length--) {
	            // Deep compare each member
	            key = aKeys[length];
	
	            if (strictKeyOrder && key !== bKeys[length]) {
	                return false;
	            }
	
	            if (!(hasProp.call(b, key) && eq(a[key], b[key], strictKeyOrder, depth, aStack, bStack))) {
	                return false;
	            }
	        }
	    }
	
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	
	    return true;
	}
	
	function isFunction(obj) {
	    return "function" === typeof obj;
	}

/***/ }
/******/ ])
});
;
//# sourceMappingURL=vrdom-compat.map
var Component = require("./Component"),
    destroyers = require("./destroyers"),
    HTMLElements = require("./w3c").elements,
    expando = require("./expando"),
    validateProperties = require("./virtual-dom/validate-properties"),

    slice = Array.prototype.slice;

var hooks = require("./hooks"),
    getHooks = hooks.getHooks;

var Renderer = require("./Renderer"),
    nodeMap = Renderer._nodeMap;

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("./messages/translator");
/// #endif

var functions = require("./functions"),
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    getDisplayName = functions.getDisplayName,
    getDisplayRender = functions.getDisplayRender,
    flattenChildren = functions.flattenChildren,
    /// #endif
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

        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if ("object" !== typeof initialState || Array.isArray(initialState)) {
            var msg = translator.translate("errors.invalid-initialState", getDisplayName(this));
            throw new Error(msg);
        }
        /// #endif

        this.state = initialState;
    }

    inherits(ComponentClass, Component);
    ComponentClass.displayName = "Component";
    ComponentClass.prototype[expando + "_autobinds"] = {};

    ComponentClass.prototype.replaceState = function(state, callback) {
        Renderer.updateState("replaceState", this, [state], true, callback);
    };

    ComponentClass.prototype.isMounted = function() {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (Renderer._currentOwner && this === Renderer._currentOwner) {
            var msg = translator.translate("errors.is-mounted-in-render", getDisplayName(this), getDisplayRender(this));
            console.error(msg);
        }
        /// #endif
        return hasProp.call(this, expando) && hasProp.call(this[expando], "vrdomID") && hasProp.call(nodeMap, this[expando].vrdomID);
    };

    implement(ComponentClass, spec);

    if (ComponentClass.getDefaultProps) {
        ComponentClass.defaultProps = ComponentClass.getDefaultProps();
        delete ComponentClass.getDefaultProps;
    }

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    if ("function" !== typeof ComponentClass.prototype.render) {
        var msg = translator.translate("errors.undefined-render-method");
        throw new Error(msg);
    }
    /// #endif

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

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
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
    /// #endif

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

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var displayName = getDisplayName(component);
    var nativeBind = fBound.bind;

    fBound.bind = function(context) {
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
    /// #endif

    return fBound;
}

function computeProps(type, config, children, owner) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

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
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        msg = translator.translate("errors.textarea-children");
        console.error(msg);
        /// #endif

        if (Array.isArray(children)) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            if (children.length > 1) {
                msg = translator.translate("errors.textarea-multiple-children");
                throw new Error(msg);
            }
            /// #endif
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

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var topFlat = false;
    /// #endif

    if (children.length === 0) {
        if (config.children != null) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            topFlat = true;
            /// #endif
            children = config.children;
        } else {
            children = undefined;
        }
    } else if (children.length === 1) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        topFlat = true;
        /// #endif
        children = children[0];
    }

    config.children = children;

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
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
    /// #endif

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
    Children: require("./Children"),
    PropTypes: require("./PropTypes"),
    expando: expando,
    hooks: hooks,
    functions: functions,
    renderOptions: Renderer.renderOptions,
    LinkUtils: require("./controls/LinkUtils"),
    DOM: (function() {
        var DOM = {};

        for (var i = 0, len = HTMLElements.length; i < len; i++) {
            var tagName = HTMLElements[i];
            DOM[tagName] = createFactory(tagName);
        }

        return DOM;
    })(),
    reset: function() {
        destroyers.destroy();
    }
});
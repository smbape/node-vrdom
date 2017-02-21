var expando = require("./expando");

var functions = require("./functions"),
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    formatArgument = functions.formatArgument,
    getDisplayName = functions.getDisplayName,
    /// #endif
    assign = functions.assign,
    clone = functions.clone,
    hasProp = functions.hasProp,
    isComponentConstructor = functions.isComponentConstructor,
    setExpandoData = functions.setExpandoData,
    uniqueId = functions.uniqueId;

var VirtualText = require("./virtual-dom/VirtualText");

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production" 
var translator = require("./messages/translator");
/// #endif

var Renderer;

module.exports = ComponentThunk;

function ComponentThunk(widget) {
    this.widget = widget;
    this.id = uniqueId("Thunk");
}

ComponentThunk.prototype.type = "Thunk";

ComponentThunk.prototype.render = function(nextElement, nextContext) {
    if (nextElement) {
        return this.updateComponent(nextElement, nextContext);
    }
    return this.renderComponent();
};

ComponentThunk.prototype.renderComponent = function() {
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

ComponentThunk.prototype.initialRender = function(Constructor, component, props, context, publicContext) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    this.widget.childContext = this.getChildContext(Constructor, component, context);

    if (component.props !== props) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (component.props !== undefined) {
            msg = "Warning: " + translator.translate("errors.component-super-no-props", getDisplayName(Constructor));
            console.error(msg);
        }
        /// #endif
        component.props = props;
    }

    if (component.context !== publicContext) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (component.context !== undefined) {
            msg = "Warning: " + translator.translate("errors.component-super-no-context", getDisplayName(Constructor));
            console.error(msg);
        }
        /// #endif
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

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    if (component.componentDidUnmount) {
        msg = "Warning: " + translator.translate("errors.componentDidUnmount", getDisplayName(Constructor));
        console.error(msg);
    }
    /// #endif

    if (component.componentWillMount) {
        component.componentWillMount();
    }

    component.state = this.widget.processPendingState(component, props, true, publicContext);

    return component;
};

ComponentThunk.prototype.updateComponent = function(nextElement, nextContext) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    var prevThunk = this,
        component = this.component,
        widget = this.widget;

    var type = widget.type,
        prevElement = widget.element,
        willReceive = widget.willReceive,
        context = widget.context;

    var nextCurrentContext, nextProps, prevProps, prevState, prevContext, pendingMethod, pendingReplace, pendingState, nextState, shouldUpdate;

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

        if (component.shouldComponentUpdate && pendingMethod !== "forceUpdate" && (willReceive || pendingMethod)) {
            shouldUpdate = component.shouldComponentUpdate(nextProps, nextState, nextCurrentContext);

            if (shouldUpdate === false) {
                // set new props/state/context even if no update

                if (willReceive) {
                    component.props = nextProps;
                }

                if (pendingState || pendingReplace) {
                    component.state = nextState;
                }

                component.context = nextCurrentContext;
                widget.context = nextContext;
                widget.childContext = this.getChildContext(type, component, nextContext);
                return prevThunk.vnode;
            }

            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            if (shouldUpdate !== true) {
                msg = "Warning: " + translator.translate("errors.shouldComponentUpdate-not-boolean", getDisplayName(type), formatArgument(shouldUpdate));
                console.error(msg);
            }
            /// #endif
        }

        if (component.componentWillUpdate) {
            component.componentWillUpdate(nextProps, nextState, nextCurrentContext);
        }

        this.prevProps = prevProps;
        this.prevState = prevState;
        this.prevContext = prevContext;

        if (willReceive || pendingMethod === "forceUpdate") {
            component.props = nextProps;
        }
        component.state = nextState;
        component.context = nextCurrentContext;
        widget.context = nextContext;
        widget.childContext = this.getChildContext(type, component, nextContext);
    }

    return this._render();
};

ComponentThunk.prototype.getChildContext = function(type, component, context) {
    var childContext;

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var displayName, childContextTypes, msg;
    /// #endif

    if (component.getChildContext) {
        childContext = component.getChildContext();

        if (childContext != null && "object" === typeof childContext) {

            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
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
            /// #endif

            context = assign({}, context, childContext);
        }
    }

    return context;
};

ComponentThunk.prototype._plainRender = function(type, props, context) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

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
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            msg = translator.translate("errors.stateless-set-ref", getDisplayName(type));
            throw new Error(msg);
            /// #else
            el.ref = null;
            /// #endif
        }

        this.component = el;
    }
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    else {
        msg = translator.translate("errors.invalid-element", getDisplayName(type) + "(...)");
        throw new Error(msg);
    }
    /// #endif

    return el;
};

ComponentThunk.prototype._render = function() {
    var component = this.component;

    var el, inst, prevOwner;

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var name, msg;
    var type = this.widget.type;
    /// #endif

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
                    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
                    name = getDisplayName(type) + ".render()";
                    msg = translator.translate("errors.invalid-element", name);
                    throw new Error(msg);
                    /// #else
                    el = null;
                    /// #endif
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

ComponentThunk.prototype.willUnmount = function() {
    var component = this.component;

    component[expando].willUnmount = true;
    if (component[expando].isMounted && component.componentWillUnmount) {
        component.componentWillUnmount();
    }

    delete component[expando];
};

ComponentThunk.prototype.destroy = function() {
    var key;
    for (key in this) {
        if (hasProp.call(this, key) && key !== "id" && key !== "key") {
            delete this[key];
        }
    }
};

Renderer = require("./Renderer");
var expando = require("./expando");

var functions = require("./functions"),
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    getDisplayName = functions.getDisplayName,
    getDisplayRender = functions.getDisplayRender,
    /// #endif
    assign = functions.assign,
    attachRef = functions.attachRef,
    clone = functions.clone,
    hasProp = functions.hasProp,
    getCanonicalKey = functions.getCanonicalKey,
    setExpandoData = functions.setExpandoData,
    uniqueId = functions.uniqueId;

var push = Array.prototype.push;

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("./messages/translator");
/// #endif

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

ComponentWidget.prototype.getInstance = function() {
    var thunk = this.thunk;

    if (thunk._type === "Stateless") {
        return null;
    }
    return thunk.component;
};

ComponentWidget.prototype.init = function(renderOptions) {
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

ComponentWidget.prototype.update = function(nextElement, domNode, nextContext, renderOptions) {
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

ComponentWidget.prototype.didMountOrUpdate = function(nextThunk, domNode, widget) {
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

ComponentWidget.prototype.componentWillDOMMount = function(domNode) {
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

ComponentWidget.prototype.componentDidMount = function() {
    var thunk = this.thunk,
        component = thunk.component,
        _type = thunk._type,
        domNode = this.node;

    if (_type !== "Stateless" && component.componentDidMount) {
        component.componentDidMount();
    }

    this.setRef(domNode);
};

ComponentWidget.prototype.componentDidUpdate = function(prevProps, prevState, prevContext) {
    var component = this.thunk.component,
        domNode = this.node;

    if (component.componentDidUpdate) {
        component.componentDidUpdate(prevProps, prevState, prevContext);
    }

    if (this.updateRef) {
        this.updateRef = false;
        this.setRef(domNode);
    }
};

ComponentWidget.prototype.setRef = function(domNode) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    var type = this.type;
    /// #endif
    var ref = this.ref,
        owner = this.owner,
        thunk = this.thunk,
        component = thunk.component,
        _type = thunk._type;

    if (ref == null) {
        return;
    }

    if (_type === "Stateless") {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        msg = [translator.translate("errors.stateless-receive-ref", getDisplayName(type))];
        if (owner) {
            msg.push(translator.translate("common.created-in", getDisplayRender(owner)));
        }
        console.error(msg.join(" "));
        /// #endif
        return;
    }

    if (domNode == null) {
        component = null;
    }

    attachRef(owner, ref, component);
};

ComponentWidget.prototype.enqueueState = function(method, state, replace, callback) {
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

ComponentWidget.prototype.processPendingState = function(component, nextProps, initial, nextContext) {
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

ComponentWidget.prototype.getContext = function(type, context) {
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

ComponentWidget.prototype.getPublicContext = function(type, context) {
    if (type.contextTypes) {
        return context;
    }
    return this.emptyPublicContext;
};

ComponentWidget.prototype.destroy = function(domNode, placeholder, renderOptions) {
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

Renderer = require("./Renderer");
ComponentThunk = require("./ComponentThunk");
createNode = require("./virtual-dom/create-node");
updateTree = require("./virtual-dom/update-tree");
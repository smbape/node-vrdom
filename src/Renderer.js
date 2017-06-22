var expando = require("./expando");

var functions = require("./functions"),
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    formatArgument = functions.formatArgument,
    getDisplayName = functions.getDisplayName,
    getDisplayRender = functions.getDisplayRender,
    /// #endif
    assign = functions.assign,
    getCanonicalKey = functions.getCanonicalKey,
    getVNodeFromMap = functions.getVNodeFromMap,
    hasProp = functions.hasProp,
    isValidContainer = functions.isValidContainer,
    setExpandoData = functions.setExpandoData,
    uniqueId = functions.uniqueId;

var callVNodeHooks = require("./hooks").callVNodeHooks;

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("./messages/translator");
/// #endif

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

Renderer.toVNode = function(el, prefix, parent, vnodeKey, context) {
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
        key = el.key, vnode, owner;

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

Renderer.findDOMNode = function(obj) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;

    if (Renderer._currentOwner && obj === Renderer._currentOwner) {
        msg = translator.translate("errors.findDOMNode-in-render", getDisplayRender(obj));
        console.error(msg);
    }

    var invalidArgumentMsg = translator.translate("errors.findDOMNode-invalid-argument");
    /// #endif

    if (obj == null) {
        return null;
    }

    if ("object" !== typeof obj || Array.isArray(obj)) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        msg = invalidArgumentMsg;
        throw new Error(msg);
        /// #else
        return null;
        /// #endif
    }

    if (obj.nodeType === 1) {
        return obj;
    }

    if (!hasProp.call(obj, expando)) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if ("function" === typeof obj.render) {
            msg = translator.translate("errors.findDOMNode-on-unmounted");
        } else {
            msg = invalidArgumentMsg + (" (keys: " + Object.keys(obj) + ")");
        }
        throw new Error(msg);
        /// #endif
        return null;
    }

    var data = obj[expando],
        removed = data.removed,
        vnode = data.vnode;

    return vnode && !removed && vnode.node || null;
};

Renderer.findVNodeAtNode = function(node) {
    if (!hasProp.call(node, expando)) {
        return null;
    }

    var inst = node[expando];
    if (!hasProp.call(inst, "vrdomID")) {
        return null;
    }

    return getVNodeFromMap(inst.vrdomID, nodeMap);
};

Renderer.unmountComponentAtNode = function(container) {
    if (!isValidContainer(container)) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        var msg = translator.translate("errors.invalid-container", "vrdom.unmountComponentAtNode()");
        throw new Error(msg);
        /// #else
        return; // eslint-disable-line no-useless-return
        /// #endif
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
        document: container.ownerDocument
    });
    updateTree(rootVNode, null, renderOptions);

    // eslint-disable-next-line guard-for-in
    for (var prop in inst) {
        delete inst[prop];
    }

    delete container[expando];
};

Renderer.render = function(element, container, callback) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    if (!functions.isValidElement(element)) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
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
        /// #endif
        return; // eslint-disable-line no-useless-return
    }

    if (!isValidContainer(container)) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        msg = translator.translate("errors.invalid-container", "vrdom.render()");
        throw new Error(msg);
        /// #else
        return; // eslint-disable-line no-useless-return
        /// #endif
    }

    if (Renderer._currentOwner) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        msg = "Warning: " + translator.translate("errors.render-while-rendering") + " " + translator.translate("common.check-render-of", getDisplayName(Renderer._currentOwner));
        console.error(msg);
        /// #endif
        return;
    }

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    if ("body" === container.nodeName.toLowerCase()) {
        msg = translator.translate("errors.render-in-body");
        console.error(msg);
    }
    /// #endif

    var update, vnode, inst;

    if (hasProp.call(container, expando) && hasProp.call(container[expando], "rootVNode")) {
        inst = container[expando];
        var rootVNode = inst.rootVNode;

        if (rootVNode.willUnmount || !hasProp.call(nodeMap, rootVNode.key)) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            msg = translator.translate("errors.mount-while-unmounting");
            throw new Error(msg);
            /// #else
            return; // eslint-disable-line no-useless-return
            /// #endif
        }

        update = true;
        vnode = rootVNode;
    }

    var renderedCheckpoint = Renderer._rendered.length;
    var performAfterUpdates = Renderer._performAfterUpdates;
    var topComponent;
    var renderOptions = assign({}, Renderer.renderOptions, {
        document: container.ownerDocument
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
                /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
                msg = translator.translate("errors.null-type", "vrdom.render(...)", element && element.type);
                throw new Error(msg);
                /// #else
                return; // eslint-disable-line no-useless-return
                /// #endif
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

Renderer.updateState = function(method, component, state, replace, callback) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;

    if (Renderer._currentOwner === component) {
        msg = "Warning: " + translator.translate("errors.updating-during-render", getDisplayName(component), method + "(...)", getDisplayRender(component));
        console.error(msg);
    }
    /// #endif

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
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (!msg) {
            msg = "Warning: " + translator.translate("errors.updating-unmounted", getDisplayName(component), method + "(...)");
            console.error(msg);
        }
        /// #endif
        return;
    }

    var renderedCheckpoint = Renderer._rendered.length;
    var performAfterUpdates = Renderer._performAfterUpdates;

    if (performAfterUpdates) {
        Renderer._performAfterUpdates = false;
    }

    vnode.enqueueState(method, state, replace);
    var renderOptions = assign({}, Renderer.renderOptions, {
        document: vnode.node.ownerDocument
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

Renderer.processEventHandler = function() {
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
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        else {
            var msg = translator.translate("errors.invalid-callback", formatArgument(callback));
            throw new Error(msg);
        }
        /// #endif
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

createNode = require("./virtual-dom/create-node");
updateTree = require("./virtual-dom/update-tree");
h = require("./virtual-dom/h");
ComponentWidget = require("./ComponentWidget");
controls = require("./controls");
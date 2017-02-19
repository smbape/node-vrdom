module.exports = updateTree;

var expando = require("../expando");

var VirtualText = require("./VirtualText");

var setProperties = require("./set-properties");
var createNode = require("./create-node");

var functions = require("../functions");
var flattenChildren = functions.flattenChildren;
var getKeyAndPrefixFromCanonicalKey = functions.getKeyAndPrefixFromCanonicalKey;
var hasProp = functions.hasProp;
var isObject = functions.isObject;
var updateNodeMap = functions.updateNodeMap;

var Renderer = require("../Renderer");

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

    if (a.type !== b.type) {
        var placeholder = new VirtualText("");
        placeholder.key = a.key;
        placeholder.prefix = a.prefix;
        placeholder.originalKey = a.originalKey;
        placeholder.context = a.context;
        placeholder.childContext = a.childContext;

        a = destroyChildren(a, placeholder, renderOptions);
    }

    if (b.isVText) {
        if (a.text !== b.text) {
            updateVText(a, b, renderOptions);
            return b;
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

    a.update(b);

    return a;
}

function destroyChildren(vnode, placeholder, renderOptions) {
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
        removeRemainingNodes(a, childrenLen, renderOptions);
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
        prevNode = prevVNode.destroy(prevNode, placeholder);
    }

    if (prevNode.parentNode) {
        if (placeholder) {
            nextNode = createNode(placeholder, renderOptions);
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

    var nextNode = createNode(nextVNode, renderOptions);

    var referenceNode = referenceVNodeIndex == null || referenceVNodeIndex >= parentNode.childNodes.length ? null : parentNode.childNodes[referenceVNodeIndex];
    parentNode.insertBefore(nextNode, referenceNode);
    updateNodeMap(null, nextVNode, nextNode, renderOptions.nodeMap);
}

function updateVText(prevVNode, nextVText, renderOptions) {
    var prevNode = prevVNode.node;
    var nextNode;

    prevNode.replaceData(0, prevNode.length, nextVText.text);
    nextNode = prevNode;
    updateNodeMap(prevVNode, nextVText, nextNode, renderOptions.nodeMap);
}

function updateWidget(prevVNode, nextElement, renderOptions, context) {
    var prevNode = prevVNode.node;
    var nextWidget, nextNode;

    if (prevVNode.isWidget) {
        // same widget type, do a widget.update
        nextNode = prevVNode.update(nextElement, prevNode, context);
    } else {
        nextWidget = Renderer.toVNode(nextElement, prevVNode.prefix, prevVNode.parent, prevVNode.originalKey, context);
        nextNode = createNode(nextWidget, renderOptions);
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
    var nextNode = createNode(nextVNode, renderOptions);

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

function removeRemainingNodes(vnode, from) {
    var domNode = vnode.node;
    var childNodes = domNode.childNodes;

    for (var i = childNodes.length - 1; i >= from; i--) {
        domNode.removeChild(childNodes[i]);
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
module.exports = createNode;

var globalDocument = require("global/document");

var setProperties = require("./set-properties");

var functions = require("../functions");
var getKeyAndPrefixFromCanonicalKey = functions.getKeyAndPrefixFromCanonicalKey;
var isObject = functions.isObject;
var setExpandoData = functions.setExpandoData;
var updateNodeMap = functions.updateNodeMap;

var Renderer = require("../Renderer");

var Namespaces = require("../w3c/Namespaces");
var HTMLnamespace = Namespaces.HTMLnamespace;

function createNode(vnode, opts) {
    var domNode;

    if (vnode == null) {
        return null;
    }

    var doc = opts.document ? opts.document : globalDocument;
    var nodeMap = opts ? opts.nodeMap : null;

    if (vnode.isWidget) {
        domNode = vnode.init(opts);
    } else if (vnode.isVText) {
        domNode = doc.createTextNode(vnode.text);
        Renderer._rendered.push([vnode, "componentDidMount", []]);
    } else if (vnode.isVNode) {
        var namespace = vnode.namespace;
        var tagName = vnode.tagName;

        domNode = namespace !== HTMLnamespace ?
            doc.createElementNS(namespace, tagName) :
            vnode.is != null ?
                doc.createElement(tagName, vnode.is) :
                doc.createElement(tagName);

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
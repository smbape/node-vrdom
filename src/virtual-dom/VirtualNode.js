var functions = require("../functions");
var attachRef = functions.attachRef;
var clone = functions.clone;
var hasProp = functions.hasProp;
var getCanonicalKey = functions.getCanonicalKey;
var uniqueId = functions.uniqueId;

module.exports = VirtualNode;

var Namespaces = require("../w3c/Namespaces");
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

VirtualNode.prototype.update = function(element) {
    this.element = element;
    // this.props = element.props; // incremental update in setProperties
    if (this.ref !== this.element.ref) {
        this.ref = this.element.ref;
        this.updateRef = true;
    }
};

VirtualNode.prototype.componentDidMount = function() {
    this.setRef(this.node);
};

VirtualNode.prototype.componentDidUpdate = function(/* previous */) {
    this.setRef(this.node);
};

VirtualNode.prototype.setRef = function(domNode) {
    if (domNode == null || this.updateRef) {
        this.updateRef = false;
        attachRef(this.owner, this.ref, domNode);
    }
};

VirtualNode.prototype.destroy = function(domNode /* , placeholder */ ) {
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

VirtualNode.prototype.getInstance = function() {
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
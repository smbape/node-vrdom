module.exports = h;

var functions = require("../functions");
var flattenChildren = functions.flattenChildren;
var flattenChildrenToString = functions.flattenChildrenToString;

var VirtualNode = require("./VirtualNode");

var xml = require("../w3c/xml");
var XMLNameReg = xml.XMLNameReg;

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
/// #endif

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
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg = translator.translate("errors.invalid-tag", type);
    throw new Error(msg);
    /// #else
    return false;
    /// #endif

}
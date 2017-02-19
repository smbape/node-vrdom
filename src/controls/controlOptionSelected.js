var expando = require("../expando"),
    hasProp = require("../functions").hasProp;

var Renderer;

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
/// #endif

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

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    if (props.selected != null) {
        var msg = "Warning: " + translator.translate("errors.option-selected");
        console.error(msg);
    }
    /// #endif

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

Renderer = require("../Renderer");
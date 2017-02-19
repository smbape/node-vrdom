var voidElements = require("void-elements");

var functions = require("../functions"),
    hasProp = functions.hasProp;

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var getDisplayName = functions.getDisplayName,
    isObject = functions.isObject,
    hasEditableValue = functions.hasEditableValue;

var translator = require("../messages/translator");
var validators = {
    input: validateCheckedOrValueProp,
    textarea: validateCheckedOrValueProp
};
/// #endif

module.exports = validateProperties;

function countChildren(children) {
    if (Array.isArray(children)) {
        return children.length;
    }

    if (children != null) {
        return 1;
    }

    return 0;
}

function validateProperties(type, props, children, owner) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg, ownerName, value;
    if (owner) {
        ownerName = getDisplayName(owner);
    }
    /// #endif

    var hasChildren = countChildren(children) !== 0;

    if (hasProp.call(voidElements, type)) {
        if (hasChildren || props.dangerouslySetInnerHTML) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            msg = [translator.translate("errors.void-with-children", type)];
            if (ownerName) {
                msg.push(translator.translate("common.check-render-of", ownerName));
            }
            throw new Error(msg.join(" "));
            /// #else
            delete props.children;
            delete props.dangerouslySetInnerHTML;
        /// #endif
        }
    }

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    if (hasChildren && props.dangerouslySetInnerHTML != null) {
        throw new Error(translator.translate("errors.children-and-dangerouslySetInnerHTML"));
    }

    if (!props.suppressContentEditableWarning && props.contentEditable && hasChildren) {
        msg = "Warning: " + translator.translate("errors.editable-with-children", type);
        console.error(msg);
    }

    if (props.style != null && "object" !== typeof props.style || Array.isArray(props.style)) {
        msg = [translator.translate("errors.invalid-style")];
        if (ownerName) {
            msg.push(translator.translate("common.render-by", ownerName));
        }
        throw new Error(msg.join(" "));
    }

    if (hasProp.call(props, "innerHTML")) {
        msg = translator.translate("errors.props-innerHTML");
        console.error(msg);
    }

    if (props.dangerouslySetInnerHTML != null) {
        value = props.dangerouslySetInnerHTML;
        if (!isObject(value) || !hasProp.call(value, "__html")) {
            msg = translator.translate("errors.invalid-dangerouslySetInnerHTML");
            throw new Error(msg);
        }
    }

    if (hasProp.call(validators, type)) {
        validators[type](type, props);
    }
/// #endif
}

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
function validateCheckedOrValueProp(type, props) {
    var ref;
    if (type === "input" && ((ref = props.type) === "checkbox" || ref === "radio")) {
        validateCheckedProp(type, props);
    } else if (hasEditableValue(type, props)) {
        validateValueProp(type, props);
    }
}

function validateCheckedProp(type, props) {
    if (!props.checked || props.readOnly || props.onChange || props.disabled) {
        return;
    }

    var msg = translator.translate("errors.checked-without-control", type);
    console.error(msg);
}

function validateValueProp(type, props) {
    if (props.value == null || props.readOnly || props.onChange || props.disabled) {
        return;
    }

    var msg = translator.translate("errors.value-without-control", type);
    console.error(msg);
}
/// #endif
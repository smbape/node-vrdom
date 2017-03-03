var expando = require("../expando"),
    clone = require("../functions").clone,
    hasProp = require("../functions").hasProp,
    LinkUtils = require("./LinkUtils");

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator"),
    shouldWarnInputValueNull = true,
    shouldWarnInputValueDefault = true,
    shouldWarndUncontrolledToControlled = true,
    shouldWarndControlledToUncontrolled = true;

var destroyers = require("../destroyers");
destroyers.reset.push(function() {
    shouldWarnInputValueNull = true;
    shouldWarnInputValueDefault = true;
    shouldWarndUncontrolledToControlled = true;
    shouldWarndControlledToUncontrolled = true;
});
/// #endif

var Renderer;

module.exports = function controlInputValue(evt) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    var target = evt.target,
        preventDefault = evt.preventDefault,
        vnode = Renderer.findVNodeAtNode(target);

    if (vnode == null) {
        return;
    }

    if (preventDefault) {
        Renderer._afterUpdates[vnode.key] = true;
        return LinkUtils.onValueChange(evt, vnode.props); // eslint-disable-line consistent-return
    }

    var inst = target[expando],
        isNew = !hasProp.call(inst, "skipDefault"),
        props = vnode.props,
        value = LinkUtils.getValue(props),
        defaultValue = vnode.props.defaultValue,
        shouldControl = isNew || hasProp.call(vnode.props, "value") || hasProp.call(vnode.props, "valueLink");

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var prevProps = isNew ? null : inst.props;
    var description, lname, typeName;

    switch (target.tagName) { // eslint-disable-line default-case
        case "INPUT":
            description = "<input" + (props.type ? " type=\"" + props.type + "\"" : "") + " />";
            typeName = "Input";
            lname = "input element";
            break;
        case "TEXTAREA":
            description = "<textarea>";
            typeName = "Textarea";
            lname = "textarea";
            break;
    }
    /// #endif

    if (value === null) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (shouldWarnInputValueNull) {
            msg = translator.translate("errors.input.value-null", description, "value");
            shouldWarnInputValueNull = false;
        }
    /// #endif
    } else if (value !== undefined) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (!prevProps && shouldWarnInputValueDefault && defaultValue != null) {
            msg = translator.translate("errors.input.both-default", description, typeName, lname, "value", "defaultValue");
            shouldWarnInputValueDefault = false;
        }
        /// #endif

        if (isNew || shouldControl && String(target.value) !== String(value)) {
            target.value = value;
            target.defaultValue = defaultValue == null ? value : defaultValue;
        }
    } else if (shouldControl && defaultValue != null && !inst.skipDefault) {
        if (isNew || String(target.value) !== String(defaultValue)) {
            target.value = defaultValue;
        }
    }

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    if (prevProps) {
        if (prevProps.value != null && props.value == null) {
            if (shouldWarndUncontrolledToControlled) {
                shouldWarndUncontrolledToControlled = false;
                msg = translator.translate("errors.input.controlled-to-uncontrolled", description, typeName, lname);
            }
        } else if (prevProps.value == null && props.value != null) {
            if (shouldWarndControlledToUncontrolled) {
                shouldWarndControlledToUncontrolled = false;
                msg = translator.translate("errors.input.uncontrolled-to-controlled", description, typeName, lname);
            }
        }
    }

    if (msg) {
        console.error(msg);
    }
    /// #endif

    inst.props = clone(props);
    inst.skipDefault = true;
};

Renderer = require("../Renderer");
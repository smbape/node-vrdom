var expando = require("../expando"),
    functions = require("../functions"),
    clone = functions.clone,
    hasProp = functions.hasProp,
    LinkUtils = require("./LinkUtils");

var Renderer;

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator"),
    shouldWarnInputCheckedNull = true,
    shouldWarnInputCheckedDefault = true,
    shouldWarndUncontrolledToControlled = true,
    shouldWarndControlledToUncontrolled = true;

var destroyers = require("../destroyers");
destroyers.reset.push(function() {
    shouldWarnInputCheckedNull = true;
    shouldWarnInputCheckedDefault = true;
    shouldWarndUncontrolledToControlled = true;
    shouldWarndControlledToUncontrolled = true;
});
/// #endif

module.exports = function controlInputChecked(evt) {
    /* eslint-disable consistent-return */
    var target = evt.target,
        preventDefault = evt.preventDefault,
        vnode = Renderer.findVNodeAtNode(target);

    if (vnode == null) {
        // not created by us this instance of vrdom
        return;
    }

    if (preventDefault) {
        Renderer._afterUpdates[vnode.key] = true;
        return LinkUtils.onCheckedChange(evt, vnode.props);
    }

    var inst = target[expando],
        isNew = !hasProp.call(inst, "skipDefault"),
        type = vnode.props.type,
        name = target.name,
        form = target.form,
        originalTarget = target;

    var parentNode, targets;

    if (!isNew && type === "radio" && name) {
        parentNode = originalTarget.parentNode;
        if (parentNode) {
            while (parentNode.parentNode) {
                parentNode = parentNode.parentNode;
            }
            targets = parentNode.querySelectorAll("input[type=radio][name=" + JSON.stringify(name) + "]");
        } else {
            // some code messes up with vrdom behaviour
            targets = [originalTarget];
        }
    } else {
        targets = [originalTarget];
    }

    for (var i = 0, len = targets.length; i < len; i++) {
        target = targets[i];

        if (target === originalTarget) {
            _controlInputChecked(evt);
        } else if (form === target.form) {
            if (hasProp.call(target, expando)) {
                // only update inputs created by this instance of vrdom
                _controlInputChecked({
                    target: target
                });
            }
        }
    }
/* eslint-enable consistent-return */
};

function _controlInputChecked(evt) {
    var target = evt.target,
        vnode = Renderer.findVNodeAtNode(target);

    if (vnode == null) {
        return;
    }

    var inst = target[expando],
        isNew = !hasProp.call(inst, "skipDefault"),
        props = vnode.props,
        checked = LinkUtils.getChecked(props),
        defaultChecked = props.defaultChecked;

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    var prevProps = isNew ? null : inst.props;
    /// #endif

    if (checked === null) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (shouldWarnInputCheckedNull) {
            msg = translator.translate("errors.input.checked-null", "<input type=\"" + props.type + "\" />", "checked");
            shouldWarnInputCheckedNull = false;
        }
    /// #endif
    } else if (checked !== undefined) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (!prevProps && !msg && shouldWarnInputCheckedDefault && defaultChecked) {
            msg = translator.translate("errors.input.both-default", "<input type=\"" + props.type + "\" />", "Input", "input element", "checked", "defaultChecked");
            shouldWarnInputCheckedDefault = false;
        }
        /// #endif

        if (isNew || target.checked !== checked) {
            // according to w3c HTML spec,
            // defaultChecked must reflect checked
            // https://www.w3.org/TR/html/sec-forms.html#sec-forms
            target.checked = checked;
            target.defaultChecked = defaultChecked || checked;
        }
    } else if (defaultChecked && !inst.skipDefault) {
        if (isNew || target.checked !== defaultChecked) {
            target.checked = defaultChecked;
        }
    }

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    if (prevProps) {
        if (prevProps.checked != null && props.checked == null) {
            if (shouldWarndUncontrolledToControlled) {
                shouldWarndUncontrolledToControlled = false;
                msg = translator.translate("errors.input.controlled-to-uncontrolled", "<input type=\"" + props.type + "\" />", "Input", "input element");
            }
        } else if (prevProps.checked == null && props.checked != null) {
            if (shouldWarndControlledToUncontrolled) {
                shouldWarndControlledToUncontrolled = false;
                msg = translator.translate("errors.input.uncontrolled-to-controlled", "<input type=\"" + props.type + "\" />", "Input", "input element");
            }
        }
    }

    if (msg) {
        console.error(msg);
    }
    /// #endif

    inst.props = clone(props);
    inst.skipDefault = true;
}

Renderer = require("../Renderer");
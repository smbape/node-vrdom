var hasProp = Object.prototype.hasOwnProperty;

var expando = require("../expando");
var clone = require("../functions").clone;
var LinkUtils = require("./LinkUtils");

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
var shouldWarnSelectValueNull = true,
    shouldWarnSelectValueDefault = true,
    shouldWarndUncontrolledToControlled = true,
    shouldWarndControlledToUncontrolled = true;

var destroyers = require("../destroyers");
destroyers.reset.push(function() {
    shouldWarnSelectValueNull = true;
    shouldWarnSelectValueDefault = true;
    shouldWarndUncontrolledToControlled = true;
    shouldWarndControlledToUncontrolled = true;
});
/// #endif

var Renderer;

module.exports = function controlSelectValue(evt) {
    var target = evt.target,
        preventDefault = evt.preventDefault;

    var vnode = Renderer.findVNodeAtNode(target);

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
        prevProps = isNew ? null : inst.props;

    inst.props = clone(props);

    var value = LinkUtils.getValue(props),
        defaultValue = props.defaultValue,
        multiple = props.multiple;

    if (prevProps) {
        inst.skipDefault = prevProps.multiple === multiple;
    }

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;

    if (value === null) {
        if (shouldWarnSelectValueNull) {
            shouldWarnSelectValueNull = false;
            msg = translator.translate("errors.input.value-null", "<select>", "value");
        }
    } else if (value != null && defaultValue != null) {
        if (shouldWarnSelectValueDefault) {
            shouldWarnSelectValueDefault = false;
            msg = translator.translate("errors.input.both-default", "<select>", "Select", "select element", "value", "defaultValue");
        }
    }

    if (prevProps) {
        if (prevProps.value != null && value == null) {
            if (shouldWarndUncontrolledToControlled) {
                shouldWarndUncontrolledToControlled = false;
                msg = translator.translate("errors.input.controlled-to-uncontrolled", "<select>", "Select", "select element");
            }
        } else if (prevProps.value == null && value != null) {
            if (shouldWarndControlledToUncontrolled) {
                shouldWarndControlledToUncontrolled = false;
                msg = translator.translate("errors.input.uncontrolled-to-controlled", "<select>", "Select", "select element");
            }
        }
    }

    if (msg) {
        console.error(msg);
    }
    /// #endif

    if (isNew) {
        inst.skipDefault = true;
    }

    var options = target.options;
    if (!options) {
        return;
    }

    if (value == null && !inst.skipDefault) {
        value = defaultValue;
    }

    if (value == null) {
        if (!multiple && defaultValue != null) {
            target.defaultValue = String(defaultValue);
        }
        return;
    }

    var option, selected;
    if (multiple) {
        if (Array.isArray(value)) {
            var selectedValues = {};

            for (var i = 0, len = value.length; i < len; i++) {
                selectedValues[String(value[i])] = true;
            }

            for (var j = 0, len1 = options.length; j < len1; j++) {
                option = options[j];
                selected = hasProp.call(selectedValues, String(option.value));
                if (option.selected !== selected) {
                    option.selected = selected;
                }
            }
        }
    } else {
        var selectedValue = String(value);

        for (var k = 0, len2 = options.length; k < len2; k++) {
            option = options[k];
            selected = selectedValue === String(option.value);
            if (option.selected !== selected) {
                option.selected = selected;
            }
        }

        if (defaultValue != null) {
            target.defaultValue = String(defaultValue);
        }
    }

    inst.skipDefault = true;
};

Renderer = require("../Renderer");
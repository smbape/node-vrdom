/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");

function assertValidCheckedLink(props) {
    var msg;

    if (props.valueLink != null) {
        msg = translator.translate("errors.checkedLink-and-valueLink");
        throw new Error(msg);
    }

    if (props.checked != null || props.onChange != null) {
        msg = translator.translate("errors.checkedLink-and-value-or-onChange");
        throw new Error(msg);
    }
}

function assertValidValueLink(props) {
    var msg;

    if (props.checkedLink != null) {
        msg = translator.translate("errors.checkedLink-and-valueLink");
        throw new Error(msg);
    }

    if (props.value != null || props.onChange != null) {
        msg = translator.translate("errors.valueLink-and-value-or-onChange");
        throw new Error(msg);
    }
}
/// #endif

module.exports = {
    getChecked: function(props) {
        if (props.checkedLink != null) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            assertValidCheckedLink(props);
            /// #endif
            return props.checkedLink.value;
        }
        return props.checked;
    },

    onCheckedChange: function(evt, props) { // eslint-disable-line consistent-return
        if (props.checkedLink != null) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            assertValidCheckedLink(props);
            /// #endif
            return props.checkedLink.requestChange(evt.target.checked);
        }
    },

    getValue: function(props) {
        if (props.valueLink != null) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            assertValidValueLink(props);
            /// #endif
            return props.valueLink.value;
        }
        return props.value;
    },

    onValueChange: function(evt, props) { // eslint-disable-line consistent-return
        if (props.valueLink != null) {
            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            assertValidValueLink(props);
            /// #endif
            return props.valueLink.requestChange(evt.target.value);
        }
    }
};
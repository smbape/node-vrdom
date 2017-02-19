/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
var hasProp = require("./hasProp");
/// #endif

var normalizeCssProp = require("./normalizeCssProp");

module.exports = function normalizeCssProps(style, type, insensitive) {

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    if (style === null || "object" !== typeof style) {
        return null;
    }

    var normalized = {},
        keys = {};

    var cssProp;

    // eslint-disable-next-line guard-for-in
    for (var key in style) {
        cssProp = normalizeCssProp(key, insensitive);

        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if (hasProp.call(keys, cssProp)) {
            msg = "Warning: " + translator.translate("errors.duplicate-style", key, keys[cssProp], type);
            console.error(msg);
        }
        /// #endif

        keys[cssProp] = key;
        normalized[cssProp] = style[key];
    }

    return normalized;
};

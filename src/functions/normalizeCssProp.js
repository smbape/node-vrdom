var hasProp = require("./hasProp");
var CSSProperties = require("../mdn/CSSProperties");
var CSSAttributes = (function() {
    var CSSAttributes = {};

    // eslint-disable-next-line guard-for-in
    for (var cssProp in CSSProperties) {
        CSSAttributes[CSSProperties[cssProp]] = cssProp;
    }

    return CSSAttributes;
}());

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
/// #endif

module.exports = function normalizeCssProp(cssProp, insensitive) {
    var normalized;
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    if (hasProp.call(CSSAttributes, cssProp)) {
        return cssProp;
    }

    if (hasProp.call(CSSProperties, cssProp)) {
        normalized = CSSProperties[cssProp];

        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        msg = "Warning: " + translator.translate("errors.unkown-attribute", cssProp, normalized, "style");
        console.error(msg);
        /// #endif
        return normalized;
    }

    if (insensitive) {
        var lcssProp = cssProp.toLowerCase();

        if (hasProp.call(CSSProperties, lcssProp)) {
            normalized = CSSProperties[lcssProp];

            /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
            msg = "Warning: " + translator.translate("errors.unkown-attribute", cssProp, normalized, "style");
            console.error(msg);
            /// #endif
            return normalized;
        }
    }

    normalized = cssProp.replace(/^-(?:Webkit|Moz|O|ms)-/i, "").replace(/-\w/g, hyphenUpperCase);
    return normalized;
};

function hyphenUpperCase(match) {
    return match[1].toUpperCase();
}
var flattenChildren = require("./flattenChildren");

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
var shouldWarnOptionChildren = true;

var destroyers = require("../destroyers");
destroyers.reset.push(function() {
    shouldWarnOptionChildren = true;
});
/// #endif

module.exports = function flattenChildrenToString(children) {
    if (children == null) {
        return null;
    }

    var options = {
        prefix: "RootID",
        ignoreError: true,
        checkDuplicate: false,
        warnKey: false
    };

    var text = [];
    flattenChildren(children, {}, "undefined", options, null, function(child) {
        var type = typeof child;
        if (type === "string" || type === "number") {
            text.push(child);
        }
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        else if (shouldWarnOptionChildren && child != null) {
            shouldWarnOptionChildren = false;
            var msg = "Warning: " + translator.translate("errors.unexpected-option-child");
            console.error(msg);
        }
        /// #endif
    });

    return text.join("");
};
/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
/// #endif

module.exports = function attachRef(owner, ref, instance, status) {
    if (ref == null) {
        return;
    }

    if (instance == null) {
        instance = null;
    }

    if ("function" === typeof ref) {
        ref.call(owner, instance, status);
        return;
    }

    if (!owner) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        var msg = translator.translate("errors.ref-without-owner");
        throw new Error(msg);
        /// #else
        return; // eslint-disable-line no-useless-return
        /// #endif
    }

    ref = String(ref);

    if (instance === null) {
        delete owner.refs[ref];
    } else {
        owner.refs[ref] = instance;
    }
};
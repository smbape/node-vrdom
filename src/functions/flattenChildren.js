var hasProp = Object.prototype.hasOwnProperty;

var getCanonicalKey = require("./getCanonicalKey");
var getIteratorMethod = require("./getIteratorMethod");
var isValidElement = require("./isValidElement");
var VirtualText = require("../virtual-dom/VirtualText");

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var expando = require("../expando");
var translator = require("../messages/translator");
var formatArgument = require("./formatArgument");
var getDisplayName = require("./getDisplayName");
var getDisplayRender = require("./getDisplayRender");
var setExpandoData = require("./setExpandoData");
var destroyers = require("../destroyers");

var shouldWarnAboutMaps = true;
var warnedKeyErrors = {};

destroyers.reset.push(function() {
    shouldWarnAboutMaps = true;
    warnedKeyErrors = {};
});

var WARN_KEY_STATUS = {
    code: 0
};
/// #endif

module.exports = flattenChildren;

var OK_STATUS = 1;

function flattenChildren(c, childNodes, tagName, options, owner, callback) {
    var iterator, entry, step;

    var prefix = options.prefix;
    var ignoreError = options.ignoreError;
    var hasCallback = "function" === typeof callback;

    var status = OK_STATUS;
    var isCollection = false;
    var iteratorMethod, defaultKey, type, key, canonicalKey, ichildren, nextStatus;

    var children = [c, prefix, null];

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    var checkDuplicate = options.checkDuplicate;
    var warnKey = options.warnKey;
    var skip = false;
    /// #else
    ignoreError = true;
    /// #endif

    var len = children.length;
    var length = 0;
    var originalChild;

    while (0 !== len) {

        key = children[--len];
        prefix = children[--len];
        c = originalChild = children[--len];

        children.length = len;

        type = typeof c;

        if (c == null || type === "boolean") {
            length++;
            if (hasCallback) {
                callback(originalChild, defaultKey);
            }
            continue;
        }

        defaultKey = key == null ? length : key;

        if (Array.isArray(c)) {
            isCollection = true;
            prefix = getCanonicalKey(defaultKey, prefix) + ">";
            for (var i = c.length - 1; i !== -1; i--) {
                children.push(c[i], prefix, null);
            }
            len = children.length;
            continue;
        }

        iteratorMethod = getIteratorMethod(c);

        if (iteratorMethod) {
            prefix = getCanonicalKey(defaultKey, prefix) + ">";
            iterator = iteratorMethod.call(c);
            ichildren = [];

            // http://exploringjs.com/es6/ch_maps-sets.html
            if (iteratorMethod === c.entries) {
                /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
                if (shouldWarnAboutMaps) {
                    msg = translator.translate("errors.map-as-children");
                    console.error(msg);
                    shouldWarnAboutMaps = false;
                }
                /// #endif

                while (!(step = iterator.next()).done) {
                    entry = step.value;
                    ichildren.push(String(entry[0]), prefix, entry[1]);
                }
            } else {
                while (!(step = iterator.next()).done) {
                    ichildren.push(null, prefix, step.value);
                }
            }

            isCollection = true;
            ichildren.reverse();
            children.push.apply(children, ichildren);
            len = children.length;
            continue;
        }


        if (!isCollection) {
            // treat single child as first element of collection
            // therefore allowing to have the same if another child is added
            prefix = getCanonicalKey(defaultKey, prefix) + ">";
        }

        if (type === "string" || type === "number" || tagName === "textarea" && (type === "string" || type === "number" || type === "boolean" || type === "object")) {
            canonicalKey = getCanonicalKey(defaultKey, prefix);
            c = new VirtualText(String(c));
            c.key = canonicalKey;
            c.prefix = prefix;
            c.originalKey = defaultKey;
        } else if (isValidElement(c)) {
            canonicalKey = getCanonicalKey(key != null ? key : c.key != null ? c.key : defaultKey, prefix);
        } else if (ignoreError) {
            length++;
            if (hasCallback) {
                callback(originalChild, defaultKey);
            }
            continue;
        }

        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        else {
            msg = [translator.translate("errors.child-invalid-element", formatArgument(c))];
            if (owner) {
                msg.push(translator.translate("common.created-in", getDisplayRender(owner)));
            }
            throw new Error(msg.join(" "));
        }
        /// #endif

        nextStatus = status;

        if (!hasProp.call(childNodes, canonicalKey)) {
            length++;
            childNodes[canonicalKey] = c;
            if (hasCallback) {
                callback(originalChild, defaultKey);
            }
        }

        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        else {
            if (checkDuplicate) {
                skip = true;
                nextStatus = {
                    code: 2,
                    key: "originalKey" in c ? c.originalKey : c.key
                };
            }
        }

        if (skip) {
            skip = false;
        } else if (isCollection && warnKey) {
            if (canonicalKey.lastIndexOf(".") >= canonicalKey.lastIndexOf("#")) {
                nextStatus = WARN_KEY_STATUS;
            }
        }

        if (nextStatus !== status && status === OK_STATUS) {
            status = nextStatus;
            warnChildKey(status, c, tagName, options, owner);
        }
        /// #endif

    }

    return childNodes;
}

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
function warnChildKey(status, child, name, options, owner) {
    var id, warn, ref;

    var code = status.code;

    var msg = ["Warning:"];

    var childOwner = (ref = child._owner) != null ? ref._instance : undefined;

    if (code === 2) {
        msg.push(translator.translate("errors.duplicate-key-prop", "flattenChildren(...)", status.key));
    } else {
        msg.push([translator.translate("errors.unique-key-prop")]);
    }

    if (owner) {
        name = getDisplayName(owner);

        id = translator.translate(childOwner && childOwner === owner ? "common.created-in" : "common.used-in", getDisplayRender(owner));
        setExpandoData(owner, {});

        if (!(id in owner[expando])) {
            owner[expando][id] = true;
            if (name) {
                msg.push(id);
            }
            warn = true;
        }
    } else {
        if ("function" === typeof name) {
            name = getDisplayName(name);
        } else {
            name = "<" + name.toLowerCase() + ">";
        }

        id = translator.translate("common.check-top-render-of", name);

        if (!hasProp.call(warnedKeyErrors, id)) {
            warnedKeyErrors[id] = true;
            if (name) {
                msg.push(id);
            }
            warn = true;
        }
    }

    if (warn) {
        if (childOwner && childOwner !== owner) {
            msg.push(translator.translate("common.created-in", getDisplayRender(childOwner)));
        }

        console.error(msg.join(" "));
    }
}
/// #endif

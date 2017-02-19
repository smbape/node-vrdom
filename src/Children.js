var functions = require("./functions");
var flattenChildren = functions.flattenChildren;

exports.map = map;
exports.forEach = forEach;
exports.count = count;
exports.only = only;
exports.toArray = toArray;

function map(children, fn, ctx) {
    if (children == null) {
        return children;
    }

    var res = [];

    if (ctx === undefined) {
        ctx = children;
    }

    toChildNodes(children, function() {
        res.push(fn.apply(ctx, arguments));
    });

    return res;
}

function forEach(children, fn, ctx) {
    if (children == null) {
        return;
    }

    if (ctx === undefined) {
        ctx = children;
    }

    toChildNodes(children, fn.bind(ctx));
}

function count(children) {
    if (children == null) {
        return 0;
    }

    var calls = 0;
    toChildNodes(children, function() {
        ++calls;
    });

    return calls;
}

function only(children) {
    if (!functions.isValidElement(children)) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        throw new Error("Invalid only child");
        /// #else
        console.error("Invalid only child");
        return null; // eslint-disable-line node-useless-return
        /// #endif
    }

    return children;
}

function toArray(children) {
    return map(children, identity);
}

function identity(child) {
    return child;
}

function toChildNodes(children, callback) {
    var options = {
        prefix: "RootID",
        ignoreError: false,
        checkDuplicate: false,
        warnKey: false
    };

    return flattenChildren(children, {}, "undefined", options, null, callback);
}
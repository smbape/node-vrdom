var getFunctionName = require("./getFunctionName");

module.exports = function formatArgument(arg) {
    var ref;

    var typeofarg = typeof arg;
    if (typeofarg !== "object" || Array.isArray(arg)) {
        return JSON.stringify(arg);
    }

    var displayName = ((ref = arg.constructor) != null ? getFunctionName(ref) : undefined) || typeofarg;
    var keys = Object.keys(arg);

    if (keys.length !== 0) {
        return displayName + " (keys: " + keys.join(", ") + ")";
    }

    return displayName === "object" || displayName === "Object" ? JSON.stringify(arg) : displayName;
};
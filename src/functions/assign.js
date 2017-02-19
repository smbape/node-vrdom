var hasProp = require("./hasProp");

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
module.exports = typeof Object.assign === "function" ? Object.assign /* istanbul ignore next */ : function(target) {
    "use strict";
    if (target == null) { // TypeError if undefined or null
        throw new TypeError("Cannot convert undefined or null to object");
    }

    var to = Object(target);

    for (var index = 1, len = arguments.length; index < len; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (hasProp.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
};
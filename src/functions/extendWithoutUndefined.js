var hasProp = require("./hasProp");

module.exports = function extendWithoutUndefined(dst, src) {
    var prop, value;

    for (prop in src) {
        /* istanbul ignore else */
        if (hasProp.call(src, prop)) {
            value = src[prop];
            if (value !== undefined) {
                dst[prop] = value;
            }
        }
    }

    return dst;
};
var expando = require("../expando");
var assign = require("./assign");
var hasProp = require("./hasProp");

module.exports = function setExpandoData(obj, data) {
    if (hasProp.call(obj, expando)) {
        assign(obj[expando], data);
    } else {
        // obj[expando] = data;
        Object.defineProperty(obj, expando, {
            configurable: true, // allow delete
            enumerable: false, // prevent listing in for ... in
            writable: true, // allow new assignation
            value: data
        });
    }
    return obj[expando];
};
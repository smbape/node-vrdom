var expando = require("../expando");
var hasProp = require("./hasProp");
var setExpandoData = require("./setExpandoData");

module.exports = function getExpandoData(obj, _default) {
    if (hasProp.call(obj, expando)) {
        return obj[expando];
    }

    return setExpandoData(obj, _default);
};
var getFunctionName = require("./getFunctionName");
var hasProp = require("./hasProp");

module.exports = function getDisplayName(obj) {
    var Constructor;
    if ("object" === typeof obj) {
        if (hasProp.call(obj, "_instance")) {
            obj = obj._instance;
        }

        Constructor = obj.constructor;
    } else if ("function" === typeof obj) {
        Constructor = obj;
    } else {
        return obj.name;
    }

    if (hasProp.call(Constructor, "displayName")) {
        return Constructor.displayName;
    }

    return getFunctionName(Constructor);
};
var hasProp = require("./hasProp");
var getFunctionName = require("./getFunctionName");

module.exports = function getDisplayRender(obj) {
    var displayName, hasRender;

    if ("object" === typeof obj) {
        if (hasProp.call(obj, "_instance")) {
            obj = obj._instance;
        }

        displayName = getDisplayName(obj.constructor);
        hasRender = "function" === typeof obj.render;
    } else if ("function" === typeof obj) {
        displayName = getDisplayName(obj);
    } else {
        displayName = obj.name;
    }

    if (hasRender) {
        return displayName + ".render()";
    }

    return displayName + "(...)";
};

function getDisplayName(Constructor) {
    if (hasProp.call(Constructor, "displayName")) {
        return Constructor.displayName;
    }

    return getFunctionName(Constructor);
}
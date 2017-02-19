module.exports = function getFunctionName(fn) {
    if ("name" in fn) {
        return fn.name;
    }

    var match = fn.toString().match(/^function\s*([^\s(]+)/);
    return match && match[1];
};
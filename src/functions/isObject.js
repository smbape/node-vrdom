module.exports = function isObject(obj) {
    var ref;
    return obj && ((ref = typeof obj) === "object" || ref === "function");
};
var expando = require("../expando");

module.exports = function isComponentConstructor(Constructor) {
    return "function" === typeof Constructor && Constructor.prototype && Constructor.prototype[expando + "_isComponent"];
};
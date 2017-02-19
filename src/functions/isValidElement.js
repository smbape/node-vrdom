var expando = require("../expando");

module.exports = function isValidElement(el) {
    return el !== null && "object" === typeof el && el.expando === expando;
};
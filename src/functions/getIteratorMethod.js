// eslint-disable-next-line no-undef
var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
var ITERATOR_METHOD = "@@iterator";
var isObject = require("./isObject");

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterables
// In order to be iterable,
// an object must implement the @@iterator method,
// meaning that the object (or one of the objects up its prototype chain) must have a property with a Symbol.iterator key:
// http://exploringjs.com/es6/ch_maps-sets.html
// eslint-disable-next-line consistent-return
module.exports = function getIteratorMethod(obj) {
    if (isObject(obj)) {
        var iteratorMethod = ITERATOR_SYMBOL && obj[ITERATOR_SYMBOL] || obj[ITERATOR_METHOD];
        if (typeof iteratorMethod === "function") {
            return iteratorMethod;
        }
    }

};
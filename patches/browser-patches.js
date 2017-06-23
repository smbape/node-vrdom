if (typeof Symbol !== "function" || !Symbol.iterator) {
    require('core-js/fn/symbol');
}

var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;

if (typeof Map !== "function" || typeof Map.prototype[ITERATOR_SYMBOL] !== "function") {
    require('core-js/fn/map');
}

if (typeof Set !== "function" || typeof Set.prototype[ITERATOR_SYMBOL] !== "function") {
    require('core-js/fn/set');
}

if (typeof Array.from === "undefined") {
    require('core-js/fn/array/from');
}

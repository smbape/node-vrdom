/* eslint-disable no-invalid-this */

module.exports = function createChainedFunction(fn1, fn2) {
    return function chainedFunction() {
        fn1.apply(this, arguments);
        fn2.apply(this, arguments);
    };
};
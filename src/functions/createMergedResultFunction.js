/* eslint-disable no-invalid-this */

var assign = require("./assign");

module.exports = function createMergedResultFunction(fn1, fn2) {
    return function mergedResultFunction() {
        var res1 = fn1.apply(this, arguments);
        var res2 = fn2.apply(this, arguments);

        if (res1 == null) {
            return res2;
        }

        if (res2 == null) {
            return res1;
        }

        return assign({}, res1, res2);
    };
};
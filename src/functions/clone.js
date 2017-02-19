var assign = require("./assign");

module.exports = function clone(src) {
    if (src == null) {
        return src;
    }

    return assign({}, src);
};
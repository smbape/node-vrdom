module.exports = function getCanonicalKey(key, prefix) {
    switch (typeof key) {
        case "string":
            key = prefix + ".#" + key;
            break;
        case "number":
            key = prefix + "." + key;
            break;
        default:
            key = prefix;
    }

    return key;
};
module.exports = function getKeyAndPrefixFromCanonicalKey(canonicalKey) {
    var lastIndex = canonicalKey.lastIndexOf(".");
    var prefix = canonicalKey.slice(0, lastIndex);
    var key;

    if (/\d/.test(canonicalKey[lastIndex + 1])) {
        key = parseInt(canonicalKey.slice(lastIndex + 1), 10);
    } else {
        key = canonicalKey.slice(lastIndex + 2);
    }

    return [key, prefix];
};
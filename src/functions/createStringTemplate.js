var hasProp = Object.prototype.hasOwnProperty;

module.exports = function createStringTemplate(str) {
    var matcher = /(^|(?!\\).)(\{\d+\})/g;
    var lastIndex = 0;
    var placeholders = [];
    var indexes = {};

    var match, placeholder, index;

    while (match = matcher.exec(str)) {
        placeholder = str.slice(lastIndex, match.index);
        if (match[1]) {
            placeholder += match[1];
        }
        if (placeholder !== "") {
            placeholders.push(placeholder);
        }

        index = match[2].slice(1, -1);
        if (hasProp.call(indexes, index)) {
            indexes[index].push(placeholders.length);
        } else {
            indexes[index] = [placeholders.length];
        }

        placeholders.push(match[2]);

        lastIndex = matcher.lastIndex;
    }

    placeholder = str.slice(lastIndex);
    if (placeholder !== "") {
        placeholders.push(placeholder);
    }

    return template;

    function template() {
        var length = arguments.length;
        var text = placeholders.slice();
        var value, places;

        // indexes is created by this code,
        // it is known to be a plain object
        // no need of guard-for-in
        // eslint-disable-next-line guard-for-in
        for (var index in indexes) {
            if (parseInt(index, 10) < length) {
                places = indexes[index];
                value = arguments[index];
                for (var i = 0, len = places.length; i < len; i++) {
                    text[places[i]] = String(value);
                }
            }
        }

        return text.join("");
    }
};
var hasProp = Object.prototype.hasOwnProperty;

module.exports = {
    eachParallel: eachParallel,
    eachSeries: eachSeries
};

function getIterableKeys(iterable) {
    var keys;
    if (!Array.isArray(iterable) && hasProp.call(iterable, "length")) {
        keys = new Array(iterable.length);

        for (var i = 0, len = keys.length; i < len; i++) {
            keys[i] = String(i);
        }
    } else {
        keys = Object.keys(iterable);
    }

    return keys;
}

function eachParallel(iterable, callback, done) {
    var keys = getIterableKeys(iterable);
    var len = keys.length;
    var count = len;

    var key, element;

    for (var i = 0; i < len; i++) {
        key = keys[i];
        element = iterable[key];
        callback(element, key, give);
    }

    give();

    function give(err) {
        if (done && (err || count-- === 0)) {
            done(err);
            done = null;
        }
    }
}

function eachSeries(iterable, callback, done) {
    var keys = getIterableKeys(iterable);
    var len = keys.length;
    var index = 0;

    give();

    function iterate() {
        var key = keys[index++];
        var element = iterable[key];
        callback(element, key, give);
    }

    function give(err) {
        if (err || index === len) {
            done(err);
            done = null;
            return;
        }

        iterate();
    }
}
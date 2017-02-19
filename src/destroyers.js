var reset = exports.reset = [];
var running = exports.running = [];

exports.destroy = function() {
    var i, destroyer;
    for (i = running.length - 1; i >= 0; i--) {
        destroyer = running.pop();

        // try catch is for internal debugging
        try {
            destroyer();
        } catch (e) {
            /* istanbul ignore next */
            console.error(e);
        }
    }

    for (i = reset.length - 1; i >= 0; i--) {
        // try catch is for internal debugging
        try {
            reset[i]();
        } catch (e) {
            /* istanbul ignore next */
            console.error(e);
        }
    }
};
var isEventSupported = require("../functions").isEventSupported;

// https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
module.exports = (function() {

    var support;

    // detect available wheel event
    support = isEventSupported("wheel") ? "wheel" /* istanbul ignore next */ : // Modern browsers support "wheel"
        isEventSupported("mousewheel") ? "mousewheel" /* istanbul ignore next */ : // Webkit and IE support at least "mousewheel"
        "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    return addWheelListener;

    function addWheelListener(elem, callback, useCapture) {
        var _removeWheelListener = _addWheelListener(elem, support, callback, useCapture);

        var _removeOldWheelListener;
        // handle MozMousePixelScroll in older Firefox
        /* istanbul ignore if */
        if (support === "DOMMouseScroll") {
            _removeOldWheelListener = _addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
        }

        return function removeWheelListener() {
            /* istanbul ignore if */
            if (_removeOldWheelListener) {
                _removeOldWheelListener();
                _removeOldWheelListener = null;
            }

            _removeWheelListener();
            _removeWheelListener = null;
        };
    }

    function _addWheelListener(elem, eventName, callback, useCapture) {
        useCapture = Boolean(useCapture);

        var handler = support === "wheel" ? callback /* istanbul ignore next */ : function(originalEvent) {
            // create a normalized event object
            var proxyEvent = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaY: 0,
                deltaZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault();
                },
                stopPropagation: function() {
                    originalEvent.stopPropagation();
                }
            };

            // calculate deltaY (and deltaX) according to the event
            if (support === "mousewheel") {
                proxyEvent.deltaY = -1 / 40 * originalEvent.wheelDelta; // eslint-disable-line no-magic-numbers
                // Webkit also support wheelDeltaX
                if (originalEvent.wheelDeltaX) {
                    proxyEvent.deltaX = -1 / 40 * originalEvent.wheelDeltaX; // eslint-disable-line no-magic-numbers
                }
            } else {
                proxyEvent.deltaY = originalEvent.detail;
            }

            // it"s time to fire the callback
            return callback(proxyEvent);

        };

        elem.addEventListener(eventName, handler, useCapture);

        return function _removeWheelListener() {
            elem.removeEventListener(eventName, handler, useCapture);
            handler = null;
            elem = null;
        };
    }

})();
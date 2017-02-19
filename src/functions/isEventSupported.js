var globalDocument = require("global/document");
var hasProp = Object.prototype.hasOwnProperty;

// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
var TAGNAMES = {
    "select": "input",
    "change": "input",
    "submit": "form",
    "reset": "form",
    "error": "img",
    "load": "img",
    "abort": "img"
};

module.exports = function isEventSupported(eventName) {
    var tagName = hasProp.call(TAGNAMES, eventName) ? TAGNAMES[eventName] : "div";
    var el = globalDocument.createElement(tagName);
    eventName = "on" + eventName;

    var isSupported = eventName in el;

    if (!isSupported) {
        el.setAttribute(eventName, "return;");
        isSupported = typeof el[eventName] === "function";
    }

    el = null;

    // https://connect.microsoft.com/IE/feedback/details/782835/missing-onwheel-attribute-for-the-wheel-event-although-its-supported-via-addeventlistener
    // https://github.com/nolimits4web/Swiper/blob/master/src/js/mousewheel.js
    if (!isSupported && eventName === "onwheel" &&
        globalDocument.implementation &&
        globalDocument.implementation.hasFeature &&
        // always returns true in newer browsers as per the standard.
        // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
        globalDocument.implementation.hasFeature("", "") !== true) {
        // This is the only way to test support for the `wheel` event in IE9+.
        isSupported = globalDocument.implementation.hasFeature("Events.wheel", "3.0");
    }

    return isSupported;
};
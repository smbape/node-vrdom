var expando = require("../expando");
var hasProp = require("../functions").hasProp;
var EVENTS_KEY = expando + "Events";

module.exports = function EvStore(elem) {
    if (hasProp.call(elem, EVENTS_KEY)) {
        return elem[EVENTS_KEY];
    }

    var events = {};
    elem[EVENTS_KEY] = events;

    return events;
};
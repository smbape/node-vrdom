var globalWindow = require("global/window");
var globalDocument = require("global/document");
var functions = require("../functions");
var assign = functions.assign;
var hasProp = functions.hasProp;

// https://www.w3.org/TR/2016/REC-html51-20161101/
// https://www.w3.org/TR/2016/WD-uievents-20160804/
// https://www.w3.org/TR/html51/semantics-embedded-content.html#media-elements-event-summary
// https://developer.mozilla.org/en-US/docs/Web/Events

var eventNames = {
    DoubleClick: {
        eventType: "dbclick"
    },
    Error: {
        local: {
            embed: 1,
            iframe: 1,
            img: 1,
            object: 1,
            script: 1
        }
    },
    Invalid: {
        local: {
            input: 1,
            select: 1,
            textarea: 1
        }
    },
    Load: {
        local: {
            embed: 1,
            iframe: 1,
            img: 1,
            object: 1
        }
    },
    Reset: {
        local: {
            form: 1
        }
    },
    Submit: {
        local: {
            form: 1
        }
    }
};

if (!(globalDocument.documentMode > 0)) {
    // no error event on source in IE
    eventNames.Error.local.source = 1;
}

// ================================================================
// CSSOM events
// ================================================================
(function() {
    var prefix;
    var style = globalDocument.createElement("div").style;

    prefix = getStylePrefix("Animation", style);
    if (prefix != null) {
        eventNames.AnimationEnd = {
            eventType: getStyleEventName(prefix, "AnimationEnd")
        };
        eventNames.AnimationIteration = {
            eventType: getStyleEventName(prefix, "AnimationIteration")
        };
        eventNames.AnimationStart = {
            eventType: getStyleEventName(prefix, "AnimationStart")
        };
    }

    prefix = getStylePrefix("Transition", style);
    if (prefix != null) {
        eventNames.TransitionEnd = {
            eventType: getStyleEventName(prefix, "TransitionEnd")
        };
    }

    style = null;
}());

// ================================================================
// media events
// https://www.w3.org/TR/html51/semantics-embedded-content.html#media-elements-event-summary
// https://developer.mozilla.org/en-US/docs/Web/Events
// ================================================================
(function() {
    var MediaEvents = [
        "LoadStart",
        "Progress",
        "Suspend",
        "Abort",
        "Error",
        "Emptied",
        "Stalled",
        "LoadedMetadata",
        "LoadedData",
        "CanPlay",
        "CanPlayThrough",
        "Playing",
        "Waiting",
        "Seeking",
        "Seeked",
        "Ended",
        "DurationChange",
        "TimeUpdate",
        "Play",
        "Pause",
        "RateChange",
        "VolumeChange",
        "Resize",

        // Encrypted Media Extensions events
        "Encrypted",
        "KeyStatusChange",
        "Message",
        "WaitingForKey"
    ];

    var config, eventName, local;
    for (var i = 0, len = MediaEvents.length; i < len; i++) {
        eventName = MediaEvents[i];
        local = {
            audio: 1,
            video: 1
        };

        if (!hasProp.call(eventNames, eventName)) {
            eventNames[eventName] = {};
        }

        config = eventNames[eventName];

        if (hasProp.call(config, "local")) {
            assign(config.local, local);
        } else {
            config.local = local;
        }
    }
}());

// ================================================================
// File API events
// https://developer.mozilla.org/en-US/docs/Web/Events
// ================================================================
(function() {
    var FileAPIEvents = [
        "Abort",
        "Error",
        "Load",
        "LoadEnd",
        "LoadStart",
        "Progress"
    ];

    var config, eventName, local;
    for (var i = 0, len = FileAPIEvents.length; i < len; i++) {
        eventName = FileAPIEvents[i];
        local = {
            file: 1
        };

        if (!hasProp.call(eventNames, eventName)) {
            eventNames[eventName] = {};
        }

        config = eventNames[eventName];

        if (hasProp.call(config, "local")) {
            assign(config.local, local);
        } else {
            config.local = local;
        }
    }
}());

// ================================================================
// blur and focus event
// ================================================================
eventNames.Blur = {};
eventNames.Focus = {};
eventNames.Blur.useCapture = true;
eventNames.Focus.useCapture = true;

// ================================================================
// scroll event
// ================================================================
eventNames.Scroll = {};
eventNames.Scroll.useCapture = true;

// ================================================================
// Window events
// ================================================================
(function() {
    var WindowEvents = [
        // "Abort", // Also available for others
        "AfterPrint",
        "BeforePrint",
        "BeforeUnload",
        "HashChange",
        "PageHide",
        "PageShow",
        "PopState",
        "Resize",
        "Storage",
        "Unload"
    ];

    var eventName, config;

    for (var i = 0, len = WindowEvents.length; i < len; i++) {
        eventName = WindowEvents[i];

        if (!hasProp.call(eventNames, eventName)) {
            eventNames[eventName] = {};
        }

        config = eventNames[eventName];
        config.target = globalWindow;
    }
}());

// ================================================================
// compute local events
// ================================================================
var locals = {};
var Events = {};

(function() {

    var normalizedName, config;

    // eslint-disable-next-line guard-for-in
    for (var eventName in eventNames) {
        config = eventNames[eventName];
        normalizedName = eventName.toLowerCase();

        if (!hasProp.call(config, "useCapture")) {
            config.useCapture = false;
        }

        if (!hasProp.call(config, "eventType")) {
            config.eventType = normalizedName;
        }

        addLocal(locals, config.local, normalizedName);
        Events[normalizedName] = config;
    }

}());

module.exports = {
    Events: Events,
    locals: locals
};

function addLocal(locals, config, eventName) {
    if (config) {
        var local;
        for (local in config) {
            if (hasProp.call(locals, local)) {
                local = locals[local];
            } else {
                local = locals[local] = {};
            }
            local[eventName] = 1;
        }
    }
}

// https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix
function getStylePrefix(name, style) {
    var styleProp = name.toLowerCase();
    if (styleProp in style) {
        return "";
    }

    // Modernizr/src/omPrefixes.js
    var omPrefixes = ["Webkit", "Moz", "O", "ms"];
    var prefix;

    for (var i = 0, len = omPrefixes.length; i < len; i++) {
        prefix = omPrefixes[i];
        styleProp = prefix + name;
        if (styleProp in style) {
            return prefix;
        }
    }

    return null;
}

function getStyleEventName(prefix, eventName) {
    switch (prefix) {
        case "":
            return eventName.toLowerCase();
        case "Webkit":
            return "webkit" + eventName;
        case "Moz":
            return "moz" + eventName;
        case "O":
            return "o" + eventName.toLowerCase();
        case "ms":
            return "MS" + eventName;
        default:
            return eventName;
    }
}
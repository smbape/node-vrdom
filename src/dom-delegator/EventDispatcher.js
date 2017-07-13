var hasProp = Object.prototype.hasOwnProperty;

var EvStore = require("./EvStore");

var ProxyEvent = require("./ProxyEvent");
var addWheelListener = require("./addWheelListener");

var Renderer;

function EventDispatcher(document) {
    this.target = document;
    this.handlers = {};
}

EventDispatcher.getKey = function(eventName, eventType) {
    return eventName + ":" + eventType;
};

EventDispatcher.prototype.addEventListener = function(eventName, eventType, useCapture) {
    var handlers = this.handlers;

    if (hasProp.call(handlers, eventName)) {
        return null;
    }

    var target = this.target;

    var listener = this.getHandler(eventName, eventType);
    if (eventType === "wheel") {
        return addWheelListener(target, listener, useCapture);
    }

    target.addEventListener(eventType, listener, useCapture);

    return function removeEventListener() {
        target.removeEventListener(eventType, listener, useCapture);
        delete handlers[EventDispatcher.getKey(eventName, eventType)];
        handlers = null;
        target = null;
        listener = null;
    };
};

EventDispatcher.prototype.getHandler = function(eventName, eventType) {
    var handlers = this.handlers;
    var key = EventDispatcher.getKey(eventName, eventType);

    if (hasProp.call(handlers, key)) {
        return handlers[key];
    }

    var handler = handlers[key] = eventHandler.bind(this, eventName, eventType);
    return handler;
};

function eventHandler(eventName, eventType, evt) {
    var ret;

    var process = false;
    if (Renderer._eventHandler == null) {
        Renderer._eventHandler = [];
        Renderer._performAfterUpdates = false;
        process = true;
    }

    try {
        ret = dispatchEvent(eventName, eventType, evt, evt.target);
    } finally {
        if (process) {
            Renderer.processEventHandler();
            Renderer._performAfterUpdates = true;
        }
    }

    return ret;
}

function dispatchEvent(eventName, eventType, evt, currentTarget) {
    var ret, intermediateRet, proxyEvent;
    var handle = getClosestHandle(currentTarget, eventName, eventType);

    if (handle && handle.handlers.length > 0) {
        currentTarget = handle.currentTarget;
        proxyEvent = new ProxyEvent(evt, eventName, {
            currentTarget: currentTarget
        });

        intermediateRet = executeHandlers(handle.handlers, proxyEvent);
        if (intermediateRet === false) {
            ret = false;
        }

        if (!proxyEvent._isPropagationStopped) {
            intermediateRet = dispatchEvent(eventName, eventType, evt, currentTarget.parentNode);
            if (intermediateRet === false) {
                ret = false;
            }
        }
    }

    return ret;
}

function getClosestHandle(currentTarget, eventName, eventType) {
    if (currentTarget == null) {
        return null;
    }

    var events = EvStore(currentTarget);
    var handlers = events[EventDispatcher.getKey(eventName, eventType)];

    if (!handlers) {
        return getClosestHandle(currentTarget.parentNode, eventName, eventType);
    }

    return {
        currentTarget: currentTarget,
        handlers: Array.isArray(handlers) ? handlers : [handlers]
    };
}

function executeHandlers(handlers, evt) {
    var ret;

    handlers.forEach(function(handler) {
        var res = handler(evt);
        if (res === false) {
            ret = false;
            evt.preventDefault();
        }
    });

    return ret;
}

module.exports = EventDispatcher;
Renderer = require("../Renderer");
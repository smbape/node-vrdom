var hasProp = Object.prototype.hasOwnProperty;

var EvStore = require("./EvStore");

var ProxyEvent = require("./ProxyEvent");
var addWheelListener = require("./addWheelListener");

var Renderer;

function EventDispatcher(document) {
    this.target = document.documentElement;
    this.handlers = {};
}

EventDispatcher.prototype.addEventListener = function(eventName, eventType, useCapture) {
    var handlers = this.handlers;

    if (hasProp.call(handlers, eventName)) {
        return null;
    }

    var target = this.target;
    var listener = this.getHandler(eventName);
    if (eventType === "wheel") {
        return addWheelListener(target, listener, useCapture);
    }

    target.addEventListener(eventType, listener, useCapture);

    return function removeEventListener() {
        target.removeEventListener(eventType, listener, useCapture);
        delete handlers[eventName];
        handlers = null;
        target = null;
        listener = null;
    };
};

EventDispatcher.prototype.getHandler = function(eventName) {
    var handlers = this.handlers;

    if (hasProp.call(handlers, eventName)) {
        return handlers[eventName];
    }

    var handler = handlers[eventName] = eventHandler.bind(this, eventName);
    return handler;
};

function eventHandler(eventName, evt) {
    var ret;

    var process = false;
    if (Renderer._eventHandler == null) {
        Renderer._eventHandler = [];
        Renderer._performAfterUpdates = false;
        process = true;
    }

    try {
        ret = dispatchEvent(eventName, evt, evt.target);
    } finally {
        if (process) {
            Renderer.processEventHandler();
            Renderer._performAfterUpdates = true;
        }
    }

    return ret;
}

function dispatchEvent(eventName, evt, currentTarget) {
    var ret, intermediateRet, proxyEvent;
    var handle = getClosestHandle(currentTarget, eventName);

    if (handle && handle.handlers.length > 0) {
        currentTarget = handle.currentTarget;
        proxyEvent = new ProxyEvent(evt, eventName, { currentTarget: currentTarget });

        intermediateRet = executeHandlers(handle.handlers, proxyEvent);
        if (intermediateRet === false) {
            ret = false;
        }

        if (!proxyEvent._isPropagationStopped) {
            intermediateRet = dispatchEvent(eventName, evt, currentTarget.parentNode);
            if (intermediateRet === false) {
                ret = false;
            }
        }
    }

    return ret;
}

function getClosestHandle(currentTarget, eventName) {
    if (currentTarget == null) {
        return null;
    }

    var events = EvStore(currentTarget);
    var handlers = events[eventName];

    if (!handlers) {
        return getClosestHandle(currentTarget.parentNode, eventName);
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
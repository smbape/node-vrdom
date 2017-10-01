var globalWindow = require("global/window");
var globalDocument = require("global/document");
var getOwnerDocument = require("../functions/getOwnerDocument");
var hasProp = require("../functions/hasProp");
var expando = require("../expando");
var destroyers = require("../destroyers");

var EvStore, EventDispatcher, EventConfig, Events;

var EventListener = exports;

// https://developer.mozilla.org/fr/docs/Web/API/Node/nodeType
// var ELEMENT_NODE = 1; // Node.ELEMENT_NODE == 1
// var ATTRIBUTE_NODE = 2; // Node.ATTRIBUTE_NODE == 2
// var TEXT_NODE = 3; // Node.TEXT_NODE == 3
// var CDATA_SECTION_NODE = 4; // Node.CDATA_SECTION_NODE == 4
// var ENTITY_REFERENCE_NODE = 5; // Node.ENTITY_REFERENCE_NODE == 5
// var ENTITY_NODE = 6; // Node.ENTITY_NODE == 6
// var PROCESSING_INSTRUCTION_NODE = 7; // Node.PROCESSING_INSTRUCTION_NODE == 7
// var COMMENT_NODE = 8; // Node.COMMENT_NODE == 8
// var DOCUMENT_NODE = 9; // Node.DOCUMENT_NODE == 9
// var DOCUMENT_TYPE_NODE = 10; // Node.DOCUMENT_TYPE_NODE == 10
// var DOCUMENT_FRAGMENT_NODE = 11; // Node.DOCUMENT_FRAGMENT_NODE == 11
// var NOTATION_NODE = 12; // Node.NOTATION_NODE == 12

EventListener.addEventListener = function(context, node, eventName, eventType) {
    var ownerDocument = getOwnerDocument(node);
    var unref = true;

    var delegator;
    // on Edge and when ownerDocument is iframe.contentDocument
    // delete is not authorized
    if (ownerDocument[expando + "_delegator"] != null) {
        delegator = ownerDocument[expando + "_delegator"];
    } else {
        unref = false;
        delegator = ownerDocument[expando + "_delegator"] = new EventDispatcher(ownerDocument);
        destroyers.running.push(function() {
            // ownerDocument may an iframe document
            // Edge throw when accessing ownerDocument when iframe is removed from DOM
            try {
                delete ownerDocument[expando + "_delegator"];
            } catch(e) {
                // Nothing to do
            }
            ownerDocument = null;
        });
    }

    var config, useCapture, target, isLocal;
    if (eventType in Events) {
        config = Events[eventType];
        eventType = config.eventType;
        useCapture = config.useCapture;
        target = config.target || node;
        isLocal = hasProp.call(config, "local") && hasProp.call(config.local, node.nodeName.toLowerCase());
    } else {
        eventType = eventType.toLowerCase();
        useCapture = false;
        target = node;
    }

    if (eventName === "load" && node.nodeName === "BODY") {
        target = ownerDocument.defaultView;
    }

    var handler, removeEventListener;

    if (context.local) {
        // listen to local events on node and simulate bubble
        handler = delegator.getHandler(eventName, eventType);
        context.removeEventListener = addEventListener(node, eventType, handler, useCapture);
        if (unref) {
            ownerDocument = null; //unref
        }
        return;
    }

    if (target !== node) {
        handler = context.handler;

        // listen to event on target
        if (target === globalWindow && ownerDocument !== globalDocument) {
            if (ownerDocument) {
                target = ownerDocument.defaultView;
                context.removeEventListener = addEventListener(target, eventType, handler, useCapture);
            } else if (node.nodeName === "IFRAME") {
                context.removeEventListener = function() {
                    if (removeEventListener) {
                        removeEventListener();
                        removeEventListener = null;
                    }
                };

                node.addEventListener("load", function onload() {
                    node.removeEventListener("load", onload, false);
                    var ownerDocument = getOwnerDocument(node);
                    var target = ownerDocument.defaultView;
                    removeEventListener = addEventListener(target, eventType, handler, useCapture);
                    node = null;
                }, false);
            }
        } else {
            context.removeEventListener = addEventListener(target, eventType, handler, useCapture);
        }
        if (unref) {
            ownerDocument = null; //unref
        }
        return;
    }

    if (!isLocal) {
        // only listen globally for non local events
        removeEventListener = delegator.addEventListener(eventName, eventType, useCapture);
        if (removeEventListener) {
            destroyers.running.push(removeEventListener);
        }
    }

    var events = EvStore(node);
    events[EventDispatcher.getKey(eventName, eventType)] = context.handler;
    if (unref) {
        ownerDocument = null; //unref
    }
};

EventListener.removeEventListener = function(context, node, eventName, eventType) {
    if (context.removeEventListener) {
        context.removeEventListener();
        context.removeEventListener = undefined;
        return;
    }

    if (eventType in Events) {
        eventType = Events[eventType].eventType;
    } else {
        eventType = eventType.toLowerCase();
    }

    var events = EvStore(node);
    events[EventDispatcher.getKey(eventName, eventType)] = undefined;
};

function addEventListener(target, eventType, handler, useCapture) {
    target.addEventListener(eventType, handler, useCapture);

    return function removeEventListener() {
        target.removeEventListener(eventType, handler, useCapture);
        handler = null;
        target = null;
    };
}

EventDispatcher = require("../dom-delegator/EventDispatcher");
EventConfig = require("../dom-delegator/EventConfig");
EvStore = require("../dom-delegator/EvStore");
Events = EventConfig.Events;
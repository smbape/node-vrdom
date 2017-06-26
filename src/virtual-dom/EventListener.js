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

EventListener.addEventListener = function(context, node, eventName) {
    // var ownerDocument = node.nodeType === DOCUMENT_FRAGMENT_NODE ? node : node.ownerDocument;
    var ownerDocument = node.ownerDocument;

    var delegator;
    if (hasProp.call(ownerDocument, expando + "_delegator")) {
        delegator = ownerDocument[expando + "_delegator"];
        ownerDocument = null; //unref
    } else {
        delegator = ownerDocument[expando + "_delegator"] = new EventDispatcher(ownerDocument);
        destroyers.running.push(function() {
            delete ownerDocument[expando + "_delegator"];
            ownerDocument = null;
        });
    }

    var config, useCapture, target, eventType, isLocal;
    if (eventName in Events) {
        config = Events[eventName];
        eventType = config.eventType;
        useCapture = config.useCapture;
        target = config.target || node;
        isLocal = hasProp.call(config, "local");
    } else {
        eventType = eventName.toLowerCase();
        useCapture = false;
        target = node;
    }

    var handler, removeEventListener;

    if (context.local) {
        // listen to local events on node and simulate bubble
        handler = delegator.getHandler(eventName);
        context.removeEventListener = addEventListener(node, eventType, handler, useCapture);
        return;
    }

    if (target !== node) {
        // listen to event on target
        context.removeEventListener = addEventListener(target, eventType, context.handler, useCapture);
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
    events[eventName] = context.handler;
};

EventListener.removeEventListener = function(context, node, eventName) {
    if (context.removeEventListener) {
        context.removeEventListener();
        context.removeEventListener = undefined;
        return;
    }

    var events = EvStore(node);
    events[eventName] = undefined;
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
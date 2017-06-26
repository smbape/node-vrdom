module.exports = setProperties;

var destroyers = require("../destroyers");
var expando = require("../expando");
var functions = require("../functions");
var hasProp = functions.hasProp;
var hasEditableValue = functions.hasEditableValue;
var normalizeCssProps = functions.normalizeCssProps;
var setExpandoData = functions.setExpandoData;

var xml = require("../w3c/xml");
var XMLNameReg = xml.XMLNameReg;
var XMLNameCharReg = xml.XMLNameCharReg;

var localEvents = require("../dom-delegator/EventConfig").locals;

var EventListener = require("./EventListener");
var EVENT_ATTR_REG = new RegExp("^on" + XMLNameCharReg.source + "*$");

var w3c = require("../w3c");
var CUSTOM_TAG_ATTR_REG = new RegExp("^(?:data|aria)-" + XMLNameCharReg.source + "*$", "i");

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
/// #endif

var controls = require("../controls");
var validAttributes = {};
var invalidAttributes = {};
var knownStyles = {};

destroyers.reset.push(function() {
    validAttributes = {};
    invalidAttributes = {};
    knownStyles = {};
});

var CSSPropAcceptLength = require("../mdn/CSSPropAcceptLength");
var CSSPropAcceptNumber = require("../mdn/CSSPropAcceptNumber");

var customAttributes = {
    onchange: "onChange",
    valuelink:"valueLink",
    checkedlink:"checkedLink"
};

var EMPTY_OBJECT = Object.create(null);

function setProperties(vnode, node, nextProps, prevProps) {
    var propName, eventName;
    var element = vnode.element;
    var type = element.type;
    var isCustomTag, hasChanged;

    nextProps = normalizeDomProps(type, nextProps, isCustomTag);

    if (nextProps == null) {
        isCustomTag = prevProps.is != null || type.indexOf("-") !== -1;

        if (hasProp.call(controls.onChange, type) && !hasProp.call(prevProps, "onChange")) {
            // controll value even if there is no onChange prop
            removeEventListener(type, prevProps, node, "Change");
        }

        // remove event listeners
        for (propName in prevProps) {
            if (EVENT_ATTR_REG.test(propName)) {
                removeEventListener(type, prevProps, node, propName.slice(2));
            }
        }

        // removeListeners for local events that are difficult to listen globally on all browsers
        if (hasProp.call(localEvents, type)) {
            // eslint-disable-next-line guard-for-in
            for (eventName in localEvents[type]) {
                removeEventListener(type, prevProps, node, eventName);
            }
        }

        return true;
    }

    isCustomTag = nextProps.is != null || type.indexOf("-") !== -1;

    if (prevProps) {
        hasChanged = false;
    } else {
        hasChanged = true;
        vnode.props = nextProps;

        // addListeners for local events that do not bubble but would be nice if they do
        if (hasProp.call(localEvents, type)) {
            // eslint-disable-next-line guard-for-in
            for (eventName in localEvents[type]) {
                addEventListener(type, nextProps, node, eventName, null, true);
            }
        }

        // controll value even if there is no onChange prop
        if (hasProp.call(controls.onChange, type) && !hasProp.call(nextProps, "onChange")) {
            addEventListener(type, nextProps, node, "Change", undefined, false);
        }
    }

    // set type before changing other properties
    if (type === "input" && (hasProp.call(nextProps, "type") || prevProps && hasProp.call(prevProps, "type"))) {
        hasChanged = setProperty(type, node, "type", nextProps, prevProps, isCustomTag) || hasChanged;
    }

    for (propName in prevProps) {
        if (type === "input" && propName === "type") {
            continue;
        }

        if (!hasProp.call(nextProps, propName)) {
            hasChanged = setProperty(type, node, propName, nextProps, prevProps, isCustomTag) || hasChanged;
            delete prevProps[propName];
        }
    }

    for (propName in nextProps) {
        if (type === "input" && propName === "type") {
            continue;
        }

        hasChanged = setProperty(type, node, propName, nextProps, prevProps, isCustomTag) || hasChanged;
    }

    return hasChanged;
}

function normalizeDomProps(type, props, isCustomTag) {
    if (isCustomTag || props == null) {
        return props;
    }

    var normalized = {};
    var normalizedProp, lpropName;
    var keys = {};

    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    // eslint-disable-next-line guard-for-in
    for (var propName in props) {
        switch (propName) {
            case "dangerouslySetInnerHTML":
            case "suppressContentEditableWarning":
            case "innerHTML":
                normalizedProp = propName;
                break;

            default:
                lpropName = propName.toLowerCase();
                if (hasProp.call(w3c.properties, propName)) {
                    normalizedProp = propName;
                } else if (CUSTOM_TAG_ATTR_REG.test(propName)) {
                    normalizedProp = lpropName;
                } else if (hasProp.call(w3c.attributes, propName)) {
                    normalizedProp = w3c.attributes[propName];

                    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
                    msg = "Warning: " + translator.translate("errors.unkown-attribute", propName, normalizedProp, type);
                    console.error(msg);
                    /// #endif
                } else if (hasProp.call(w3c.attributes, lpropName)) {
                    normalizedProp = w3c.attributes[lpropName];

                    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
                    msg = "Warning: " + translator.translate("errors.unkown-attribute", propName, normalizedProp, type);
                    console.error(msg);
                    /// #endif
                } else if (hasProp.call(customAttributes, lpropName)) {
                    normalizedProp = customAttributes[lpropName];
                } else {
                    normalizedProp = lpropName;
                }

                if (hasProp.call(keys, normalizedProp)) {
                    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
                    msg = "Warning: " + translator.translate("errors.duplicate-prop", propName, keys[normalizedProp], type);
                    console.error(msg);
                    /// #endif
                    continue;
                }
        }

        keys[normalizedProp] = propName;
        normalized[normalizedProp] = props[propName];
    }

    return normalized;
}

function setProperty(type, node, propName, nextProps, prevProps, isCustomTag) {
    var prevValue = prevProps && prevProps[propName];
    var nextValue = nextProps[propName];
    var hasChanged = false;

    switch (propName) {
        case "dangerouslySetInnerHTML":
        case "children":
        case "suppressContentEditableWarning":
        case "innerHTML":
            return hasChanged;
        case "style":
            hasChanged = setStyle(type, node, nextValue, prevValue);
            if (prevProps) {
                prevProps.style = nextValue;
            }
            return hasChanged;
        default:
            // do nothing
            break;
    }

    if (EVENT_ATTR_REG.test(propName)) {
        addEventListener(type, nextProps, node, propName.slice(2), nextValue, false);
        if (prevProps) {
            prevProps[propName] = nextValue;
        }
        return true;
    }

    if (isCustomTag || CUSTOM_TAG_ATTR_REG.test(propName)) {
        prevValue = prevValue == null ? undefined : String(prevValue);
        nextValue = nextValue == null ? undefined : String(nextValue);

        if (prevValue !== nextValue) {
            hasChanged = true;
            setAttribute(node, propName, nextValue);
        }
    }

    if (hasProp.call(w3c.properties, propName)) {
        var propConfig = w3c.properties[propName];

        var attrName = propConfig.attrName;
        var namespace = propConfig.namespace;
        var isBoolean = propConfig.isBoolean;
        var isProperty = propConfig.isProperty;
        var isString = propConfig.type === "String";

        if (isProperty) {
            if (shouldRemoveAttribute(propConfig, prevValue)) {
                prevValue = isBoolean ? false : "";
            } else if (isString) {
                prevValue = String(prevValue);
            }

            // removing checked should preserve existing checked
            if (type === "input" && attrName === "checked" && (nextProps.type === "checkbox" || nextProps.type === "radio") && !hasProp.call(nextProps, "checked")) {
                nextValue = prevValue;
            } else if (shouldRemoveAttribute(propConfig, nextValue)) {
                nextValue = isBoolean ? false : "";
            } else if (isString) {
                nextValue = String(nextValue);
            }

            if (prevValue !== nextValue) {
                hasChanged = true;
                if (isBoolean) {
                    if (nextValue) {
                        node.setAttribute(propName, "");
                    } else {
                        node.removeAttribute(propName);
                    }
                } else {
                    node.setAttribute(propName, String(nextValue));
                }
                node[propName] = nextValue;
            }
        } else if (shouldRemoveAttribute(propConfig, nextValue)) {
            if (!shouldRemoveAttribute(propConfig, prevValue)) {
                hasChanged = true;
                setAttribute(node, attrName, undefined, namespace);
            }
        } else {
            prevValue = getPropvalue(prevValue);
            nextValue = getPropvalue(nextValue);

            if (prevValue !== nextValue) {
                hasChanged = true;
                setAttribute(node, attrName, nextValue, namespace);
            }
        }
    } else {
        hasChanged = true;
        node[propName] = nextValue;
    }

    if (prevProps && prevProps[propName] !== nextProps[propName]) {
        prevProps[propName] = nextProps[propName];
    }

    return hasChanged;
}

function getPropvalue(value) {
    return value == null ? undefined : String(value);
}

function isEmpty(obj) {
    // eslint-disable-next-line guard-for-in
    for (var key in obj) {
        return true;
    }

    return false;
}

function setStyle(type, node, nextStyle, prevStyle) {
    var cssProp, value, typeofValue, styleProp;

    prevStyle = normalizeCssProps(prevStyle, type, true);
    nextStyle = normalizeCssProps(nextStyle, type, true);

    if (nextStyle && "object" === typeof nextStyle) {
        if (prevStyle && "object" === typeof prevStyle) {
            for (cssProp in prevStyle) {
                if (!hasProp.call(nextStyle, cssProp)) {
                    styleProp = getStyleProp(cssProp, node);
                    node.style[styleProp] = "";
                }
            }
        }

        // eslint-disable-next-line guard-for-in
        for (cssProp in nextStyle) {
            value = nextStyle[cssProp];
            typeofValue = typeof value;
            styleProp = getStyleProp(cssProp, node);

            if (value == null || "boolean" === typeofValue) {
                node.style[styleProp] = "";
            } else if ("number" === typeofValue && hasProp.call(CSSPropAcceptLength, cssProp) && !hasProp.call(CSSPropAcceptNumber, cssProp)) {
                node.style[styleProp] = value + "px";
            } else {
                node.style[styleProp] = value;
            }
        }
    } else if (prevStyle && "object" === typeof prevStyle) {
        // eslint-disable-next-line guard-for-in
        for (cssProp in prevStyle) {
            styleProp = getStyleProp(cssProp, node);
            node.style[styleProp] = "";
        }
    }
}

function getStyleProp(cssProp, node) {
    if (hasProp.call(knownStyles, cssProp)) {
        return knownStyles[cssProp];
    }

    var styleProp = cssProp;
    var style = node.style;

    if (styleProp in style) {
        knownStyles[cssProp] = styleProp;
        return styleProp;
    }

    // https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix
    // Modernizr/src/omPrefixes.js
    var omPrefixes = ["Webkit", "Moz", "O", "ms"];
    var ccssProp = cssProp[0].toUpperCase() + cssProp.slice(1);

    for (var i = 0, len = omPrefixes.length; i < len; i++) {
        styleProp = omPrefixes[i] + ccssProp;
        if (styleProp in style) {
            knownStyles[cssProp] = styleProp;
            return styleProp;
        }
    }

    return cssProp;
}

function setAttribute(node, attrName, attrValue, namespace) {
    if (hasProp.call(invalidAttributes, attrName)) {
        return;
    }

    if (!hasProp.call(validAttributes, attrName) && !XMLNameReg.test(attrName)) {
        invalidAttributes[attrName] = true;
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        var msg = "Warning: " + translator.translate("errors.invalid-attribute", attrName);
        console.error(msg);
        /// #endif
        return;
    }

    var currentValue;
    validAttributes[attrName] = true;

    if (attrValue == null) {
        if (node.hasAttribute(attrName)) {
            node.removeAttribute(attrName);
        }
    } else if (namespace) {
        currentValue = node.getAttributeNS(namespace, attrName);
        if (!currentValue || currentValue !== attrValue) {
            node.setAttributeNS(namespace, attrName, attrValue);
        }
    } else {
        currentValue = node.getAttribute(attrName);
        if (attrName === "value" && node.tagName === "TEXTAREA") {
            // should not render value as an attribute for textarea
            if (node.value !== attrValue) {
                node.value = attrValue;
            }
        } else {
            if (attrName === "value" && hasEditableValue(node.tagName.toLowerCase(), { type: node.type })) {
                // also set value for element with editable values
                if (node.value !== attrValue) {
                    node.value = attrValue;
                }
            }

            if (!currentValue || currentValue !== attrValue) {
                node.setAttribute(attrName, attrValue);
            }
        }
    }
}

function addEventListener(type, nextProps, node, eventName, value, local) {
    var data, events, removeEventListeners = [];

    var context = {
        local: local,
        handler: value,
        eventName: eventName
    };

    if (eventName === "Change") {
        events = getChangeEventName(type, nextProps);
        context.events = events;
        if (hasProp.call(controls.onChange, type)) {
            context.handler = controls.onChange[type](type, nextProps);
        }
    } else {
        events = eventName;
    }

    if (Array.isArray(events)) {
        events.forEach(function(eventName) {
            EventListener.addEventListener(context, node, eventName);
            if (context.removeEventListener) {
                removeEventListeners.push(context.removeEventListener);
                delete context.removeEventListener;
            }
        });

        if (removeEventListeners.length !== 0) {
            context.removeEventListener = removeEventListeners;
        }
    } else {
        EventListener.addEventListener(context, node, events);
    }
    

    if (context.removeEventListener) {
        data = setExpandoData(node, {});

        if (hasProp.call(data, "eventHandlers")) {
            data = data.eventHandlers;
        } else {
            data = data.eventHandlers = {};
        }

        data[eventName] = context;
    }
}

function removeEventListener(type, props, node, eventName) {
    var inst, data;

    var context = EMPTY_OBJECT;

    if (eventName === "Change") {
        eventName = getChangeEventName(type, props);
    }

    if (hasProp.call(node, expando)) {
        inst = node[expando];

        if (hasProp.call(inst, "eventHandlers")) {
            data = inst.eventHandlers;

            if (hasProp.call(data, eventName)) {
                context = data[eventName];

                delete data[eventName];
                if (isEmpty(data)) {
                    delete inst.eventHandlers;
                }
            }
        }
    }

    if (Array.isArray(context.removeEventListener)) {
        context.removeEventListener.forEach(function(removeEventListener) {
            removeEventListener();
        });
        delete context.removeEventListener;
        return;
    }

    EventListener.removeEventListener(context, node, eventName);
}

function shouldRemoveAttribute(config, value) {
    var isBoolean = config.isBoolean,
        isNumber = config.isNumber,
        isPositive = config.isPositive;

    return value == null || isBoolean && !value || isNumber && isNaN(value) || isPositive && value < 1;
}

function getChangeEventName(type, props) {
    if (hasEditableValue(type, props) && type !== "select") {
        return [ "input", "change" ];
    }

    return "Change";
}
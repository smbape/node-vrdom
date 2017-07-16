module.exports = ProxyEvent;

var rkeyEvent = /^key/,
    rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;

function ProxyEvent(src, eventName, props) {
    this.originalEvent = src;
    this.type = eventName.toLowerCase();

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined ?
        returnTrue :
        returnFalse;

    // Create target properties
    // Support: Safari <=6 - 7 only
    // Target should not be a text node (#504, #13143)
    this.target = src.target && src.target.nodeType === 3 ?
        src.target.parentNode :
        src.target;

    this.currentTarget = src.currentTarget;
    this.relatedTarget = src.relatedTarget;

    // Create a timestamp if incoming event doesn't have one
    if (src.timeStamp) {
        this.timeStamp = src.timeStamp;
    } else {
        this.timeStamp = Date.now();
    }

    // eslint-disable-next-line guard-for-in
    for (var prop in props) {
        this[prop] = props[prop];
    }
}

// Includes all common event props including KeyEvent and MouseEvent specific props
each({
    altKey: true,
    bubbles: true,
    cancelable: true,
    changedTouches: true,
    ctrlKey: true,
    detail: true,
    eventPhase: true,
    metaKey: true,
    pageX: true,
    pageY: true,
    shiftKey: true,
    view: true,
    "char": true,
    charCode: true,
    key: true,
    keyCode: true,
    button: true,
    buttons: true,
    clientX: true,
    clientY: true,
    offsetX: true,
    offsetY: true,
    pointerId: true,
    pointerType: true,
    screenX: true,
    screenY: true,
    targetTouches: true,
    toElement: true,
    touches: true,

    which: function(event) {
        var button = event.button;

        // Add which for key events
        /* istanbul ignore if */
        if (event.which == null && rkeyEvent.test(event.type)) {
            return event.charCode != null ? event.charCode : event.keyCode;
        }

        // Add which for click: 1 === left; 2 === middle; 3 === right
        /* istanbul ignore if */
        if (!event.which && button !== undefined /* istanbul ignore next */ && rmouseEvent.test(event.type)) {
            if (button & 1) {
                return 1;
            }

            if (button & 2) {
                return 3;
            }

            if (button & 4) {
                return 2;
            }

            return 0;
        }

        return event.which;
    }
}, addProp, ProxyEvent.prototype);

ProxyEvent.prototype.preventDefault = function() {
    this.originalEvent.preventDefault();
    this.isDefaultPrevented = returnTrue;
};

ProxyEvent.prototype.isDefaultPrevented = returnFalse;
ProxyEvent.prototype.isPropagationStopped = returnFalse;

ProxyEvent.prototype.stopPropagation = function() {
    this.originalEvent.stopPropagation();
    this._isPropagationStopped = true;
    this.isPropagationStopped = returnTrue;
};

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

function each(obj, callback, context) {
    for (var key in obj) { // eslint-disable-line guard-for-in
        callback.call(context, key, obj[key]);
    }
}

function addProp(name, hook) {
    // eslint-disable-next-line no-invalid-this
    Object.defineProperty(this, name, {
        enumerable: true,
        configurable: true,

        get: isFunction(hook) ?
            function() {
                return hook(this.originalEvent);
            } :
            function() {
                return this.originalEvent[name];
            },

        set: function(value) {
            Object.defineProperty(this, name, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            });
        }
    });
}

function isFunction(obj) {
    return "function" === typeof obj;
}

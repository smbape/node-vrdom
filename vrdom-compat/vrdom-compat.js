var vrdom = require("vrdom"),
    expando = vrdom.expando,
    functions = vrdom.functions,
    hasProp = functions.hasProp,
    inherits = functions.inherits,
    implement = functions.implement,
    appendHook = vrdom.hooks.appendHook,
    Component = vrdom.Component;

Object.defineProperty(Component.prototype, "_reactInternalInstance", {
    configurable: true, // the type of this property descriptor may be changed and if the property may be deleted from the corresponding object.
    enumerable: true, // this property shows up during enumeration of the properties on the corresponding object.
    get: function get() {
        if (!hasProp.call(this, expando) || !hasProp.call(this[expando], "vnode")) {
            return undefined;
        }
        return { _currentElement: this[expando].vnode.element };
    }
});

var isEqual = require("./isEqual");

// eslint-disable-next-line no-undef, no-magic-numbers
var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;

function reactElementHook(el) {
    el.$$typeof = REACT_ELEMENT_TYPE;
    return el;
}

appendHook("afterCreateElement", reactElementHook);

vrdom.isValidElement = function(object) {
    return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
};

var PureRenderMixin = {
    shouldComponentUpdate: function(nextProps, nextState) {
        return !isEqual(this.props, nextProps, true, 1) || !isEqual(this.state, nextState, true, 1);
    }
};

vrdom.PureRenderMixin = PureRenderMixin;

vrdom.PureComponent = PureComponent;

function PureComponent() {
    return PureComponent.__super__.constructor.apply(this, arguments);
}

inherits(PureComponent, Component);
implement(PureComponent, PureRenderMixin);
PureComponent.prototype.isPureReactComponent = true;

module.exports = vrdom;
var expando = require("../expando"),
    hasProp = require("./hasProp"),
    createChainedFunction = require("./createChainedFunction"),
    createMergedResultFunction = require("./createMergedResultFunction"),
    assign = require("./assign"),
    isValidElement = require("./isValidElement");

/// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
var translator = require("../messages/translator");
/// #endif

var OverrideAction = (function() {
    var index;
    index = 0;
    return {
        LAST_DEFINED: ++index,
        CHAIN_METHODS: ++index,
        MERGE_RESULTS: ++index
    };
})();

var ComponentInterface = {
    getInitialState: OverrideAction.MERGE_RESULTS,
    getChildContext: OverrideAction.MERGE_RESULTS,
    render: OverrideAction.LAST_DEFINED,
    componentWillMount: OverrideAction.CHAIN_METHODS,
    componentDidMount: OverrideAction.CHAIN_METHODS,
    componentWillReceiveProps: OverrideAction.CHAIN_METHODS,
    shouldComponentUpdate: OverrideAction.LAST_DEFINED,
    componentWillUpdate: OverrideAction.CHAIN_METHODS,
    componentDidUpdate: OverrideAction.CHAIN_METHODS,
    componentWillUnmount: OverrideAction.CHAIN_METHODS
};

var StaticProperties = {
    displayName: function(Constructor, displayName) {
        Constructor.displayName = displayName;
    },
    getDefaultProps: function(Constructor, getDefaultProps) {
        if (Constructor.getDefaultProps) {
            Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
        } else {
            Constructor.getDefaultProps = getDefaultProps;
        }
    },
    mixins: function(Constructor, mixins) {
        var i, len, mixin;
        if (mixins) {
            for (i = 0, len = mixins.length; i < len; i++) {
                mixin = mixins[i];
                implement(Constructor, mixin);
            }
        }
    },
    propTypes: function(Constructor, propTypes) {
        Constructor.propTypes = assign({}, Constructor.propTypes, propTypes);
    },
    contextTypes: function(Constructor, contextTypes) {
        Constructor.contextTypes = assign({}, Constructor.contextTypes, contextTypes);
    },
    childContextTypes: function(Constructor, childContextTypes) {
        Constructor.childContextTypes = assign({}, Constructor.childContextTypes, childContextTypes);
    },
    statics: function(Constructor, statics) {
        var name;
        for (name in statics) {
            if (hasProp.call(statics, name) && !hasProp.call(StaticProperties, name)) {
                Constructor[name] = statics[name];
            }
        }
    }
};

module.exports = implement;

function implement(Constructor, spec) {
    /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
    var msg;
    /// #endif

    if (spec === null || "object" !== typeof spec) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        if ("function" === typeof spec) {
            msg = translator.translate("errors.implement-function");
            throw new Error(msg);
        }
        msg = "Warning: " + translator.translate("errors.implement-null-or-not-object", spec);
        console.error(msg);
        /// #endif
        return;
    }

    if (isValidElement(spec)) {
        /// #if typeof NODE_ENV === "undefined" || NODE_ENV !== "production"
        msg = translator.translate("errors.element-as-mixin");
        throw new Error(msg);
        /// #else
        return; // eslint-disable-line no-useless-return
        /// #endif
    }

    var proto = Constructor.prototype,
        autobinds = proto[expando + "_autobinds"];

    // implement mixins first
    if (hasProp.call(spec, "mixins")) {
        StaticProperties.mixins(Constructor, spec.mixins);
    }

    var key, value;

    for (key in spec) {
        if (hasProp.call(spec, key)) {
            value = spec[key];
            // interface methods are implemented in another loop
            if (!hasProp.call(ComponentInterface, key)) {
                implementSpec(Constructor, spec, proto, autobinds, key, value);
            }
        }
    }

    // spec may be another prototype which has interface methods that are not enumerable
    for (key in ComponentInterface) {
        if (key in spec) {
            value = spec[key];
            implementSpec(Constructor, spec, proto, autobinds, key, value);
        }
    }
}

function implementSpec(Constructor, spec, proto, autobinds, key, value) {
    // mixins are implemented outside
    if (key === "mixins") {
        return;
    }

    if (hasProp.call(StaticProperties, key)) {
        StaticProperties[key](Constructor, value);
        return;
    }

    var isAlreadyDefined = hasProp.call(proto, key);

    // auto bind methods that are not in the interface
    if (spec.autobind !== false && autobinds && !hasProp.call(ComponentInterface, key)) {
        if ("function" === typeof value) {
            autobinds[key] = true;
        } else if (hasProp.call(autobinds, key)) {
            // a spec overrides an autobinded method with something that is not a function
            // remove previously autobinded method
            delete autobinds[key];
        }
    }

    // handle is already defined interface methods
    if (isAlreadyDefined && hasProp.call(ComponentInterface, key)) {
        var action = ComponentInterface[key];

        if (action === OverrideAction.MERGE_RESULTS) {
            proto[key] = createMergedResultFunction(proto[key], value);
            return;
        } else if (action === OverrideAction.CHAIN_METHODS) {
            proto[key] = createChainedFunction(proto[key], value);
            return;
        }
    }

    proto[key] = value;
}
var expando = require("./expando");
var uniqueId = require("./functions").uniqueId;

var Renderer;

module.exports = Component;

function Component(props, context) {
    this.id = uniqueId("Component");
    this.props = props;
    this.context = context;
    this.refs = {};
}

Component.prototype[expando + "_isComponent"] = true;

Component.prototype.setState = function(state, callback) {
    Renderer.updateState("setState", this, [state || {}], false, callback);
};

Component.prototype.forceUpdate = function(callback) {
    Renderer.updateState("forceUpdate", this, null, false, callback);
};

Renderer = require("./Renderer");
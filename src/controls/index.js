var hasEditableValue = require("../functions").hasEditableValue;

module.exports = {
    onChange: {
        input: controlInputOnChange,
        textarea: controlInputOnChange,
        select: controlSelectOnChange,
    },
    afterUpdates: {
        input: controlInputAfterUpdates,
        textarea: controlInputAfterUpdates,
        option: controlOptionAfterUpdates,
        select: controlSelectAfterUpdates
    }
};

var controlInputChecked = require("./controlInputChecked");
var controlInputValue = require("./controlInputValue");
var controlOptionSelected = require("./controlOptionSelected");
var controlSelectValue = require("./controlSelectValue");

function controlInputOnChange(type, props) {
    var control;
    var ref = props.type;

    if (type === "input" && (ref === "checkbox" || ref === "radio")) {
        control = controlInputChecked;
    } else if (hasEditableValue(type, props)) {
        control = controlInputValue;
    } else {
        return props.onChange;
    }

    if ("function" === typeof props.onChange) {
        return [props.onChange, control];
    }
    return control;
}

function controlSelectOnChange(type, props) {
    var control = controlSelectValue;
    if ("function" === typeof props.onChange) {
        return [props.onChange, control];
    }
    return control;
}

function controlInputAfterUpdates(vnode, domNode) {
    var props, ref;
    props = vnode.props;
    if (vnode.tagName === "input" && ((ref = props.type) === "checkbox" || ref === "radio")) {
        controlInputChecked({
            target: domNode,
            afterUpdates: true
        });
    } else if (hasEditableValue(vnode.tagName, props)) {
        controlInputValue({
            target: domNode,
            afterUpdates: true
        });
    }
    return vnode;
}

function controlOptionAfterUpdates(vnode, domNode) {
    controlOptionSelected({
        target: domNode,
        afterUpdates: true
    });
    return vnode;
}

function controlSelectAfterUpdates(vnode, domNode) {
    controlSelectValue({
        target: domNode,
        afterUpdates: true
    });
    return vnode;
}
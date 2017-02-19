var createStringTemplate = require("../functions/createStringTemplate");

var translations = {
    common: {
        "render-by": "This DOM node was rendered by `{0}`.",
        "check-render-of": "Check the render method of `{0}`.",
        "check-top-render-of": "Check the top-level render call using {0}.",
        "used-in": "It was used in `{0}`.",
        "created-in": "It was created in `{0}`."
    },
    errors: {
        "checkedLink-and-valueLink": "It is not allowed to set both checkedLink and valueLink props.",
        "checkedLink-and-value-or-onChange": "It is not allowed to set checkedLink prop and checked or onChange prop.",
        "valueLink-and-value-or-onChange": "It is not allowed to set valueLink prop and value or onChange prop.",
        "ref-without-owner": "Unable to attach a ref on a component element rendered outside a composite component",
        "implement-function": "A function cannot be used as a mixin. May be you wanted to use the prototype as mixin.",
        "implement-null-or-not-object": "Only not null typeof 'object' can be used as mixins. Given mixin: {0}.",
        "element-as-mixin": "A component element cannot be used a mixin. May be you wanted to use the element type prototype.",
        "findDOMNode-in-render": "`{0}` is calling `vrdom.findDOMNode()` on itself. DOM node may not be setted yet or may change after render.",
        "findDOMNode-invalid-argument": "vrdom.findDOMNode(...): Invalid argument. Only DOM node or composite components are accepted.",
        "findDOMNode-on-unmounted": "vrdom.findDOMNode(...): composite component is not mounted.",
        "invalid-container": "{0}: container is not a DOM node.",
        "render-invalid-element": "vrdom.render(): Invalid component element.",
        "render-string": "Perhaps you mean <{0} /> instead of '{0}'.",
        "render-function": "Perhaps you mean <{0} /> instead of {0}.",
        "is-mounted-in-render": "`{1}` is calling `{0}.isMounted()`. DOM node may not be setted yet or may change after render.",
        "stateless-set-ref": "A component element returned by a Stateless function cannot have a string ref.",
        "invalid-element": "{0}: Invalid element returned. Valid elements are null and objects created by vrdom.createElement.",
        "child-invalid-element": "Invalid child element {0}.",
        "value-without-control": "<{0}> element will behave as a read-only `value` element. " +
            "You should consider setting `readOnly` prop if it is your meaning. " +
            "Otherwise, set either `defaultValue` for intial `value` or " +
            "`onChange` to control `value`.",
        "checked-without-control": "<{0}> element will behave as a read-only `checked` element. " +
            "You should consider setting `readOnly` prop if it is your meaning. " +
            "Otherwise, set either `defaultChecked` for intial `checked` or " +
            "`onChange` to control `checked`.",
        "invalid-initialState": "{0}.getInitialState(): Invalid state returned. Expecting typeof 'object' and not Array.",
        "undefined-render-method": "vrdom.createClass(...): prototype has no `render` method.",
        "textarea-children": "Avoid adding children to <textarea>. Prefer using `defaultValue` or `value`.",
        "textarea-multiple-children": "<textarea> can only have at most one child.",
        "null-type": "{0}: Element type is null or undefined.",
        "invalid-type": "{0}: Element type is not a string nor a function.",
        "defaultProps-outside-createClass": "`{0}.getDefaultProps` can only be used in `vrdom.createClass(...)`. Use `{0}.defaultProps` instead.",
        "invalid-tag": "Invalid tag: {0}",
        "void-with-children": "<{0} /> cannot have `children` nor `dangerouslySetInnerHTML`.",
        "children-and-dangerouslySetInnerHTML": "You can only set one of `children` or `dangerouslySetInnerHTML`.",
        "editable-with-children": "`contentEditable` and `children` props are setted. This will lead to unpredictable behaviour if the user edit the content.",
        "invalid-style": "Expect style prop to be a key-value object.",
        "invalid-dangerouslySetInnerHTML": "`dangerouslySetInnerHTML` must be in the form `{__html: ...}`.",
        "props-innerHTML": "Directly setting property `innerHTML` is not permitted.",

        input: {
            "uncontrolled-to-controlled": "{1} elements should be either controlled or uncontrolled: {0} is changing from uncontrolled to controlled.",
            "controlled-to-uncontrolled": "{1} elements should be either controlled or uncontrolled: {0} is changing from controlled to uncontrolled.",
            "both-default": "{1} elements should be either controlled or uncontrolled: {0} has both `{3}` and `{4}` props.",
            "value-null": "`{1}` prop on `{0}` should not be null. Use undefined or '' to clear content.",
            "checked-null": "`{1}` prop on `{0}` should not be null. Use either true or false."
        },

        "mount-while-unmounting": "Trying to mount on a container in the middle of an unmounting process",
        "invalid-callback": "vrdom.render(...): Invalid callback. If provided, callback must be a function, but got `{0}`.",
        "childContextTypes-missing": "{0}.getChildContext(): childContextTypes must be defined in order to use getChildContext().",
        "childContextTypes-key": "{0}.getChildContext(): key \"{1}\" is not defined in childContextTypes.",
        "stateless-receive-ref": "{0} is a stateless component and cannot have refs.",

        "unique-key-prop": "Each child in an array or iterator should have a unique \"key\" prop.",
        "duplicate-key-prop": "{0}: duplicate child key prop `{1}`. Only the first child will be used.",
        "duplicate-prop": "{0} is normalized to the same prop as `{1}`. Only `{1}` will be used.",
        "duplicate-style": "{0} is normalized to the same style prop as `{1}`. `{0}` will be used.",
        "render-in-body": "vrdom.render(...): Rendering components directly into document.body is " +
            "discouraged, since its children are often manipulated by third-party " +
            "scripts and browser extensions. This may lead to subtle " +
            "reconciliation issues. Try rendering into a container element created " +
            "for your app.",
        "render-while-rendering": "vrdom.render(...): `vrdom.render(...)` cannot be nested in the render method of another component." +
            " If you really need to, consider using it in `componentDidMount` or `componentDidUpdate`.",
        "updating-during-render": "`{0}.{1}` during `{2}` will only be applied on next rendering cycle." +
            " If you intend to use the new state in render, do it in `componentWillMount` or `componentWillReceiveProps`." +
            " If you intend to use the new state on next render cycle, do it in `componentDidMount` or `componentDidUpdate`.",
        "updating-unmounted": "`{0}.{1}` is called on an unmounted `{0}`.",
        "component-super-no-props": "{0}(...): Avoid changing props in constructor since it will be overrided.",
        "component-super-no-context": "{0}(...): Avoid changing context in constructor since it will be overrided.",
        "shouldComponentUpdate-not-boolean": "{0}.shouldComponentUpdate(): Expecting true or false, but got `{1}`.",
        "componentDidUnmount": "`{0}.componentDidUnmount()` is not a known method. Did you mean `{0}.componentWillUnmount()`?",
        "rebind-context": "`{0}.{1}` is an auto-binded method: Binding the method to another context will not change the context.",
        "rebind-autobind": "`{0}.{1}` is an auto-binded method: There is no need for another bind.",
        "unkown-attribute": "For <{2}>, prefer using the interface property name `{1}` instead of `{0}`.",
        "invalid-attribute": "Invalid attribute name: `{0}`",
        "unexpected-option-child": "Only strings and numbers are supported as <option> children.",
        "option-selected": "Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>.",
        "map-as-children": "Be carefull when using Map like iterables. Children keys will be overrided by Map keys."
    }
};

function toStringTemplate(obj) {
    var value;

    // eslint-disable-next-line guard-for-in
    for (var key in obj) {
        value = obj[key];

        /* istanbul ignore next */
        switch (typeof value) { // eslint-disable-line default-case
            case "object":
                toStringTemplate(value);
                break;
            case "string":
                obj[key] = createStringTemplate(value);
                break;
        }
    }

    return obj;
}

module.exports = toStringTemplate(translations);
/** @jsx React.createElement */

/* eslint-env browser, es6, jasmine */
/* global preact:false, preactCompat: false, vrdom:false */
/* eslint-disable no-void, no-return-assign, class-methods-use-this */

var library = "preact";

var React, ReactDOM;

switch(library) {
  case "preact":
    preact.options.syncComponentUpdates = true;
    React = preactCompat;
    ReactDOM = preactCompat;
    break;

  case "react":
    React = window.React;
    ReactDOM = window.ReactDOM;
    break;

  default:
    React = vrdom;
    ReactDOM = vrdom;
}

function trigger(elem, name, props) {
  if (/^key/.test(name)) {
    // http://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key/10520017#10520017
    var oEvent = document.createEvent('KeyboardEvent');

    // Chromium Hack
    Object.defineProperty(oEvent, 'charCode', {
      get: function() {
        return this.keyCodeVal;
      }
    });
    Object.defineProperty(oEvent, 'keyCode', {
      get: function() {
        return this.keyCodeVal;
      }
    });
    Object.defineProperty(oEvent, 'which', {
      get: function() {
        return this.keyCodeVal;
      }
    });

    if (oEvent.initKeyboardEvent) {
      oEvent.initKeyboardEvent(name, true, true, document.defaultView, false, false, false, false, props, props);
    } else {
      oEvent.initKeyEvent(name, true, true, document.defaultView, false, false, false, false, props, 0);
    }

    oEvent.keyCodeVal = props;

    if (oEvent.keyCode !== props) {
      alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
    }

    elem.dispatchEvent(oEvent);
    return;
  }

  var nativeEvent = document.createEvent("Event");
  nativeEvent.initEvent(name, true, true);
  elem.dispatchEvent(nativeEvent);
}

var eventNames = {
  Change: true, // stop propagation fails in react
  Click: true,
  Copy: true,
  Cut: true,
  KeyDown: true,
  KeyPress: true,
  KeyUp: true,
  MouseDown: true,
  MouseMove: true,
  MouseOut: true,
  MouseOver: true,
  MouseUp: true,
  Paste: true,
  Scroll: true, // stop propagation fails in preact
  Wheel: true
};

var Triggers = (function(React) {
  var isEventSupported = React.functions && React.functions.isEventSupported || (function() {
    var globalDocument = document;
    var hasProp = Object.prototype.hasOwnProperty;

    // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
    var TAGNAMES = {
      "select": "input",
      "change": "input",
      "submit": "form",
      "reset": "form",
      "error": "img",
      "load": "img",
      "abort": "img"
    };

    return function isEventSupported(eventName) {
      var tagName = hasProp.call(TAGNAMES, eventName) ? TAGNAMES[eventName] : "div";
      var el = globalDocument.createElement(tagName);
      eventName = "on" + eventName;

      var isSupported = eventName in el;

      if (!isSupported) {
        el.setAttribute(eventName, "return;");
        isSupported = typeof el[eventName] === "function";
      }

      el = null;

      // https://connect.microsoft.com/IE/feedback/details/782835/missing-onwheel-attribute-for-the-wheel-event-although-its-supported-via-addeventlistener
      // https://github.com/nolimits4web/Swiper/blob/master/src/js/mousewheel.js
      if (!isSupported && eventName === "onwheel" &&
        globalDocument.implementation &&
        globalDocument.implementation.hasFeature &&
        // always returns true in newer browsers as per the standard.
        // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
        globalDocument.implementation.hasFeature("", "") !== true) {
        // This is the only way to test support for the `wheel` event in IE9+.
        isSupported = globalDocument.implementation.hasFeature("Events.wheel", "3.0");
      }

      return isSupported;
    };    
  }());

  // detect available wheel event
  var support = isEventSupported("wheel") ? "wheel" : // Modern browsers support "wheel"
    isEventSupported("mousewheel") ? "mousewheel" : // Webkit and IE support at least "mousewheel"
      "DOMMouseScroll"; // let"s assume that remaining browsers are older Firefox

  eventNames.Wheel = {
    eventType: support
  };

  var expando = React.expando;
  var hasProp = Object.prototype.hasOwnProperty;
  var hasEditableValue = React.functions && React.functions.hasEditableValue || (function() {
    // http://www.w3schools.com/tags/att_input_type.asp
    var inputTypesWithEditableValue = {
      "color": true,
      "date": true,
      "datetime": true,
      "datetime-local": true,
      "email": true,
      "month": true,
      "number": true,
      "password": true,
      "range": true,
      "search": true,
      "tel": true,
      "text": true,
      "time": true,
      "url": true,
      "week": true
    };

    return function hasEditableValue(type, props) {
      switch (type) {
        case "textarea":
        case "select":
          return true;
        case "input":
          return props.type == null || hasProp.call(inputTypesWithEditableValue, props.type);
        default:
          return false;
      }
    };
  }());

  var Triggers = {};

  function _trigger(name, domNode) {
    var currentVNode, parentNode, ref, tagName, toRemove;
    if (name === "change") {
      tagName = domNode.tagName && domNode.tagName.toLowerCase();
      if (tagName === "select" || tagName === "input" && domNode.type === "file") {
        name = "change";
      } else if (hasEditableValue(tagName, domNode)) {
        name = "input";
      } else if (tagName === "input" && ((ref = domNode.type) === "checkbox" || ref === "radio")) {
        name = "click";
      }
    }

    if (domNode !== window) {
      if (!document.body.contains(domNode)) {
        toRemove = true;
        parentNode = domNode;
        while (parentNode.parentNode) {
          parentNode = parentNode.parentNode;
        }
        document.body.appendChild(parentNode);
      }

      if (hasProp.call(domNode, expando)) {
        currentVNode = domNode[expando].currentElement;
      }
    }

    trigger(domNode, name, "E".charCodeAt(0));

    if (toRemove) {
      if (parentNode) {
        domNode = parentNode;
      } else if (currentVNode) {
        domNode = ReactDOM.findDOMNode(currentVNode.key);
      }
      domNode.parentNode.removeChild(domNode);
    }
  }

  var evConfig, eventType;

  for (var name in eventNames) { // eslint-disable-line guard-for-in
    evConfig = eventNames[name];
    name = name.toLowerCase();
    if (evConfig === true) {
      eventType = name;
    } else {
      eventType = evConfig.eventType;
    }
    Triggers[name] = _trigger.bind(null, eventType);
  }

  return Triggers;
}(React));

describe(library, () => {
  it("should create DOM element", () => {
    var element = <div />;
    var domNode = ReactDOM.render(element, document.createElement("div"));
    expect(domNode.tagName).toBe("DIV");
  });

  it("should unmount DOM node", () => {
    var container = document.createElement("div");

    void ReactDOM.render(<div><span><e>text</e><p>another text</p></span><br/></div>, container);
    expect(container.childNodes.length).toBe(1);
    ReactDOM.unmountComponentAtNode(container);
    expect(container.childNodes.length).toBe(0); // unmount should leave node empty
  });

  it("should unmount DOM node after changes", (done) => {
    var SwapComponent = React.createClass({
      getInitialState() {
        return { activated: true };
      },

      swap(evt) {
        evt.preventDefault();
        this.setState({
          activated: !this.state.activated
        });
      },

      render() {
        if (this.state.activated) {
          return <a onClick={ this.swap }>anchor</a>;
        }

        return <b onClick={ this.swap }>bold</b>;
      }
    });

    var container = document.createElement("div");
    document.body.appendChild(container);

    var instance = ReactDOM.render(<SwapComponent />, container);
    var el = ReactDOM.findDOMNode(instance);

    setTimeout(function() {
      trigger(el, "click");
      el = null;
      setTimeout(function() {
        ReactDOM.unmountComponentAtNode(container);
        expect(container.innerHTML).toBe("");
        container = null;
        done();
      }, 2);
    }, 2);
  });

  it("should change ref string when Component changes", () => {
    class Component extends React.Component {
      constructor(props) {
        super(props);
        this.state = {};
      }

      render() {
        if (this.state.a) {
          return <a ref="node" />;
        }

        if (this.props.b) {
          return <b ref="node" />;
        }

        return <div ref="node" />;
      }
    }

    var container = document.createElement("div");
    var instance = ReactDOM.render(<Component />, container);
    expect(instance.refs.node).toBe(container.firstChild);
    expect(container.firstChild.tagName).toBe("DIV");

    ReactDOM.render(<Component b={ true } />, container);
    expect(instance.refs.node).toBe(container.firstChild); // on preact@7.2.0 , refs.node remains null. how can i trust ref now?
    expect(container.firstChild.tagName).toBe("B");

    instance.setState({ a: true });
    expect(instance.refs.node).toBe(container.firstChild);
    expect(container.firstChild.tagName).toBe("A");
  });

  it("should call ref on ref change", () => {
    var domNode1, domNode2;
    var container = document.createElement("div");
    ReactDOM.render(<div ref={(node) => domNode1 = node} />, container);
    ReactDOM.render(<div ref={(node) => domNode2 = node} />, container);

    // on preact@7.2.0, domNode1 is still defined.
    // When there is a new ref function, previous ref should be notified of the change.
    // There may be stuff to undo.
    expect(domNode1).toBe(null);
    expect(domNode2).toBe(container.firstChild);
  });

  it("should call child ref function with null when unmounting", () => {
    var preserved = {};
    var domNode;
    var child;

    function setChildRef(instance) {
      child = instance;
    }

    function setNodeRef(node) {
      domNode = node;
    }

    class Child extends React.Component {
      render() {
        return this.props.unmount ? null : <div ref={ setNodeRef } />;
      }
    }

    class Parent extends React.Component {
      render() {
        return <Child preserved={ preserved } unmount={ this.props.unmount } ref={ setChildRef } />;
      }
    }

    var container = document.createElement("div");
    void ReactDOM.render(<Parent />, container);
    ReactDOM.render(<Parent unmount={ true } />, container);

    expect(child).toEqual(jasmine.any(Child));
    expect(child.props.preserved).toBe(preserved);
    expect(domNode).toBe(null);

    ReactDOM.unmountComponentAtNode(container);
    expect(child).toBe(null); // on preact@7.2.0 Child is still defined. There may be stuff to undo.
    expect(domNode).toBe(null);
  });

  it("should always update if shouldComponentUpdate is not defined", () => {
    var childRenders = 0;

    class Child extends React.Component {
      shouldComponentUpdate() {
        return true;
      }

      render() {
        childRenders++;
        return <div />;
      }
    }

    var parentRenders = 0;

    class Parent extends React.Component {
      render() {
        parentRenders++;
        return <div>{ this.props.children }</div>;
      }
    }

    var child = <Child />;

    var container = document.createElement("div");
    ReactDOM.render(<div><Parent>{ child }</Parent></div>, container);
    expect(parentRenders).toBe(1);
    expect(childRenders).toBe(1);

    var parent = <div><Parent>{ child }</Parent></div>;

    ReactDOM.render(parent, container);
    expect(parentRenders).toBe(2); // on preact@7.2.0 got 1. Unexpected since there is no shouldComponentUpdate
    expect(childRenders).toBe(1); // For performance, there are no update if the element did not change

    ReactDOM.render(parent, container);
    expect(parentRenders).toBe(2); // on preact@7.2.0 got 3. Unexpected
    expect(childRenders).toBe(1); // on preact@7.2.0 got 3. Unexpected
  });

  it("should return null on unmounted components during render process", () => {
    class Component extends React.Component {
      componentWillMount() {
        expect(ReactDOM.findDOMNode(this)).toBe(null); // on preact@7.2.0 got somehting. Unexpected.
      }

      render() {
        return <div/>;
      }
    }

    var container = document.createElement("div");
    var instance = ReactDOM.render(<Component />, container);
    var domNode = ReactDOM.findDOMNode(instance);
    expect(domNode).toBe(container.firstChild);
  });

  it("should not throw when unmounting already unmounting", () => {
    var logs = [];

    class Child extends React.Component {
      componentWillUnmount() {
        logs.push("Child componentWillUnmount");
        expect(ReactDOM.findDOMNode(this).nodeName).toBe("DIV");
        this.props.parent.setState({ child: true });
      }

      render() {
        return <div />;
      }
    }

    class Parent extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.state = { child: true };
      }

      componentWillUnmount() {
        logs.push("Parent componentWillUnmount");
        expect(ReactDOM.findDOMNode(this).nodeName).toBe("DIV");
      }

      render() {
        return this.state.child ? <Child parent={ this } /> : null;
      }
    }

    var container = document.createElement("div");
    var instance = ReactDOM.render(<Parent />, container);
    expect(() => {
      instance.setState({child: false});
      ReactDOM.unmountComponentAtNode(container);
    }).not.toThrow();

    expect(logs).toEqual([
      "Child componentWillUnmount", // on preact@7.2.0 , it nerver get called.
      "Parent componentWillUnmount",
      "Child componentWillUnmount"
    ]);
  });

  it("should call and not be unmounted in componentWillUnmount", () => {
    // componentWillUnmount should undo
    // what has been done in componentDidMount/componentDidUpdate
    // therefore, it should receive the DOM node as it was after componentDidMount/componentDidUpdate
    // .i.e still contained in container
    // material-design-lite for example expect DOM node to be still attached to container
    // in order to perform its destruction

    var container = document.createElement("div");
    var logs = [];

    class Child extends React.Component {
      componentWillUnmount() {
        logs.push("Child componentWillUnmount");
        var domNode = ReactDOM.findDOMNode(this);
        expect(domNode.parentNode.parentNode.parentNode).toBe(container);
        expect(domNode.nodeName).toBe("DIV");
      }

      render() {
        return <div />;
      }
    }

    class Parent extends React.Component {
      componentWillUnmount() {
        logs.push("Parent componentWillUnmount");
        var domNode = ReactDOM.findDOMNode(this);
        expect(domNode.parentNode.parentNode).toBe(container);
        expect(domNode.nodeName).toBe("DIV");
      }

      render() {
        return <div><Child /></div>;
      }
    }

    class GrandParent extends React.Component {
      componentWillUnmount() {
        logs.push("GrandParent componentWillUnmount");
        var domNode = ReactDOM.findDOMNode(this);
        expect(domNode.parentNode).toBe(container);
        expect(domNode.nodeName).toBe("DIV");
      }

      render() {
        return <div><Parent /></div>;
      }
    }

    ReactDOM.render(<GrandParent />, container);
    expect(container.childNodes.length).toBe(1);
    ReactDOM.unmountComponentAtNode(container);
    expect(container.childNodes.length).toBe(0);
    expect(logs).toEqual([
      "GrandParent componentWillUnmount",
      "Parent componentWillUnmount",
      "Child componentWillUnmount",
    ]);
  });

  it("should unregister event on DOM element ", () => {
    var count, props, domNode;
    var container = document.createElement("div");
    var tagName;

    for (var name in eventNames) {
      count = 0;
      props = {};
      props["on" + name] = increase;
      tagName = name === "Change" || name === "KeyPress" ? "input" : "div";

      ReactDOM.render(React.createElement(tagName, props), container);
      domNode = container.firstChild; // hack due to preact-compat@3.13.1 failure to return a domNode on render
      Triggers[name.toLowerCase()](domNode);
      if (count !== 1) {
        expect(name).toBe("handled");
      } else {
        expect(count).toBe(1);
      }

      // removing listener should unregister event
      ReactDOM.render(React.createElement(tagName, null), container);
      Triggers[name.toLowerCase()](domNode);
      expect(count).toBe(1);

      // re-adding listener should re-register event
      ReactDOM.render(React.createElement(tagName, props), container);
      Triggers[name.toLowerCase()](domNode);
      expect(count).toBe(2);

      // unmounting component should unregister event
      ReactDOM.unmountComponentAtNode(container);
      Triggers[name.toLowerCase()](domNode);
      expect(count).toBe(2);

      domNode = null;
    }

    function increase() {
      count++;
    }
  });

  it("should not mess up with component properties", (done) => {
    var rendered = 0;
    var hasProp = Object.prototype.hasOwnProperty;

    class Component extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.id = 1;
      }

      shouldComponentUpdate() {
        return this.refs.div.nodeName === "DIV";
      }

      render() {
        rendered++;
        return <div ref="div">text</div>;
      }

      componentWillUnmount() {
        // Javascript has no "private" properties nor methods.  
        // The best you can do is to define a generated random property, non enumerable and put all your stuff in that property.  
        // Something similar is done in jQuery and React.

        // id is created by this Component
        // props, refs is created by react
        // it is not necessary to preserve _reactInternalInstance for this test
        // however, since react chooses to hide their stuff in it, I keep it

        for (var prop in this) {
          if (!hasProp.call(this, prop)){
            continue;
          }
          if (!/^(?:id|props|refs|_reactInternalInstance)$/.test(prop)) {
            delete this[prop];
          }
        }
      }
    }

    var container = document.createElement("div");
    var instance;

    ReactDOM.render(<div><Component ref={ component => instance = component }/></div>, container);
    instance.setState({ a: 0 });
    ReactDOM.unmountComponentAtNode(container);

    setTimeout(() => {
      expect(rendered).toBe(2);
      expect(container.innerHTML).toBe("");
      done();
    }, 2);

  });

  it("should not messup with component properties 2", () => {
    class Component extends React.Component {
      render() {
        return <div>text</div>;
      }
    }

    // this is critical,
    // I won't change my code to deal with preact details of implementation
    // jQuery, React use a generated key to keep their things separated
    // from any existing code
    Component.prototype.base = "/base/";

    var container = document.createElement("div");
    var instance = ReactDOM.render(<Component />, container);
    expect(instance.base).toBe("/base/");
  });

});
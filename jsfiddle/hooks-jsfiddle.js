/** @jsx vrdom.createElement */

class MDLComponent extends vrdom.Component {
  componentDidMount() {
    this.el = vrdom.findDOMNode(this);
    componentHandler.upgradeElement(this.el);
  }

  componentWillUnmount() {
    componentHandler.downgradeElements([this.el]);
    delete this.el;
  }

  render() {
    var tagName = this.props.tagName || "span";
    var args = [tagName, this.props.config];

    // add children
    var children = this.props.children;
    if (Array.isArray(children)) {
      args.push.apply(args, children);
    } else if (children != null) {
      args.push(children);
    }

    // create the node,
    // upgrade on mount,
    // downgrage on unmount
    return vrdom.createElement.apply(vrdom, args);
  }
}

function MDLMiddleware(args) {
  var type = args[0];
  var config = args[1];

  if (config && !config.mdlIgnore && "string" === typeof type && /(?:^|\s)mdl-/.test(config.className || config.class)) {
    args[0] = MDLComponent; // replace element type with MDLComponent

    args[1] = {
      key: config.key, // preserve key
      ref: config.ref, // preserve ref
      tagName: type,
      config: vrdom.functions.assign({}, config) // clone because we will modify config
    };

    // ignore MDLMiddleware when creating element in MDLComponent
    // and thus avoiding a stack overflow
    args[1].config.mdlIgnore = true;

    delete args[1].config.key; // key has been used
    delete args[1].config.ref; // ref has been used
  }

  return args;
}

/* Tell vrdom to call MDLMiddleware before creating any element */
vrdom.hooks.appendHook("beforeCreateElement", MDLMiddleware);

/* From this point, any DOM element created with a className starting with mdl-, will be an MDLComponent */

/* use createClass to get autobindings */
var MDLElement = vrdom.createClass({
  handleClick(evt) {
    evt.preventDefault();
    var button = vrdom.findDOMNode(this.refs.button);
    alert(button.type + " click");
  },

  render() {
    return (
      <div className="container material-design-lite-components">
        {/* Badges */}
        <div className="container">
          {/* Number badge on icon */}
          <div className="material-icons mdl-badge mdl-badge--overlap" data-badge={1}>account_box</div>
          {/* Icon badge on icon */}
          <div className="material-icons mdl-badge mdl-badge--overlap" data-badge="♥">account_box</div>
        </div>

        {/* Buttons */}
        <button
          type="button" ref="button" onClick={ this.handleClick }
          className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
        >
          Button
        </button>
      </div>
    );
  }
});

var container = document.createElement("div");
document.body.appendChild(container);
vrdom.render(<MDLElement />, container);

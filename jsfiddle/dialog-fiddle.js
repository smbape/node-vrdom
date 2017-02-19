/** @jsx React.createElement */

class MDLComponent extends React.Component {
  componentDidMount() {
    this.el = ReactDOM.findDOMNode(this);
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
    return React.createElement.apply(React, args);
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
      config: Object.assign({}, config) // clone because we will modify config
    };

    // ignore MDLMiddleware when creating element in MDLComponent
    // and thus avoiding a stack overflow
    args[1].config.mdlIgnore = true;

    delete args[1].config.key; // key has been used
    delete args[1].config.ref; // ref has been used
  } else if (config && config.mdlIgnore) {
    delete config.mdlIgnore;
  }

  return args;
}

(function() {
  var createElement = React.createElement;
  var slice = Array.prototype.slice;

  React.createElement = function() {
    var args = MDLMiddleware(slice.call(arguments));
    return createElement.apply(React, args);
  };
}());

/* From this point, any DOM element created with a className starting with mdl-, will be an MDLComponent */

var Dialog = React.createClass({
  showModal(evt) {
    this.props.onOpen();
  },

  closeModal(evt) {
    this.props.onClose();
  },

  componentDidMount() {
    this.dialog = ReactDOM.findDOMNode(this.refs.dialog);
    this.updateModalState();
  },

  componentDidUpdate() {
    this.updateModalState();
  },

  updateModalState() {
    if (this.props.open) {
      this.dialog.showModal();
    } else {
      this.dialog.close();
    }
  },

  render() {
    return (
      <div>
        <button id="show-dialog" type="button" className="mdl-button" onClick={ this.showModal }>Show Dialog</button>
        <dialog ref="dialog" className="mdl-dialog">
          <h4 className="mdl-dialog__title">Allow data collection?</h4>
          <div className="mdl-dialog__content">
            <p>
              Allowing us to collect data will let us get you the information you want faster.
            </p>
          </div>
          <div className="mdl-dialog__actions">
            <button type="button" className="mdl-button">Agree</button>
            <button type="button" className="mdl-button close" onClick={ this.closeModal }>Disagree</button>
          </div>
        </dialog>
      </div>
    );
  }
});

var MDLElement = React.createClass({
  getInitialState() {
    return { show: true, open: false };
  },

  onOpen() {
    this.setState({ show: true, open: true });
  },

  onClose() {
    this.setState({ show: false, open: false });
  },

  render() {
    if(this.state.show) {
      return <Dialog open={ this.state.open } onClose={ this.onClose } onOpen={ this.onOpen } />;
    }

    return <button id="show-dialog" type="button" className="mdl-button" onClick={ this.onOpen }>Show Dialog</button>;
  }
});

var container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<MDLElement />, container);

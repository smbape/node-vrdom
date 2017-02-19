# vrdom

An alternative to react production build for browser side.

What works and **documented** on react in production should work with vrdom.

## Usage with transpilers

### babel inline configuration

```javascript
/** @jsx vrdom.createElement */

var vrdom = require("vrdom");
```

### babel6 .babelrc configuration

```javascripton
{
  "plugins": [
    ["transform-react-jsx", { "pragma": "vrdom.createElement" }]
  ]
}
```

### Example

[jsfiddle](https://jsfiddle.net/smbape/adz7cgz4/)

```javascript
/** @jsx vrdom.createElement */

let container = document.createElement("div");
document.body.appendChild(container);

class Component extends vrdom.Component {
  render() {
    return <div>COMPONENT</div>;
  }
}

let ComponentClass = vrdom.createClass({
  render() {
    return <div>COMPONENT CLASS</div>;
  }
});

function Stateless() {
  return <div>STATELESS COMPONENT</div>;
}

vrdom.render(
  <div>
    <div>DOM</div>
    <Component />
    <ComponentClass />
    <Stateless />
  </div>
, container);
```

## What is not in vrdom

  - **Proptypes**: Although it may help for development,  
    there are not used in production build of neither React nor Preact.
    However, empty proptypes exists to keep compatibility with existing react plugins.
  - **Warnings**: missing almost all React warings. ex: on aria-* and others. Again not used in production build
  - **Developper Tool**
  - **Performance Tool**
  - **Addons**
  - **Undocumented react api** unstable_\*

## Hooks

Third party libraries can sometimes be painful to integrate with react.  
Hooks were created for that purpose.

For example, to integrate [material design lite](https://getmdl.io/index.html)(MDL), some libraries specific to react have been created.  
To use MDL, reading MDL documetion is not enough, you also need to read those libraries specific to react.

With hooks, to integrate MDL, you can do

[jsfiddle](https://jsfiddle.net/smbape/tau61vvn/)

```javascript
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
```

## HTML Attribtes

IDL Attributes and their HTML Attributescounter parts can be used.

Most attributes are case insensitive like in HTML.

`data-*`, `aria-*`, `on*` attributes are case insensitive.

Here is the list of all supported attributes:

| IDL Attribute              | HTML Attribute               | Comment                    |
|----------------------------|------------------------------|----------------------------|
| aLink                      | alink                        | Attribute case insensitive |
| abbr                       | abbr                         | Attribute case insensitive |
| accept                     | accept                       | Attribute case insensitive |
| acceptCharset              | accept-charset               | Attribute case insensitive |
| accessKey                  | accesskey                    | Attribute case insensitive |
| action                     | action                       | Attribute case insensitive |
| align                      | align                        | Attribute case insensitive |
| allowFullscreen            | allowfullscreen              | Attribute case insensitive |
| allowTransparency          | allowtransparency            | Attribute case insensitive |
| alt                        | alt                          | Attribute case insensitive |
| archive                    | archive                      | Attribute case insensitive |
| async                      | async                        | Attribute case insensitive |
| autocomplete               | autocomplete                 | Attribute case insensitive |
| autofocus                  | autofocus                    | Attribute case insensitive |
| autoplay                   | autoplay                     | Attribute case insensitive |
| axis                       | axis                         | Attribute case insensitive |
| background                 | background                   | Attribute case insensitive |
| behavior                   | behavior                     | Attribute case insensitive |
| bgColor                    | bgcolor                      | Attribute case insensitive |
| border                     | border                       | Attribute case insensitive |
| borderColor                | bordercolor                  | Attribute case insensitive |
| bottomMargin               | bottommargin                 | Attribute case insensitive |
| capture                    | capture                      | Attribute case insensitive |
| cellPadding                | cellpadding                  | Attribute case insensitive |
| cellSpacing                | cellspacing                  | Attribute case insensitive |
| ch                         | char                         | Attribute case insensitive |
| chOff                      | charoff                      | Attribute case insensitive |
| challenge                  | challenge                    | Attribute case insensitive |
| charset                    | charset                      | Attribute case insensitive |
| checked                    | checked                      | Attribute case insensitive |
| cite                       | cite                         | Attribute case insensitive |
| classId                    | classid                      | Attribute case insensitive |
| className                  | class                        | Attribute case insensitive |
| clear                      | clear                        | Attribute case insensitive |
| code                       | code                         | Attribute case insensitive |
| codeBase                   | codebase                     | Attribute case insensitive |
| codeType                   | codetype                     | Attribute case insensitive |
| colSpan                    | colspan                      | Attribute case insensitive |
| color                      | color                        | Attribute case insensitive |
| cols                       | cols                         | Attribute case insensitive |
| compact                    | compact                      | Attribute case insensitive |
| content                    | content                      | Attribute case insensitive |
| contentEditable            | contenteditable              | Attribute case insensitive |
| contextMenu                | contextmenu                  | Attribute case insensitive |
| controls                   | controls                     | Attribute case insensitive |
| coords                     | coords                       | Attribute case insensitive |
| crossOrigin                | crossorigin                  | Attribute case insensitive |
| data                       | data                         | Attribute case insensitive |
| dataFld                    | datafld                      | Attribute case insensitive |
| dataFormatas               | dataformatas                 | Attribute case insensitive |
| dataPageSize               | datapagesize                 | Attribute case insensitive |
| dataSrc                    | datasrc                      | Attribute case insensitive |
| dateTime                   | datetime                     | Attribute case insensitive |
| declare                    | declare                      | Attribute case insensitive |
| default                    | default                      | Attribute case insensitive |
| defer                      | defer                        | Attribute case insensitive |
| dir                        | dir                          | Attribute case insensitive |
| dirName                    | dirname                      | Attribute case insensitive |
| direction                  | direction                    | Attribute case insensitive |
| disabled                   | disabled                     | Attribute case insensitive |
| download                   | download                     | Attribute case insensitive |
| draggable                  | draggable                    | Attribute case insensitive |
| enctype                    | enctype                      | Attribute case insensitive |
| event                      | event                        | Attribute case insensitive |
| face                       | face                         | Attribute case insensitive |
| formAction                 | formaction                   | Attribute case insensitive |
| formEnctype                | formenctype                  | Attribute case insensitive |
| formMethod                 | formmethod                   | Attribute case insensitive |
| formNoValidate             | formnovalidate               | Attribute case insensitive |
| formTarget                 | formtarget                   | Attribute case insensitive |
| frame                      | frame                        | Attribute case insensitive |
| frameBorder                | frameborder                  | Attribute case insensitive |
| frameSpacing               | framespacing                 | Attribute case insensitive |
| height                     | height                       | Attribute case insensitive |
| hidden                     | hidden                       | Attribute case insensitive |
| high                       | high                         | Attribute case insensitive |
| href                       | href                         | Attribute case insensitive |
| hreflang                   | hreflang                     | Attribute case insensitive |
| hspace                     | hspace                       | Attribute case insensitive |
| htmlFor                    | for                          | Attribute case insensitive |
| httpEquiv                  | http-equiv                   | Attribute case insensitive |
| icon                       | icon                         | Attribute case insensitive |
| id                         | id                           | Attribute case insensitive |
| inputMode                  | inputmode                    | Attribute case insensitive |
| isMap                      | ismap                        | Attribute case insensitive |
| keytype                    | keytype                      | Attribute case insensitive |
| kind                       | kind                         | Attribute case insensitive |
| label                      | label                        | Attribute case insensitive |
| lang                       | lang                         | Attribute case insensitive |
| language                   | language                     | Attribute case insensitive |
| leftMargin                 | leftmargin                   | Attribute case insensitive |
| link                       | link                         | Attribute case insensitive |
| loop                       | loop                         | Attribute case insensitive |
| low                        | low                          | Attribute case insensitive |
| lowsrc                     | lowsrc                       | Attribute case insensitive |
| manifest                   | manifest                     | Attribute case insensitive |
| marginHeight               | marginheight                 | Attribute case insensitive |
| marginTop                  | margintop                    | Attribute case insensitive |
| marginWidth                | marginwidth                  | Attribute case insensitive |
| max                        | max                          | Attribute case insensitive |
| maxLength                  | maxlength                    | Attribute case insensitive |
| media                      | media                        | Attribute case insensitive |
| menu                       | menu                         | Attribute case insensitive |
| method                     | method                       | Attribute case insensitive |
| methods                    | methods                      | Attribute case insensitive |
| min                        | min                          | Attribute case insensitive |
| minLength                  | minlength                    | Attribute case insensitive |
| multiple                   | multiple                     | Attribute case insensitive |
| muted                      | muted                        | Attribute case insensitive |
| name                       | name                         | Attribute case insensitive |
| noHref                     | nohref                       | Attribute case insensitive |
| noResize                   | noresize                     | Attribute case insensitive |
| noShade                    | noshade                      | Attribute case insensitive |
| noValidate                 | novalidate                   | Attribute case insensitive |
| noWrap                     | nowrap                       | Attribute case insensitive |
| nonce                      | nonce                        | Attribute case insensitive |
| object                     | object                       | Attribute case insensitive |
| open                       | open                         | Attribute case insensitive |
| optimum                    | optimum                      | Attribute case insensitive |
| pattern                    | pattern                      | Attribute case insensitive |
| placeholder                | placeholder                  | Attribute case insensitive |
| poster                     | poster                       | Attribute case insensitive |
| preload                    | preload                      | Attribute case insensitive |
| profile                    | profile                      | Attribute case insensitive |
| radiogroup                 | radiogroup                   | Attribute case insensitive |
| readOnly                   | readonly                     | Attribute case insensitive |
| rel                        | rel                          | Attribute case insensitive |
| required                   | required                     | Attribute case insensitive |
| rev                        | rev                          | Attribute case insensitive |
| reversed                   | reversed                     | Attribute case insensitive |
| rightMargin                | rightmargin                  | Attribute case insensitive |
| rowSpan                    | rowspan                      | Attribute case insensitive |
| rows                       | rows                         | Attribute case insensitive |
| rules                      | rules                        | Attribute case insensitive |
| sandbox                    | sandbox                      | Attribute case insensitive |
| scheme                     | scheme                       | Attribute case insensitive |
| scope                      | scope                        | Attribute case insensitive |
| scrollAmount               | scrollamount                 | Attribute case insensitive |
| scrollDelay                | scrolldelay                  | Attribute case insensitive |
| scrolling                  | scrolling                    | Attribute case insensitive |
| selected                   | selected                     | Attribute case insensitive |
| shape                      | shape                        | Attribute case insensitive |
| size                       | size                         | Attribute case insensitive |
| sizes                      | sizes                        | Attribute case insensitive |
| slot                       | slot                         | Attribute case insensitive |
| span                       | span                         | Attribute case insensitive |
| spellcheck                 | spellcheck                   | Attribute case insensitive |
| src                        | src                          | Attribute case insensitive |
| srcdoc                     | srcdoc                       | Attribute case insensitive |
| srclang                    | srclang                      | Attribute case insensitive |
| srcset                     | srcset                       | Attribute case insensitive |
| standby                    | standby                      | Attribute case insensitive |
| start                      | start                        | Attribute case insensitive |
| step                       | step                         | Attribute case insensitive |
| style                      | style                        | Attribute case insensitive |
| summary                    | summary                      | Attribute case insensitive |
| tabIndex                   | tabindex                     | Attribute case insensitive |
| target                     | target                       | Attribute case insensitive |
| text                       | text                         | Attribute case insensitive |
| title                      | title                        | Attribute case insensitive |
| translate                  | translate                    | Attribute case insensitive |
| trueSpeed                  | truespeed                    | Attribute case insensitive |
| type                       | type                         | Attribute case insensitive |
| typeMustMatch              | typemustmatch                | Attribute case insensitive |
| urn                        | urn                          | Attribute case insensitive |
| useMap                     | usemap                       | Attribute case insensitive |
| vAlign                     | valign                       | Attribute case insensitive |
| vLink                      | vlink                        | Attribute case insensitive |
| value                      | value                        | Attribute case insensitive |
| valueType                  | valuetype                    | Attribute case insensitive |
| version                    | version                      | Attribute case insensitive |
| vspace                     | vspace                       | Attribute case insensitive |
| width                      | width                        | Attribute case insensitive |
| wrap                       | wrap                         | Attribute case insensitive |
| accentHeight               | accent-height                | Attribute case insensitive |
| accumulate                 | accumulate                   | Attribute case insensitive |
| additive                   | additive                     | Attribute case insensitive |
| alignmentBaseline          | alignment-baseline           | Attribute case insensitive |
| alphabetic                 | alphabetic                   | Attribute case insensitive |
| amplitude                  | amplitude                    | Attribute case insensitive |
| arabicForm                 | arabic-form                  | Attribute case insensitive |
| ascent                     | ascent                       | Attribute case insensitive |
| attributeName              | attributeName                |                            |
| attributeType              | attributeType                |                            |
| azimuth                    | azimuth                      | Attribute case insensitive |
| baseFrequency              | baseFrequency                |                            |
| baseProfile                | baseProfile                  |                            |
| baselineShift              | baseline-shift               | Attribute case insensitive |
| bbox                       | bbox                         | Attribute case insensitive |
| begin                      | begin                        | Attribute case insensitive |
| bias                       | bias                         | Attribute case insensitive |
| bufferedRendering          | buffered-rendering           | Attribute case insensitive |
| by                         | by                           | Attribute case insensitive |
| calcMode                   | calcMode                     |                            |
| capHeight                  | cap-height                   | Attribute case insensitive |
| clip                       | clip                         | Attribute case insensitive |
| clipPath                   | clip-path                    | Attribute case insensitive |
| clipRule                   | clip-rule                    | Attribute case insensitive |
| clipPathUnits              | clipPathUnits                |                            |
| colorInterpolation         | color-interpolation          | Attribute case insensitive |
| colorInterpolationFilters  | color-interpolation-filters  | Attribute case insensitive |
| colorProfile               | color-profile                | Attribute case insensitive |
| colorRendering             | color-rendering              | Attribute case insensitive |
| contentScriptType          | contentScriptType            |                            |
| contentStyleType           | contentStyleType             |                            |
| cursor                     | cursor                       | Attribute case insensitive |
| cx                         | cx                           | Attribute case insensitive |
| cy                         | cy                           | Attribute case insensitive |
| d                          | d                            | Attribute case insensitive |
| descent                    | descent                      | Attribute case insensitive |
| diffuseConstant            | diffuseConstant              |                            |
| display                    | display                      | Attribute case insensitive |
| divisor                    | divisor                      | Attribute case insensitive |
| dominantBaseline           | dominant-baseline            | Attribute case insensitive |
| dur                        | dur                          | Attribute case insensitive |
| dx                         | dx                           | Attribute case insensitive |
| dy                         | dy                           | Attribute case insensitive |
| edgeMode                   | edgeMode                     |                            |
| elevation                  | elevation                    | Attribute case insensitive |
| enableBackground           | enable-background            | Attribute case insensitive |
| end                        | end                          | Attribute case insensitive |
| exponent                   | exponent                     | Attribute case insensitive |
| externalResourcesRequired  | externalResourcesRequired    |                            |
| fill                       | fill                         | Attribute case insensitive |
| fillOpacity                | fill-opacity                 | Attribute case insensitive |
| fillRule                   | fill-rule                    | Attribute case insensitive |
| filter                     | filter                       | Attribute case insensitive |
| filterRes                  | filterRes                    |                            |
| filterUnits                | filterUnits                  |                            |
| floodColor                 | flood-color                  | Attribute case insensitive |
| floodOpacity               | flood-opacity                | Attribute case insensitive |
| fontFamily                 | font-family                  | Attribute case insensitive |
| fontSize                   | font-size                    | Attribute case insensitive |
| fontSizeAdjust             | font-size-adjust             | Attribute case insensitive |
| fontStretch                | font-stretch                 | Attribute case insensitive |
| fontStyle                  | font-style                   | Attribute case insensitive |
| fontVariant                | font-variant                 | Attribute case insensitive |
| fontWeight                 | font-weight                  | Attribute case insensitive |
| format                     | format                       | Attribute case insensitive |
| fr                         | fr                           | Attribute case insensitive |
| from                       | from                         | Attribute case insensitive |
| fx                         | fx                           | Attribute case insensitive |
| fy                         | fy                           | Attribute case insensitive |
| g1                         | g1                           | Attribute case insensitive |
| g2                         | g2                           | Attribute case insensitive |
| glyphName                  | glyph-name                   | Attribute case insensitive |
| glyphOrientationHorizontal | glyph-orientation-horizontal | Attribute case insensitive |
| glyphOrientationVertical   | glyph-orientation-vertical   | Attribute case insensitive |
| glyphRef                   | glyphRef                     |                            |
| gradientTransform          | gradientTransform            |                            |
| gradientUnits              | gradientUnits                |                            |
| hanging                    | hanging                      | Attribute case insensitive |
| hatchContentUnits          | hatchContentUnits            |                            |
| hatchUnits                 | hatchUnits                   |                            |
| horizAdvX                  | horiz-adv-x                  | Attribute case insensitive |
| horizOriginX               | horiz-origin-x               | Attribute case insensitive |
| horizOriginY               | horiz-origin-y               | Attribute case insensitive |
| ideographic                | ideographic                  | Attribute case insensitive |
| imageRendering             | image-rendering              | Attribute case insensitive |
| in                         | in                           | Attribute case insensitive |
| in2                        | in2                          | Attribute case insensitive |
| inlineSize                 | inline-size                  | Attribute case insensitive |
| intercept                  | intercept                    | Attribute case insensitive |
| k                          | k                            | Attribute case insensitive |
| k1                         | k1                           | Attribute case insensitive |
| k2                         | k2                           | Attribute case insensitive |
| k3                         | k3                           | Attribute case insensitive |
| k4                         | k4                           | Attribute case insensitive |
| kernelMatrix               | kernelMatrix                 |                            |
| kernelUnitLength           | kernelUnitLength             |                            |
| kerning                    | kerning                      | Attribute case insensitive |
| keyPoints                  | keyPoints                    |                            |
| keySplines                 | keySplines                   |                            |
| keyTimes                   | keyTimes                     |                            |
| lengthAdjust               | lengthAdjust                 |                            |
| letterSpacing              | letter-spacing               | Attribute case insensitive |
| lightingColor              | lighting-color               | Attribute case insensitive |
| limitingConeAngle          | limitingConeAngle            |                            |
| local                      | local                        | Attribute case insensitive |
| markerEnd                  | marker-end                   | Attribute case insensitive |
| markerMid                  | marker-mid                   | Attribute case insensitive |
| markerStart                | marker-start                 | Attribute case insensitive |
| markerHeight               | markerHeight                 |                            |
| markerUnits                | markerUnits                  |                            |
| markerWidth                | markerWidth                  |                            |
| mask                       | mask                         | Attribute case insensitive |
| maskContentUnits           | maskContentUnits             |                            |
| maskUnits                  | maskUnits                    |                            |
| mathematical               | mathematical                 | Attribute case insensitive |
| mode                       | mode                         | Attribute case insensitive |
| numOctaves                 | numOctaves                   |                            |
| offset                     | offset                       | Attribute case insensitive |
| opacity                    | opacity                      | Attribute case insensitive |
| operator                   | operator                     | Attribute case insensitive |
| order                      | order                        | Attribute case insensitive |
| orient                     | orient                       | Attribute case insensitive |
| orientation                | orientation                  | Attribute case insensitive |
| origin                     | origin                       | Attribute case insensitive |
| overflow                   | overflow                     | Attribute case insensitive |
| overlinePosition           | overline-position            | Attribute case insensitive |
| overlineThickness          | overline-thickness           | Attribute case insensitive |
| paintOrder                 | paint-order                  | Attribute case insensitive |
| panose1                    | panose-1                     | Attribute case insensitive |
| path                       | path                         | Attribute case insensitive |
| pathLength                 | pathLength                   |                            |
| patternContentUnits        | patternContentUnits          |                            |
| patternTransform           | patternTransform             |                            |
| patternUnits               | patternUnits                 |                            |
| pitch                      | pitch                        | Attribute case insensitive |
| playbackorder              | playbackorder                | Attribute case insensitive |
| pointerEvents              | pointer-events               | Attribute case insensitive |
| points                     | points                       | Attribute case insensitive |
| pointsAtX                  | pointsAtX                    |                            |
| pointsAtY                  | pointsAtY                    |                            |
| pointsAtZ                  | pointsAtZ                    |                            |
| preserveAlpha              | preserveAlpha                |                            |
| preserveAspectRatio        | preserveAspectRatio          |                            |
| primitiveUnits             | primitiveUnits               |                            |
| r                          | r                            | Attribute case insensitive |
| radius                     | radius                       | Attribute case insensitive |
| refX                       | refX                         |                            |
| refY                       | refY                         |                            |
| renderingIntent            | rendering-intent             | Attribute case insensitive |
| repeatCount                | repeatCount                  |                            |
| repeatDur                  | repeatDur                    |                            |
| requiredExtensions         | requiredExtensions           |                            |
| requiredFeatures           | requiredFeatures             |                            |
| restart                    | restart                      | Attribute case insensitive |
| result                     | result                       | Attribute case insensitive |
| role                       | role                         | Attribute case insensitive |
| rotate                     | rotate                       | Attribute case insensitive |
| rx                         | rx                           | Attribute case insensitive |
| ry                         | ry                           | Attribute case insensitive |
| scale                      | scale                        | Attribute case insensitive |
| seed                       | seed                         | Attribute case insensitive |
| shapeInside                | shape-inside                 | Attribute case insensitive |
| shapeMargin                | shape-margin                 | Attribute case insensitive |
| shapeOutside               | shape-outside                | Attribute case insensitive |
| shapePadding               | shape-padding                | Attribute case insensitive |
| shapeRendering             | shape-rendering              | Attribute case insensitive |
| side                       | side                         | Attribute case insensitive |
| slope                      | slope                        | Attribute case insensitive |
| solidColor                 | solid-color                  | Attribute case insensitive |
| solidOpacity               | solid-opacity                | Attribute case insensitive |
| spacing                    | spacing                      | Attribute case insensitive |
| specularConstant           | specularConstant             |                            |
| specularExponent           | specularExponent             |                            |
| spreadMethod               | spreadMethod                 |                            |
| startOffset                | startOffset                  |                            |
| stdDeviation               | stdDeviation                 |                            |
| stemh                      | stemh                        | Attribute case insensitive |
| stemv                      | stemv                        | Attribute case insensitive |
| stitchTiles                | stitchTiles                  |                            |
| stopColor                  | stop-color                   | Attribute case insensitive |
| stopOpacity                | stop-opacity                 | Attribute case insensitive |
| strikethroughPosition      | strikethrough-position       | Attribute case insensitive |
| strikethroughThickness     | strikethrough-thickness      | Attribute case insensitive |
| string                     | string                       | Attribute case insensitive |
| stroke                     | stroke                       | Attribute case insensitive |
| strokeDasharray            | stroke-dasharray             | Attribute case insensitive |
| strokeDashoffset           | stroke-dashoffset            | Attribute case insensitive |
| strokeLinecap              | stroke-linecap               | Attribute case insensitive |
| strokeLinejoin             | stroke-linejoin              | Attribute case insensitive |
| strokeMiterlimit           | stroke-miterlimit            | Attribute case insensitive |
| strokeOpacity              | stroke-opacity               | Attribute case insensitive |
| strokeWidth                | stroke-width                 | Attribute case insensitive |
| surfaceScale               | surfaceScale                 |                            |
| systemLanguage             | systemLanguage               |                            |
| tableValues                | tableValues                  |                            |
| targetX                    | targetX                      |                            |
| targetY                    | targetY                      |                            |
| textAnchor                 | text-anchor                  | Attribute case insensitive |
| textDecoration             | text-decoration              | Attribute case insensitive |
| textOverflow               | text-overflow                | Attribute case insensitive |
| textRendering              | text-rendering               | Attribute case insensitive |
| textLength                 | textLength                   |                            |
| timelinebegin              | timelinebegin                | Attribute case insensitive |
| to                         | to                           | Attribute case insensitive |
| transform                  | transform                    | Attribute case insensitive |
| u1                         | u1                           | Attribute case insensitive |
| u2                         | u2                           | Attribute case insensitive |
| underlinePosition          | underline-position           | Attribute case insensitive |
| underlineThickness         | underline-thickness          | Attribute case insensitive |
| unicode                    | unicode                      | Attribute case insensitive |
| unicodeBidi                | unicode-bidi                 | Attribute case insensitive |
| unicodeRange               | unicode-range                | Attribute case insensitive |
| unitsPerEm                 | units-per-em                 | Attribute case insensitive |
| vAlphabetic                | v-alphabetic                 | Attribute case insensitive |
| vHanging                   | v-hanging                    | Attribute case insensitive |
| vIdeographic               | v-ideographic                | Attribute case insensitive |
| vMathematical              | v-mathematical               | Attribute case insensitive |
| values                     | values                       | Attribute case insensitive |
| vectorEffect               | vector-effect                | Attribute case insensitive |
| vertAdvY                   | vert-adv-y                   | Attribute case insensitive |
| vertOriginX                | vert-origin-x                | Attribute case insensitive |
| vertOriginY                | vert-origin-y                | Attribute case insensitive |
| viewBox                    | viewBox                      |                            |
| viewTarget                 | viewTarget                   |                            |
| visibility                 | visibility                   | Attribute case insensitive |
| whiteSpace                 | white-space                  | Attribute case insensitive |
| widths                     | widths                       | Attribute case insensitive |
| wordSpacing                | word-spacing                 | Attribute case insensitive |
| writingMode                | writing-mode                 | Attribute case insensitive |
| x                          | x                            | Attribute case insensitive |
| xHeight                    | x-height                     | Attribute case insensitive |
| x1                         | x1                           | Attribute case insensitive |
| x2                         | x2                           | Attribute case insensitive |
| xChannelSelector           | xChannelSelector             |                            |
| xlinkActuate               | xlink:actuate                |                            |
| xlinkArcrole               | xlink:arcrole                |                            |
| xlinkHref                  | xlink:href                   |                            |
| xlinkRole                  | xlink:role                   |                            |
| xlinkShow                  | xlink:show                   |                            |
| xlinkTitle                 | xlink:title                  |                            |
| xlinkType                  | xlink:type                   |                            |
| xmlBase                    | xml:base                     |                            |
| xmlLang                    | xml:lang                     |                            |
| xmlSpace                   | xml:space                    |                            |
| y                          | y                            | Attribute case insensitive |
| y1                         | y1                           | Attribute case insensitive |
| y2                         | y2                           | Attribute case insensitive |
| yChannelSelector           | yChannelSelector             |                            |
| z                          | z                            | Attribute case insensitive |
| zoomAndPan                 | zoomAndPan                   |                            |

## History

React uses a concept (interactions and UI at the same place) that I started to develop with Backbone 3 years ago and happily dropped when I discover React.  
However a friend talked to me about the [react license](http://react-etc.net/entry/your-license-to-use-react-js-can-be-revoked-if-you-compete-with-facebook).

I don't understand a thing about the license implications and I don't want to be bound to things I do not understand.

That friend wasn't a good fan of React at the time and uses the license as an argument.  
I told him:
> Ok, I will create my own "React".

I didn't wanted to recreate a React from scratch.  
I looked for alternatives. [Preact](https://github.com/developit/preact) + [Preact-compat](https://github.com/developit/preact-compat) seem promising.  
Then I replaced React with Preact@6.4.0 in one project.

I launched my project tests and ... many failed (more than 50%):  
  - The asynchonous update of the view after set state was not appropriate with my tests (partially fixed with preact.options.syncComponentUpdates = true)
  - Events were not unregistered after unmount
  - Did not worked with my dialogs
  - Did not work with my integration of material-design-lite because node is already removed in componentWillMount

### Preact messes up with my component properties

That is the most annoying issue for me.  
All my components have a destroyed method called on componentWillUnmount, which contains  

```javascript
for (prop in this) {
  if (!hasProp.call(this, prop)) continue;
  if (!/^(?:id|props|refs|_reactInternalInstance)$/.test(prop)) {
    delete this[prop];
  }
}
```

To prevent any potential memory leak, I delete every thing that was created by my components:

  - `props`, `refs` and `_reactInternalInstance` was created by React.
  - `id` is for debugging purpose.
  - any other owned properties must have been created by my components.  

Because preact add multiple enumarable properties to any component, deleting them put preact in an unexpected state.

Javascript has no "private" properties nor methods.  
The best you can do is to define a generated random property, non enumerable and put all your stuff in that property.  
Something similar is done in jQuery and React.

I was unable to fully understand preact code to fix all of those problems. I gave up.

The good attitude should have been to open issues on preact.  
However, the idea that a future problem may rise, a problem that I won't be able to solve because I was unable to make preact code myself pissed me off.

I was so pissed off that I started to create my own React.

In conclusion, this library is an act of anger.

Here is the [jsfiddle](https://jsfiddle.net/smbape/fgoL2anv/) with some bugs identified with preact.

# License

```text
            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (c) 2017 Stéphane MBAPE (http://smbape.com)

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
```
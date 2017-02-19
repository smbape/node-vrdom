var fs = require("fs");
var sysPath = require("path");
var resolve = require("babel-core/lib/helpers/resolve");

function resolveOption(type, options, dirname) {
    if (options.hasOwnProperty(type + "s")) {
        var config = options[type + "s"];
        if (!Array.isArray(config)) {
            return;
        }

        for (var i = 0, len = config.length; i < len; i++) {
            var name = config[i];
            if ("string" === typeof name) {
                config[i] = babelResolve(type, name, dirname);
            } else if (Array.isArray(name) && "string" === typeof name[0]) {
                name[0] = babelResolve(type, name[0], dirname);
            }
        }
    }
}

function babelResolve(type, name, dirname) {
    if (/^(?:\w+:|\/)/.test(name)) {
        return name;
    }
    return resolve("babel-" + type + "-" + name, dirname) || resolve(type + "-" + name, dirname) || resolve("babel-" + name) || resolve(name) || name;
}

var root = sysPath.resolve(__dirname, "../../test/unit/src");

var options = {
    "presets": [
        "es2015-without-strict",
        "stage-0"
    ],
    "plugins": [
        [
            "transform-react-jsx",
            {
                "pragma": "vrdom.createElement"
            }
        ],
        "transform-flow-strip-types",
        "syntax-flow",
        "syntax-jsx",
        [
            require.resolve("../../babel-plugin/transform-react-display-name"),
            {
                "pragma": "vrdom.createClass",
                "value": "displayName"
            }
        ]
    ],
    "sourceMap": true
};

resolveOption("preset", options, root);
resolveOption("plugin", options, root);

// preload babel
// babel tend to require lots of files, therefore, initial loading may take more than 15s
// var cwd = process.cwd();
// process.cwd(root);
var babel = require("../../test/unit/src/node_modules/umd-builder/node_modules/babel-core");
var source = `var element = <div />;`;
babel.transform(source, options);
// process.cwd(cwd);

// should be done in a prepublish
// transforming js on the fly using babel will only slow down your server initial loading
var code = fs.readFileSync(sysPath.join(__dirname, "input.jsx")).toString();
code = babel.transform(code, options).code;
console.log(code);

require("app-module-path").addPath(__dirname + "/../../src");
require("app-module-path").addPath(__dirname + "/../../vrdom-compat");

var globalDocument = require("global/document");
var vrdom = require("vrdom-compat");

var timerInit = new Date().getTime();
// var el = vrdom.createElement("div", { onClick: function(evt) { console.log(evt) } }, "some text");
eval(code);

var container = globalDocument.createElement("div");
var node = vrdom.render(el, container);
var html = String(node);

var timerDiff = new Date().getTime() - timerInit;

console.log("took", timerDiff, "ms to render");
console.log(html);

vrdom.unmountComponentAtNode(container);

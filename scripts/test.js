var fs = require("fs");
var sysPath = require("path");
var resolve = require('babel-core/lib/helpers/resolve');

var root = sysPath.resolve(__dirname, "../test/unit/src");
var filename = sysPath.resolve(root, "app/node_modules/tests/0010-refs-dev-test.js");

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
            require.resolve("../babel-plugin/transform-react-display-name"),
            {
                "pragma": "vrdom.createClass",
                "value": "displayName"
            }
        ]
    ],
    "sourceMap": true
};

resolveOption('preset', options, root);
resolveOption('plugin', options, root);

process.cwd(root);
var babel = require("../test/unit/src/node_modules/umd-builder/node_modules/babel-core");
// var compiled = fs.readFileSync(filename).toString();
var compiled = '// @babel-plugin-transform-react-display-name { "pragma": "React.createClass", "value": "displayName" } \nvar Component = React.createClass({});';

var timerInit = new Date().getTime();
var transformed = babel.transform(compiled, options);
var timerDiff = (new Date().getTime()) - timerInit;
console.log('first', timerDiff / 1000);
console.log(transformed.code);

var timerInit = new Date().getTime();
var transformed = babel.transform(compiled, options);
var timerDiff = (new Date().getTime()) - timerInit;
console.log('second', timerDiff / 1000);

var files = Object.keys(require('module')._cache).sort();
console.log("loaded files", files.length);
// console.log(files);

var loaded = {};
var file, moduleName;
for (var i = 0, len = files.length; i < len; i++) {
    file = files[i];
    moduleName = getModuleName(file);
    if (loaded.hasOwnProperty(moduleName)) {
        loaded[moduleName].push(file);
    } else {
        loaded[moduleName] = [file];
    }
}

var sortedKeys = Object.keys(loaded).sort(function(a, b) {
    a = loaded[a].length;
    b = loaded[b].length;
    return a > b ? -1 : a < b ? 1 : 0;
});

var _ = require("lodash");
loaded = _.pick(loaded, sortedKeys);

console.log("Best tree", sortedKeys.length);
// console.log(JSON.stringify(loaded, null, 4));

function getModuleName(file) {
    var node_modules = sysPath.sep + "node_modules" + sysPath.sep;
    var index = file.lastIndexOf(node_modules);
    return file.slice(index === -1 ? 0 : index + node_modules.length);
}

function resolveOption(type, options, dirname) {
    if (options.hasOwnProperty(type + 's')) {
        var config = options[type + 's'];
        if (!Array.isArray(config)) {
            return;
        }

        for (var i = 0, len = config.length; i < len; i++) {
            var name = config[i];
            if ('string' === typeof name) {
                config[i] = babelResolve(type, name, dirname);
            } else if (Array.isArray(name) && 'string' === typeof name[0]) {
                name[0] = babelResolve(type, name[0], dirname);
            }
        }
    }
}

function babelResolve(type, name, dirname) {
    if (/^(?:\w+:|\/)/.test(name)) {
        return name;
    }
    return resolve('babel-' + type + '-' + name, dirname) || resolve(type + '-' + name, dirname) || resolve('babel-' + name) || resolve(name) || name;
}

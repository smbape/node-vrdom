"use strict";

var sysPath = require("path");
var webpack = require("./webpack");
var _ = require("lodash");
var anyspawn = require("anyspawn");
var rootpath = sysPath.resolve(__dirname, "..");
var push = Array.prototype.push;

module.exports = function(options, done) {
    var coverage = /^(?:1|true|on|TRUE|ON)$/.test(String(process.env.COVERAGE));

    if ("function" === typeof options) {
        done = options;
        options = {
            coverage: coverage
        };
    }

    if ("function" !== typeof done) {
        done = Function.prototype;
    }

    if (options == null) {
        options = {
            coverage: coverage
        };
    }

    if (options.coverage === undefined) {
        options.coverage = coverage;
    }

    var allTasks = tasks("development", "-dev", options).concat(tasks("production", "", options));
    push.apply(allTasks, [
        "node node_modules/uglify-js/bin/uglifyjs dist/vrdom.js --source-map dist/vrdom.min.map --in-source-map dist/vrdom.map -o dist/vrdom.min.js --compress --mangle",
        "node node_modules/uglify-js/bin/uglifyjs dist/vrdom-compat.js --source-map dist/vrdom-compat.min.map --in-source-map dist/vrdom-compat.map -o dist/vrdom-compat.min.js --compress --mangle",
        "node node_modules/uglify-js/bin/uglifyjs dist/vrdom-devtools.js --source-map dist/vrdom-devtools.min.map --in-source-map dist/vrdom-devtools.map -o dist/vrdom-devtools.min.js --compress --mangle"
    ]);

    anyspawn.spawnSeries(allTasks, {
        stdio: "inherit",
        env: process.env,
        cwd: rootpath,
        // prompt: anyspawn.defaults.prompt
    }, done);
};

function tasks(NODE_ENV, suffix, options) {
    var preprocessLoader = require.resolve("../preprocessor/webpack-loader") + "?" + JSON.stringify({
        env: {
            NODE_ENV: NODE_ENV
        }
    });

    var loaders = getLoaders(preprocessLoader);

    var entries = {
        vrdom: sysPath.join(rootpath, "src", "vrdom.js"),
        "vrdom-compat": sysPath.join(rootpath, "vrdom-compat", "vrdom-compat.js"),
        "vrdom-devtools": sysPath.join(rootpath, "vrdom-devtools", "vrdom-devtools.js"),
        "vrdom-devtools-register": sysPath.join(rootpath, "vrdom-devtools", "vrdom-devtools-register.js")
    };

    var tasks = [];
    addPackTasks(entries, suffix, loaders, tasks);

    if (options.coverage) {
        var ispartaLoader = require.resolve("./isparta-loader") + "?" + JSON.stringify({
            instrumenter: {
                embedSource: true,
                noAutoWrap: true,
                babel: "inherit",
                preserveComments: true,
                keepIfStatement: true,
                keepCommentBlock: true,
                // noCompact: true,
            },
            include: /[/\\]src[/\\]/.source
        });

        loaders = getLoaders(preprocessLoader, ispartaLoader);
        suffix = suffix + "-cov";
        addPackTasks(entries, suffix, loaders, tasks);
    }

    return tasks;
}

function addPackTasks(entries, suffix, loaders, tasks) {
    var options = {};
    var externals = {};
    options.externals = externals;

    var name, camelExternalName;

    // eslint-disable-next-line guard-for-in
    for (name in entries) {
        camelExternalName = camelize(name + suffix);
        externals[name] = {
            amd: name + suffix,
            commonjs: camelExternalName,
            commonjs2: camelExternalName,
            root: camelExternalName
        };
    }

    // eslint-disable-next-line guard-for-in
    for (name in entries) {
        tasks.push(pack.bind(null, name, suffix, entries[name], loaders, options));
    }
}

function getLoaders(preprocessLoader, ispartaLoader) {
    var jsLoaders = [preprocessLoader, "babel-loader"];

    if (ispartaLoader) {
        jsLoaders.push(ispartaLoader);
    }

    var loaders = [{
        test: /\.js$/,
        loaders: jsLoaders
    }];

    return loaders;
}

function pack(name, suffix, entry, loaders, options, done) {
    options = _.merge({
        devtool: "source-map",
        resolve: {
            extensions: ["", ".js", ".coffee"]
        },
        entry: entry,
        output: {
            path: sysPath.join(rootpath, "dist"),
            filename: name + suffix + ".js",
            library: camelize(name + suffix),
            libraryTarget: "umd",
            sourceMapFilename: name + suffix + ".map",
            devtoolModuleFilenameTemplate: function devtoolModuleFilenameTemplate(obj){
                var resourcePath = obj.resourcePath.replace(/(^|[/\\])(?:([^/\\]+)(\.[^/\\.]+)|([^/\\]+))$/, "$1$2$4" + suffix + "$3");
                return "webpack:///" + resourcePath;
            }
        },
        module: {
            loaders: loaders
        }
    }, options);

    webpack(options, function() {
        console.log("\n");
        done.apply(null, arguments);
    });
}

function camelize(str) {
    return str.replace(/-\w/g, hyphenToUpper);
}

function hyphenToUpper(match) {
    return match[1].toUpperCase();
}
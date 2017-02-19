"use strict";

var sysPath = require("path");
var webpack = require("./webpack");
var _ = require("lodash");
var qs = require("querystring");
var anyspawn = require("anyspawn");

module.exports = function(options, done) {
    var coverage = /1|true|on|TRUE|ON/.test(String(process.env.COVERAGE));

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

    if (options.coverage === (void 0)) {
        options.coverage = coverage;
    }

    var allTasks = tasks("development", "-dev", options).concat(tasks("production", "", options));
    allTasks.push.apply(allTasks, [
        "node node_modules/uglify-js/bin/uglifyjs dist/vrdom.js --source-map dist/vrdom.min.map --in-source-map dist/vrdom.map -o dist/vrdom.min.js --compress --mangle",
        "node node_modules/uglify-js/bin/uglifyjs dist/vrdom-compat.js --source-map dist/vrdom-compat.min.map --in-source-map dist/vrdom-compat.map -o dist/vrdom-compat.min.js --compress --mangle"
    ]);

    anyspawn.spawnSeries(allTasks, {
        stdio: "inherit",
        env: process.env,
        cwd: sysPath.join(__dirname, ".."),
        // prompt: anyspawn.defaults.prompt
    }, done);
};

function tasks(NODE_ENV, suffix, options) {
    var ifdefQuery = qs.encode({
        env: JSON.stringify({
            NODE_ENV: NODE_ENV
        })
    });

    var preprocessLoader = require.resolve("../preprocessor/webpack-loader") + "?" + ifdefQuery;

    var loaders = getLoaders(preprocessLoader);

    var entries = {
        vrdom: sysPath.join(__dirname, "..", "src", "vrdom.js"),
        "vrdom-compat": sysPath.join(__dirname, "..", "vrdom-compat", "vrdom-compat.js")
    };

    var tasks = [];
    addPackTasks(entries, suffix, loaders, tasks);

    if (options.coverage) {
        var ispartaLoader = require.resolve("./isparta-loader") + "?" + qs.encode({
            options: JSON.stringify({
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
            })
        });

        loaders = getLoaders(preprocessLoader, ispartaLoader);
        suffix = suffix + "-cov";
        addPackTasks(entries, suffix, loaders, tasks);
    }

    return tasks;
}

function addPackTasks(entries, suffix, loaders, tasks) {
    var options = {};

    // eslint-disable-next-line guard-for-in
    for (var name in entries) {
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
    var camelExternalName = camelize("vrdom" + suffix);

    options = _.merge({
        devtool: "source-map",
        resolve: {
            extensions: ["", ".js", ".coffee"]
        },
        entry: entry,
        output: {
            path: sysPath.join(__dirname, "..", "dist"),
            filename: name + suffix + ".js",
            library: camelize(name + suffix),
            libraryTarget: "umd",
            sourceMapFilename: name + suffix + ".map"
        },
        module: {
            loaders: loaders
        },
        externals: {
            vrdom: {
                amd: "vrdom" + suffix,
                commonjs: camelExternalName,
                commonjs2: camelExternalName,
                root: camelExternalName
            }
        },
    }, options);

    webpack(options, function() {
        console.log("");
        done.apply(null, arguments);
    });
}

function camelize(str) {
    return str.replace(/-\w/g, hyphenToUpper);
}

function hyphenToUpper(match) {
    return match[1].toUpperCase();
}
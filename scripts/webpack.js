#!/usr/bin/env node
/*eslint dot-location: ["error", "property"]*/

/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/
var optimist = requireFromWebpack("optimist")
    .usage("distribute " + require("webpack/package.json").version + "\n" +
        "Usage: https://webpack.github.io/docs/cli.html");

require("webpack/bin/config-optimist")(optimist);

optimist
    .boolean("json").alias("json", "j").describe("json")
    .boolean("colors").alias("colors", "c").describe("colors")
    .string("sort-modules-by").describe("sort-modules-by")
    .string("sort-chunks-by").describe("sort-chunks-by")
    .string("sort-assets-by").describe("sort-assets-by")
    .boolean("hide-modules").describe("hide-modules")
    .string("display-exclude").describe("display-exclude")
    .boolean("display-modules").describe("display-modules")
    .boolean("display-chunks").describe("display-chunks")
    .boolean("display-error-details").describe("display-error-details")
    .boolean("display-origins").describe("display-origins")
    .boolean("display-cached").describe("display-cached")
    .boolean("display-cached-assets").describe("display-cached-assets")
    .boolean("display-reasons").alias("display-reasons", "verbose").alias("display-reasons", "v").describe("display-reasons");

var argv = optimist.argv;

var _ = require("lodash");
var defaultOptions = require("webpack/bin/convert-argv")(optimist, argv, {
    outputFilename: require("path").join(__dirname, "..", "dist", "[name].js")
});
module.exports = processOptions;

function getPromisableOptions(callback, options) {
    if ("function" === typeof options) {
        var _callback = options;
        options = callback;
        callback = _callback;
    }


    // process Promise
    if (typeof options.then === "function") {
        options.then(getPromisableOptions.bind(this, callback)).catch(function(err) {
            console.error(err.stack || err);
            process.exit(); // eslint-disable-line
        });
        return;
    }

    callback(options);
}

function ifArg(name, fn, init) {
    if (Array.isArray(argv[name])) {
        if (init) {
            init()
        }
        ;
        argv[name].forEach(fn);
    } else if (typeof argv[name] !== "undefined") {
        if (init) {
            init();
        }
        fn(argv[name], -1);
    }
}

function processOptions(options, done) {
    getPromisableOptions(defaultOptions, function(defaultOptions) {
        getPromisableOptions(options, function(options) {
            options = _.defaults({}, options, defaultOptions);

            var firstOptions = Array.isArray(options) ? options[0] : options;

            var outputOptions = Object.create(options.stats || firstOptions.stats || {});
            if (typeof outputOptions.context === "undefined") {
                outputOptions.context = firstOptions.context;
            }

            ifArg("json", function(bool) {
                if (bool) {
                    outputOptions.json = bool;
                }
            });

            if (typeof outputOptions.colors === "undefined") {
                outputOptions.colors = requireFromWebpack("supports-color");
            }

            ifArg("sort-modules-by", function(value) {
                outputOptions.modulesSort = value;
            });

            ifArg("sort-chunks-by", function(value) {
                outputOptions.chunksSort = value;
            });

            ifArg("sort-assets-by", function(value) {
                outputOptions.assetsSort = value;
            });

            ifArg("display-exclude", function(value) {
                outputOptions.exclude = value;
            });

            if (!outputOptions.json) {
                if (typeof outputOptions.cached === "undefined") {
                    outputOptions.cached = false;
                }
                if (typeof outputOptions.cachedAssets === "undefined") {
                    outputOptions.cachedAssets = false;
                }

                ifArg("display-chunks", function(bool) {
                    outputOptions.modules = !bool;
                    outputOptions.chunks = bool;
                });

                ifArg("display-reasons", function(bool) {
                    outputOptions.reasons = bool;
                });

                ifArg("display-error-details", function(bool) {
                    outputOptions.errorDetails = bool;
                });

                ifArg("display-origins", function(bool) {
                    outputOptions.chunkOrigins = bool;
                });

                ifArg("display-cached", function(bool) {
                    if (bool) {
                        outputOptions.cached = true;
                    }
                });

                ifArg("display-cached-assets", function(bool) {
                    if (bool) {
                        outputOptions.cachedAssets = true;
                    }
                });

                if (!outputOptions.exclude && !argv["display-modules"]) {
                    outputOptions.exclude = ["node_modules", "bower_components", "jam", "components"];
                }
            } else {
                if (typeof outputOptions.chunks === "undefined") {
                    outputOptions.chunks = true;
                }
                if (typeof outputOptions.modules === "undefined") {
                    outputOptions.modules = true;
                }
                if (typeof outputOptions.chunkModules === "undefined") {
                    outputOptions.chunkModules = true;
                }
                if (typeof outputOptions.reasons === "undefined") {
                    outputOptions.reasons = true;
                }
                if (typeof outputOptions.cached === "undefined") {
                    outputOptions.cached = true;
                }
                if (typeof outputOptions.cachedAssets === "undefined") {
                    outputOptions.cachedAssets = true;
                }
            }

            ifArg("hide-modules", function(bool) {
                if (bool) {
                    outputOptions.modules = false;
                    outputOptions.chunkModules = false;
                }
            });

            var webpack = require("webpack/lib/webpack.js");

            Error.stackTraceLimit = 30;
            var lastHash = null;
            var compiler = webpack(options);
            // console.log(JSON.stringify(options, null, 4));

            function compilerCallback(err, stats) {
                if (!options.watch) {
                    // Do not keep cache anymore
                    compiler.purgeInputFileSystem();
                }

                if (err) {
                    lastHash = null;
                    console.error(err.stack || err);
                    if (err.details) {
                        console.error(err.details);
                    }

                    if (!options.watch) {
                        done.apply(this, arguments);
                        process.on("exit", function() {
                            process.exit(1); // eslint-disable-line
                        });
                    }

                    return;
                }

                if (outputOptions.json) {
                    process.stdout.write(JSON.stringify(stats.toJson(outputOptions), null, 2) + "\n");
                } else if (stats.hash !== lastHash) {
                    lastHash = stats.hash;
                    process.stdout.write(stats.toString(outputOptions) + "\n");
                }

                if (!options.watch) {
                    done.apply(this, arguments);
                }
            }

            if (options.watch) {
                var primaryOptions = !Array.isArray(options) ? options : options[0];
                var watchOptions = primaryOptions.watchOptions || primaryOptions.watch || {};
                if (watchOptions.stdin) {
                    process.stdin.on("end", function() {
                        process.exit(0); // eslint-disable-line
                    });
                    process.stdin.resume();
                }
                compiler.watch(watchOptions, compilerCallback);
            } else {
                compiler.run(compilerCallback);
            }

        });
    });
}

function requireFromWebpack(name) {
    try {
        return require("webpack/node_modules/" + name);
    } catch ( e ) {
        return require(name);
    }
}

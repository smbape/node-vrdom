var sysPath = require("path"),
    _ = require("lodash"),
    distribute = require("../../../scripts/distribute");

var slice = Array.prototype.slice;

var ref = require("umd-builder/lib/brunch-config"),
    matcher = ref.matcher,
    config = ref.config;

var projectRoot = sysPath.resolve(__dirname, "..", "..", "..").replace(/[/\\]/g, "/");
projectRoot = sysPath.relative(process.cwd(), projectRoot);

var dist = sysPath.join(projectRoot, "dist");
var externalSources = [dist, "node_modules/auto-reload-brunch/vendor"];
var externalMatcher = new RegExp(matcher(externalSources).source + /[/\\](.*)/.source);

function ignore(path) {
    return config.conventions.vendor(path) || externalMatcher.test(path);
}

var sources = ["src", "vrdom-compat", "devtools"].map(function(path) {
    return sysPath.join(projectRoot, path);
});
var sourcesReg = new RegExp(matcher(sources).source + /[/\\]/.source);
var sourceModuleNameReg = new RegExp(sourcesReg.source + /(.*)$/.source);
var lintPattern = new RegExp(matcher(sources.concat(["app/node_modules/tests"])).source + /[/\\]/.source);

var doDistribution;
if (process.env.BRUNCH_PREPUBLISH && /^(?:true|1|on|TRUE)$/.test(process.env.BRUNCH_PREPUBLISH)) {
    initDistribution();
}

function initDistribution() {
    var distributionReady = false;
    var working = false;
    var pending = false;

    var bwatcher, originalEmit, args;
    var memo = {};

    doDistribution = _.debounce(function() {
        if (working || pending) {
            pending = true;
            return;
        }

        working = true;

        distribute(function() {
            if (!distributionReady) {
                distributionReady = true;
            }

            working = false;

            // eslint-disable-next-line guard-for-in
            for (var path in memo) {
                originalEmit.apply(null, memo[path]);
                delete memo[path];
            }

            if (args) {
                originalEmit.apply(null, args);
                args = null;
            }

            if (pending) {
                pending = false;
                doDistribution();
            }
        });
    }, 300, { // eslint-disable-line no-magic-numbers
        leading: false,
        trailing: true
    });

    var onwatch = config.onwatch;
    config.onwatch = function(fswatcher, bwatcher) {
        onwatch.apply(config, arguments);
        prepareWatcher(fswatcher, bwatcher);
        doDistribution();
        doDistribution.flush();
    };

    function prepareWatcher(fswatcher, _bwatcher) {
        bwatcher = _bwatcher;

        originalEmit = fswatcher.emit.bind(fswatcher);

        fswatcher.emit = function emit(evt, path) {
            if (!working) {
                originalEmit.apply(this, arguments);
                return;
            }

            if (!distributionReady) {
                var _args = slice.call(arguments);
                if (evt === "ready") {
                    args = _args;
                    return;
                }
                memo[path] = _args;
                return;
            }

            switch (evt) {
                case "add":
                case "change":
                case "unlink":
                    memo[path] = slice.call(arguments);
                    break;
                default:
                    originalEmit.apply(this, arguments);
                    break;
            }
        };
    }

}

var apps = ["app"].concat(externalSources);
var vendors = ["bower_components"];
var clientSources = apps.concat(vendors);
var moduleNameReg = new RegExp(matcher(["app/node_modules"].concat(externalSources)).source + /[/\\](.*)$/.source);

config.compilers.unshift(require("umd-builder/lib/compilers/babel"));
Array.prototype.push.apply(config.compilers, [
    require("umd-builder/lib/compilers/stylus")
]);

exports.config = _.merge(config, {
    // fileListInterval: 5 * 60 * 60,

    requirejs: {
        waitSeconds : 30
    },

    modules: {
        nameCleaner: function(path, ext) {
            if (!config.conventions.vendor(path)) {
                if (moduleNameReg.test(path)) {
                    path = path.replace(moduleNameReg, "$1");
                } else if (sourceModuleNameReg.test(path)) {
                    path = path.replace(sourceModuleNameReg, "src/$1");
                }
            }

            path = path.replace(/[\\]/g, "/");

            if (ext) {
                return path;
            }
            return path.replace(/\.[^.]*$/, "");
        },

        amdDestination: function(path, ext) {
            var isVendor = config.conventions.vendor(path)
            var path = config.modules.nameCleaner(path, ext);
            return isVendor ? path : "node_modules/" + path;
        }
    },
    paths: {
        watched: ["app", dist, "node_modules/auto-reload-brunch/vendor"].concat(doDistribution ? sources : [])
    },
    files: {
        javascripts: {
            joinTo: {
                "javascripts/app.js": new RegExp(matcher(apps).source + /[/\\]/.source),
                "javascripts/vendor.js": new RegExp(matcher(vendors).source + /[/\\]/.source),
                "src.js": sourcesReg
            }
        },
        stylesheets: {
            joinTo: {
                "stylesheets/app.css": new RegExp(matcher(clientSources).source + /[/\\]/.source),
            }
        }
    },
    plugins: {
        eslint: {
            pattern: lintPattern,
            warnOnly: true
        },
        amd: {
            mainTemplate: sysPath.resolve(__dirname, "templates", "main.js"),
            jshint: false,
            factories: {
                fvrdom: function(plugin, modulePath, data, parsed) {
                    var args = parsed[2],
                        head = parsed[3],
                        declaration = parsed[4],
                        body = parsed[5];

                    return head + "\ndeps.unshift(\"vrdom\");\n\nfunction factory(require, vrdom) {\n    /*jshint validthis: true */\n    \n    " + declaration + (args.join(", ")) + body + "\n    \n    return fvrdom.apply(this, Array.prototype.slice.call(arguments, 2));\n}";
                }
            }
        },
        babel: {
            pretransform: [require("umd-builder/lib/spTransform")],
            ignore: ignore
        },
        autoReload: {
            enabled: {
                css: true,
                js: true,
                assets: true
            },

            // eslint-disable-next-line no-magic-numbers
            port: [1234, 2345, 3456],
            delay: require("os").platform() === "win32" ? 200 : (void 0), // eslint-disable-line no-magic-numbers
            forcewss: true
        }
    },
    server: {
        path: "./server/HttpServer",
        hostname: "127.0.0.1",
        port: 8888
    },
    hooks: {
        onCompile: function(generatedFiles /*, changedAssets*/ ) {
            if (!doDistribution) {
                return;
            }

            var hasChange = generatedFiles.some(function(generatedFile /*, index*/ ) {
                return generatedFile.sourceFiles.some(function(file /*, index*/ ) {
                    return sourcesReg.test(file.path);
                });
            });

            if (hasChange) {
                if (doDistribution.ready) {
                    doDistribution();
                } else {
                    doDistribution.ready = true;
                }
            }
        }
    },
    conventions: {
        ignored: [
            /[\\/]\.(?![\\/.])/,
            /[\\/]_/,
            /(?!^|[\\/])bower\.json/,
            /(?!^|[\\/])component\.json/,
            /(?!^|[\\/])package\.json/,
            /(?!^|[\\/])vendor[\\/](?:node|j?ruby-.*|bundle)[\\/]/,
            /[\\/]mdn[\\/]scrap\.js/,
            /[\\/]mdn[\\/]specifications[\\/]/,
            /[\\/]w3c[\\/]specifications[\\/]/,
            /[\\/]w3c[\\/]scrap\.js/
        ]
    }
});

config.isVendor = config.files.javascripts.joinTo["javascripts/app.js"];

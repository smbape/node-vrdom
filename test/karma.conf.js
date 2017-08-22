require("./fixes");

var sysPath = require("path");
var coverage = /^(?:1|true|on|TRUE|ON)$/.test(String(process.env.COVERAGE));
var envPreprocessor = coverage ? ["COVERAGE"] : [];
envPreprocessor.push.apply(envPreprocessor, Object.keys(process.env).filter(function(name) {
    return name.slice(0, "TEST_".length) === "TEST_";
}));

module.exports = function(config) {
    config.set({

        basePath: "../",

        files: [
            "test/unit/test-main.js",
            sysPath.resolve(__dirname, "../patches/browser-patches.js"),
            sysPath.resolve(__dirname, "../karma-plugin/custom-matchers.js"),

            /* */

            {
                pattern: "test/unit/public/**/*.js",
                included: false
            }, {
                pattern: "test/unit/public/**/*.map",
                included: false
            }
        ],

        autoWatch: true,

        frameworks: [
            "source-map-support",
            "jasmine",
            "requirejs"
        ],

        browsers: [
            "Chrome"
        ],

        customLaunchers: {
            IE11: {
                base: "IE",
                "x-ua-compatible": "IE=EmulateIE11"
            },
            IE10: {
                base: "IE",
                "x-ua-compatible": "IE=EmulateIE10"
            },
            IE9: {
                base: "IE",
                "x-ua-compatible": "IE=EmulateIE9"
            }
        },

        reporters: coverage ? ["coverage", "spec"] : ["spec"],

        coverageReporter: {
            dir: sysPath.join(__dirname, "..", "coverage"),
            reporters: [{
                type: "text-summary"
            }, {
                type: "html"
            }, {
                type: "json"
            }, {
                type: "lcovonly",
                subdir: ".",
                file: "lcov.info"
            }]
        },

        specReporter: {
            maxLogLines: 5, // limit number of lines logged per test 
            suppressErrorSummary: false, // do not print error summary 
            suppressFailed: false, // do not print information about failed tests 
            suppressPassed: false, // do not print information about passed tests 
            suppressSkipped: true, // do not print information about skipped tests 
            showSpecTiming: false // print the time elapsed for each spec 
        },

        browserLogOptions: {
            terminal: true
        },

        browserConsoleLogOptions: {
            terminal: true
        },

        // browserDisconnectTimeout: 60 * 1000, // 2 * 1000
        // browserNoActivityTimeout: 60 * 1000, // 10 * 1000
        // captureTimeout: 60 * 1000, // 60 * 1000

        concurrency: 1,

        preprocessors: {
            "**/patches/browser-patches.js": ["webpack", "sourcemap"],
            "**/test/unit/test-main.js": ["env"],
            "**/public/node_modules/vrdom.js": ["sourcemap"],
            "**/public/node_modules/vrdom-*.js": ["sourcemap"]
        },

        webpack: {
            devtool: "inline-source-map"
        },

        envPreprocessor: envPreprocessor,

        plugins: [
            moduleFrameworkPlugin("source-map-support", "source-map-support/browser-source-map-support.js", Array.prototype.unshift),
            "karma-env-preprocessor",
            "karma-spec-reporter",
            "karma-sourcemap-loader",
            "karma-webpack",
            "karma-jasmine",
            "karma-requirejs",
            "karma-coverage",
            "karma-chrome-launcher",
            "karma-firefox-launcher",
            "karma-ie-launcher",
            "karma-edge-launcher",
            "karma-opera-launcher",
        ]
    });
};

function moduleFrameworkPlugin(name, moduleId, method) {
    var injector = moduleFrameworkInjector.bind(null, moduleId, method);
    injector.$inject = ["config.files"];
    var plugin = {};
    plugin["framework:" + name] = ["factory", injector];
    return plugin;
}

function moduleFrameworkInjector(moduleId, method, files) {
    method.call(files, {
        pattern: require.resolve(moduleId),
        included: true,
        served: true,
        watched: false
    });
}
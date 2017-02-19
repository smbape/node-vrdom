var fs;

try {
    fs = require("karma/node_modules/graceful-fs");
} catch(e) {
    fs = require("graceful-fs");
}

// change original graceful fs readFile
// to deal with changing files
// TODO : do not use with files bigger than 1/2 of the node allocated memory
var readFile = fs.readFile;
fs.readFile = function safeReadFile(filepath) {
    var args = Array.prototype.slice.call(arguments);
    var callback = args[args.length - 1];

    fs.lstat(filepath, function(err, stats) {
        if (err) {
            callback(err);
            return;
        }

        args[args.length - 1] = function done(err, buffer) {
            if (err) {
                callback(err);
                return;
            }

            if (buffer.length !== stats.size) {
                args[args.length - 1] = callback;
                safeReadFile.apply(null, args);
                return;
            }

            callback(err, buffer);
        };

        // when we read a changing file
        // we may have buffer.length === 0
        // add a little delay ensure that we are not in the middle of a change
        // after some tests on my HDD
        // 3 ms of default seems to be ok
        // therefore I presume 3 * 2 should be enough for any disk
        setTimeout(function() {
            readFile.apply(fs, args);
        }, 6);
    });
};

var _ = require("lodash");

// https://github.com/karma-runner/karma-opera-launcher/issues/3
// No test-execution in Windows
var OperaLauncher = require("karma-opera-launcher")['launcher:Opera'];
var OperaBrowser = OperaLauncher[1];

OperaLauncher[1] = function(baseBrowserDecorator, args) {
    baseBrowserDecorator(this)

    var flags = args.flags || []

    this._getOptions = function(url) {
        // Opera CLI options
        // http://peter.sh/experiments/chromium-command-line-switches/
        flags.forEach(function(flag, i) {
            if (isJSFlags(flag))
                flags[i] = sanitizeJSFlags(flag)
        })

        return [
            '--user-data-dir=' + this._tempDir,
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-popup-blocking',
            '--disable-translate',
            '--new-window',
            '--ran-launcher'
        ].concat(flags, [url])
    }
};

_.extend(OperaLauncher[1].prototype, {
    name: OperaBrowser.prototype.name,
    DEFAULT_CMD: OperaBrowser.prototype.DEFAULT_CMD,
    ENV_CMD: OperaBrowser.prototype.ENV_CMD
});

OperaLauncher[1].$inject = OperaBrowser.$inject;
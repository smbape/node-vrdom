/* eslint-disable strict */
"use stict";

var _ = require("lodash"),
    semLib = require("sem-lib"),
    request = require("request"),
    fs = require("fs");

// limit maximum parallel requests. A way to ensure we don"t get block as a ddos attacker
var maxParallelTasks = 8; //require("os").cpus().length;
var wgetSem = semLib.semCreate(maxParallelTasks, true);

// https://github.com/request/request#requestoptions-callback
var defaultRequestOptions = {
    followRedirect: true, // follow HTTP 3xx responses as redirects
    followAllRedirects: true, // follow non-GET HTTP 3xx responses as redirects
    maxRedirects: 5, // limit follow redirect to prevent infinite redirection
    timeout: 60000, // the default timeout may be too short
    strictSSL: false, // skip ssl check. We know what we are doing
    // secureProtocol: "SSLv3_method", // Don"t know why, but I get an error on https websites without this

    // For backwards-compatibility, response compression is not supported by default.
    // To accept gzip-compressed responses, set the gzip option to true
    gzip: true,

    // make server think we are a browser
    headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept-Language": "fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36"
    },

    // if we need/want to use a proxy
    proxy: null // "http://127.0.0.1:8555"
};

wget.download = download;
module.exports = wget;

function wget(uri, options, callback, done) {
    switch (arguments.length) {
        case 0:
            throw new Error("uri is needed");
        case 1:
            break;

        // eslint-disable-next-line no-magic-numbers
        case 2:
            if (_.isFunction(options)) {
                done = options;
                options = null;
            }
            break;

        // eslint-disable-next-line no-magic-numbers
        case 3:
            if (_.isFunction(options)) {
                if (_.isFunction(callback)) {
                    done = callback;
                    callback = options;
                } else {
                    done = options;
                }
                options = null;
            } else if (_.isFunction(callback)) {
                done = callback;
                callback = null;
            }
            break;
        default:
            // do nothing
            break;
    }

    options = _.defaultsDeep({
        uri: uri
    }, options, defaultRequestOptions);

    var semOptions = _.pick(options, ["onTake", "priority", "num", "timeOut", "onTimeOut"]);

    wgetSem.semTake(_.extend(semOptions, {
        onTake: function() {
            var req = request(options, function(err, res, body) {
                wgetSem.semGive();
                if (_.isFunction(done)) {
                    done(err, res, body);
                }
            });

            if (_.isFunction(callback)) {
                callback(req);
            }
        }
    }));
}

function download(url, dst, done) {
    fs.lstat(dst, function(err) {
        if (!done) {
            done = Function.prototype;
        }

        if (err) {
            wget(url, function(req) {
                console.log("downloading", url, "into", dst);
                req.pipe(fs.createWriteStream(dst));
            }, done);
            return;
        }

        done();
    });
}

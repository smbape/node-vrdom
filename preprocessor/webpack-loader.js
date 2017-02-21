"use strict";

var url = require("url");
var loaderUtils = require("loader-utils");
var preprocess = require("./Parser").preprocess;

module.exports = function(source, map) {
    var env, options;

    var loaderOptions = this.query ? loaderUtils.parseQuery(this.query) : null;
    if (loaderOptions) {
        if (loaderOptions.env) {
            env = loaderOptions.env;
        }

        if (loaderOptions.options) {
            options = loaderOptions.options;
        }
    }

    if (this.cacheable) {
        this.cacheable();
    }

    try {
        var preprocessed = preprocess(source, env, options, map);
        this.callback(null, preprocessed, map);
    } catch ( err ) {
        this.callback(err);
    }
};
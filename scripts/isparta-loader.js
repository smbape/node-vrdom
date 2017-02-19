'use strict';

var qs = require('querystring');
var url = require('url');
var isparta = require('isparta');

module.exports = function(source, map) {
    var options = this.options.isparta || {
            embedSource: true,
            noAutoWrap: true,
            babel: this.options.babel
        },
        originalOptions = options;

    if (this.query) {
        var query = url.parse(this.query).query;
        if (query) {
            query = qs.parse(query);
            if (query && query.options) {
                options = JSON.parse(query.options);

                if (options.exclude) {
                    var exclude = new RegExp(options.exclude);
                    if (exclude.test(this.resourcePath)) {
                        this.callback(null, source, map);
                        return;
                    }
                }

                if (options.include) {
                    var include = new RegExp(options.include);
                    if (!include.test(this.resourcePath)) {
                        this.callback(null, source, map);
                        return;
                    }
                }

                options = options.instrumenter || originalOptions;
                if (options.babel === 'inherit') {
                    options.babel = this.options.babel;
                }
            }
        }
    }

    if (this.cacheable) {
        this.cacheable();
    }

    var instrumenter = new isparta.Instrumenter(options);
    return instrumenter.instrumentSync(source, this.resourcePath, map);
};
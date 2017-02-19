var url = require("url");
var qs = require("querystring");
var preprocess = require("./Parser").preprocess;

module.exports = function(source, map) {
    var env, options;

    if (this.query) {
        var query = qs.parse(url.parse(this.query).query);
        if (query.env) {
            env = JSON.parse(query.env);
        }

        if (query.options) {
            options = JSON.parse(query.options);
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
/* Generated by umd builder */
<%
var require = root.require,
    __filename = root.__filename,
    __dirname = root.__dirname;

var util = require('util'),
    _ = require('lodash'),
    sysPath = require('path');

var config = _.cloneDeep(root.config),
    pathBrowserify = root.pathBrowserify;

function toString(obj) {
    return util.inspect(obj, {depth: null});
}

var isMain = false,
    isMainBuild = false,
    isMainDev = false,
    isUnit = false;

switch(root.type) {
    case 'unit':
        isUnit = true;
        config.baseUrl = '/base/test/unit/' + root.paths.public + '/' + config.baseUrl;
        break;
    case 'build':
        isMainBuild = true;
        if (!root.optimize) {
            config.optimize = 'none';
        }

        // path fallbacks are not supported by r.js
        for (var component in config.paths) {
            if (Array.isArray(config.paths[component])) {
                config.paths[component] = config.paths[component][0];
            }
        }

        config.baseUrl = '../' + root.paths.public + '/' + config.baseUrl;
        config.name = '../javascripts/main';
        config.out = '../' + root.paths.public + '/javascripts/main-built.js';

        break;
    case 'main':
        isMain = true;
        delete config.paths;
        delete config.shim;
        delete config.deps;
        break;
    case 'main-dev':
        isMainDev = true;
        break;
}

%>(function() {
    'use strict';

    <% if (!isMainBuild) { %>var appConfig = window.appConfig || (window.appConfig = {});<% } %>

    var config = <%= toString(config) %>;

    <% if (isMain || isMainDev) { %><%--

    --%>if (typeof appConfig.baseUrl === 'string') {
        config.baseUrl = appConfig.baseUrl + config.baseUrl;
    }<%--

    --%><% } %><%--

    --%><% if (isMainBuild) { %>
        <%-- TODO: entry point build --%>
        var basePath = '<%= sysPath.normalize(root.public).replace(/\\/g, '/') + '/' %>';

        var hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push;

        var filenameMap = nodeRequire('<%= sysPath.normalize(root.root + '/work/filenameMap').replace(/\\/g, '/') %>');
        var modulesWithDefine = [];
        for (var filename in filenameMap) {
            modulesWithDefine.push(filenameMap[filename].name);
        }

        return augment(basePath, config);

        function augment(basePath, config) {
            config.modulesWithDefine = modulesWithDefine;
            config.onReadFile = onReadFile;
            push.apply(config.deps, modulesWithDefine);
            return config;

            function onReadFile(path, text) {
                var relativePath = path.substring(basePath.length);
                if (hasOwn.call(filenameMap, relativePath)) {
                    text = appendName(text, filenameMap[relativePath].name, filenameMap[relativePath].line, filenameMap[relativePath].col);
                }

                return text;
            }
        }

        function appendName(str, name, line, col) {
            var start = getIndex(str, line, col);
            var defstart = str.indexOf('(', start);
            return str.substring(0, defstart + 1) + "'" + name + '\', ' + str.substring(defstart + 1);
        }

        function getIndex(str, line, col) {
            var curr, index, lastIndex;
            if (line === 1) {
                return col;
            }
            curr = 1;
            index = 0;
            lastIndex = -1;
            while (~(index = str.indexOf('\n', index))) {
                lastIndex = index;
                index++;
                if (line === ++curr) {
                    break;
                }
            }
            return lastIndex + col;
        }<%--

    --%><% } else if (isUnit) { %>

    var groups = config.groups;
    delete config.groups;

    var coverage = window.__env__ && /1|true|on|TRUE|ON/.test(String(window.__env__.COVERAGE));
    if (coverage) {
        config.map['*']['vrdom'] = 'vrdom-cov';
        config.map['*']['vrdom-compat'] = 'vrdom-compat-cov';
        config.map['*']['vrdom-dev'] = 'vrdom-dev-cov';
        config.map['*']['vrdom-compat-dev'] = 'vrdom-compat-dev-cov';
    } else if (/^(?:preact-compat|react)$/.test(String(window.__env__.TEST_LIBRARY))) {
        config.map['*']['vrdom'] = String(window.__env__.TEST_LIBRARY);
        window.isReact = 'react' === config.map['*']['vrdom'];
        window.isLibrary = true;
    }

    requirejs.config(config);

    if (groups) {
        var name, index, deps, group;
        for (name in groups) {
            deps = groups[name];
            group = name + '-group';
            define(group, deps, function(main) {
                return main;
            });

            index = config.deps.indexOf(name);
            if (index !== -1) {
                config.deps[index] = group;
            }
        }
    }

    var deps = config.deps;
    delete config.deps;

    require([
        'umd-core/src/depsLoader',
        'umd-core/src/path-browserify',
        'browser-source-map-support',
        'vrdom',
        'preact',
        'react',
        'react-dom'
    ], function(depsLoader, pathBrowserify, sourceMapSupport, vrdom, preact, React, ReactDOM) {
        sourceMapSupport.install();

        preact.options.syncComponentUpdates = true;
        preact.options.debounceRendering = function(rerender) {
            rerender();
        };

        if (window.isLibrary) {
            vrdom.reset = Function.prototype;
        }

        if (window.isReact) {
            for (var key in ReactDOM) {
                React[key] = ReactDOM[key];
            }
        }

        window.depsLoader = depsLoader;
        window.pathBrowserify = pathBrowserify;

        var TEST_REGEXP;

        if (window.__env__.TEST_REGEXP) {
            TEST_REGEXP = new RegExp(window.__env__.TEST_REGEXP);
        } else if (window.isLibrary) {
            // 0000 functions
            // 0005 createClass mixins, vrdom allow overriding statics, react do not
            // 0011 undocumented order for setState-cb, component* and arguments in react
            // 0012 undocumented order for setState-cb, component* and arguments in react
            // 0022 hooks do not exist in react
            TEST_REGEXP = /[\/\\]tests[\/\\](?!0000|0005|0011|0012|0022)\d{4}-.*-prod-test\.js$/;
        } else {
            TEST_REGEXP = /[\/\\]tests[\/\\]\d{4}-.*-test\.js$/;
        }

        // add test files
        Object.keys(window.__karma__.files).forEach(function(file) {
            if (TEST_REGEXP.test(file)) {
                deps.push(pathToModule(file));
            }
        });

        // We have to kickoff testing framework,
        // after RequireJS is done with loading all the files.
        require(deps, window.__karma__.start);

        // Normalize a path to RequireJS module name.
        function pathToModule(path) {
            return pathBrowserify.relative(config.baseUrl, path).replace(/\.js$/, '');
        }
    });<%--

    --%><% } else if (isMain) { %>
        requirejs.config(config);
        require(['initialize']);<%--

    --%><% } else if (isMainDev) { %>

    var groups = config.groups;
    delete config.groups;

    requirejs.config(config);

    if (groups) {
        var name, index, deps, group;
        for (name in groups) {
            deps = groups[name];
            group = name + '-group';
            define(group, deps, function(main) {
                return main;
            });

            index = config.deps.indexOf(name);
            if (index !== -1) {
                config.deps[index] = group;
            }
        }
    }

    require(config.deps, function() {
        require(['initialize']);
    });

    <% } %>
}());

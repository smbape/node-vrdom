"use strict";

var OPT_NAME = "@babel-plugin-transform-react-display-name";
var INLINE_OPTIONS_REGEX = new RegExp(/\*?\s*/.source + OPT_NAME + /\s+([^\r\n]+)/.source);

module.exports = function(_ref) {
    var t = _ref.types;

    function addDisplayName(id, call, state) {
        var opts = state.get(OPT_NAME);

        var props = call.arguments[0].properties;
        var safe = true;
        var displayName = opts.value || "displayName";

        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            var key = t.toComputedKey(prop);
            if (t.isLiteral(key, {
                    value: displayName
                })) {
                safe = false;
                break;
            }
        }

        if (safe) {
            props.unshift(t.objectProperty(t.identifier(displayName), t.stringLiteral(id)));
        }
    }

    function isCreateClass(node, state) {
        var opts = state.get(OPT_NAME);

        if (!node || !t.isCallExpression(node)) {
            return false;
        }

        // not React.createClass call member object
        var isCreateClassCallExpression = t.buildMatchMemberExpression(opts.pragma || "React.createClass");
        if (!isCreateClassCallExpression(node.callee)) {
            return false;
        }

        // no call arguments
        var args = node.arguments;
        if (args.length !== 1) {
            return false;
        }

        // first node arg is not an object
        var first = args[0];
        if (!t.isObjectExpression(first)) {
            return false;
        }

        return true;
    }

    return {
        visitor: {
            Program: function Program(path, state) {
                var opts = {
                    pragma: state.opts.pragma || "React.createClass",
                    value: state.opts.value || "displayName"
                };

                var file = state.file;
                var comments = file.ast.comments;
                var comment, matches, json;

                for (var i = 0, len = comments.length; i < len; i++) {
                    comment = comments[i];
                    matches = INLINE_OPTIONS_REGEX.exec(comment.value);
                    if (matches) {
                        json = matches[1];
                        try {
                            json = JSON.parse(json);

                            if (json.pragma) {
                                opts.pragma = json.pragma;
                            }

                            if (json.value) {
                                opts.value = json.value;
                            }

                            break;
                        } catch ( err ) {
                            throw file.buildCodeFrameError(comment, "Invalid options for " + OPT_NAME + " " + json);
                        }
                    }
                }

                state.set(OPT_NAME, opts);
            },

            ExportDefaultDeclaration: function ExportDefaultDeclaration(path, state) {
                var node = path.node;

                if (isCreateClass(node.declaration, state)) {
                    var displayName = state.file.opts.basename;

                    // ./{module name}/index.js
                    if (displayName === "index") {
                        var parts = state.file.opts.filename.split(/[/\\]/);
                        displayName = parts[parts.length - 2];

                        // ./{module name}/lib/index.js, ./{module name}/src/index.js
                        if (displayName === "lib" || displayName === "src") {
                            displayName = parts[parts.length - 3];
                        }
                    }

                    addDisplayName(displayName, node.declaration, state);
                }
            },

            CallExpression: function CallExpression(path, state) {
                var node = path.node;

                if (!isCreateClass(node, state)) {
                    return;
                }

                var id;

                // crawl up the ancestry looking for possible candidates for displayName inference
                path.find(function(path) {
                    if (path.isAssignmentExpression()) {
                        id = path.node.left;
                    } else if (path.isObjectProperty()) {
                        id = path.node.key;
                    } else if (path.isVariableDeclarator()) {
                        id = path.node.id;
                    } else if (path.isStatement()) {
                        // we've hit a statement, we should stop crawling up
                        return true;
                    }

                    // we've got an id! no need to continue
                    if (id) {
                        return true;
                    }
                });

                // ensure that we have an identifier we can inherit from
                if (!id) {
                    return;
                }

                // foo.bar -> bar
                if (t.isMemberExpression(id)) {
                    id = id.property;
                }

                // identifiers are the only thing we can reliably get a name from
                if (t.isIdentifier(id)) {
                    addDisplayName(id.name, node, state);
                }
            }
        }
    };
};
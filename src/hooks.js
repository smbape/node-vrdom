var hasProp = require("./functions").hasProp;

var anonymousHooks = {};
var namedHooks = {};
var push = Array.prototype.push;

function appendHook(type, name, fn) {
    var hooks;

    if ("function" === typeof name) {
        fn = name;
        name = null;
    }

    if (name) {
        name = name.trim();

        if (/\s/.test(name)) {
            var names = name.split(/\s+/);

            for (var i = 0, len = names.length; i < len; i++) {
                name = names[i];
                appendHook(type, name, fn);
            }
            return;
        }

        if (hasProp.call(namedHooks, name)) {
            hooks = namedHooks[name];
        } else {
            hooks = namedHooks[name] = {};
        }
    } else {
        hooks = anonymousHooks;
    }

    if (hasProp.call(hooks, type)) {
        hooks[type].push(fn);
    } else {
        hooks[type] = [fn];
    }
}

function prependHook(type, name, fn) {
    var hooks;

    if ("function" === typeof name) {
        fn = name;
        name = null;
    }

    if (name) {
        name = name.trim();

        if (/\s/.test(name)) {
            var names = name.split(/\s+/).reverse();

            for (var i = 0, len = names.length; i < len; i++) {
                name = names[i];
                prependHook(type, name, fn);
            }
            return;
        }

        if (hasProp.call(namedHooks, name)) {
            hooks = namedHooks[name];
        } else {
            hooks = namedHooks[name] = {};
        }
    } else {
        hooks = anonymousHooks;
    }

    if (hasProp.call(hooks, type)) {
        hooks[type].unshift(fn);
    } else {
        hooks[type] = [fn];
    }
}

function removeHook(type, name, fn) {
    var hooks;

    if ("function" === typeof name) {
        fn = name;
        name = null;
    }

    if (name) {
        name = name.trim();
        if (/\s/.test(name)) {
            var names = name.split(/\s+/).reverse();

            for (var i = 0, len = names.length; i < len; i++) {
                name = names[i];
                removeHook(type, name, fn);
            }
            return;
        }

        if (hasProp.call(namedHooks, name)) {
            hooks = namedHooks[name];
        } else {
            hooks = namedHooks[name] = {};
        }
    } else {
        hooks = anonymousHooks;
    }

    if (hasProp.call(hooks, type)) {
        var fns = hooks[type];
        var idx = fns.lastIndexOf(fn);

        if (idx !== -1) {
            fns.splice(idx, 1);
        }

        if (fns.length === 0) {
            delete hooks[type];
            if (name) {
                delete namedHooks[name];
            }
        }
    }
}

function getHooks(type, name, checkOnly) {
    var hooks;
    var fns = [];

    if (name != null) {
        if ("string" !== typeof name) {
            if (checkOnly) {
                return false;
            }
            return fns;
        }

        name = name.trim();
        if (/\s/.test(name)) {
            var names = name.split(/\s+/).reverse();

            for (var i = 0, len = names.length; i < len; i++) {
                name = names[i];
                if (checkOnly) {
                    if (getHooks(type, name, checkOnly)) {
                        return true;
                    }
                } else {
                    push.apply(fns, getHooks(type, name));
                }
            }

            if (checkOnly) {
                return false;
            }

            return fns;
        }

        if (hasProp.call(namedHooks, name)) {
            hooks = namedHooks[name];
        } else {
            if (checkOnly) {
                return false;
            }
            return fns;
        }
    } else {
        hooks = anonymousHooks;
    }

    if (hasProp.call(hooks, type)) {
        if (checkOnly) {
            return true;
        }
        return hooks[type];
    }

    if (checkOnly) {
        return false;
    }

    return fns;
}

function hasHooks(type, name) {
    return getHooks(type, name, true);
}

module.exports = {
    appendHook: appendHook,
    prependHook: prependHook,
    removeHook: removeHook,
    getHooks: getHooks,
    hasHooks: hasHooks
};
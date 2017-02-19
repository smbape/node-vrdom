require("umd-builder/build");

if (/1|true|on|TRUE|ON/.test(String(process.env.SHOW_LOADED))) {
    var sysPath = require("path");
    var files = Object.keys(require("module")._cache).sort();

    var loaded = {};
    var file, moduleName;
    for (var i = 0, len = files.length; i < len; i++) {
        file = files[i];
        moduleName = getModuleName(file);
        if (loaded.hasOwnProperty(moduleName)) {
            loaded[moduleName].push(file);
        } else {
            loaded[moduleName] = [file];
        }
    }

    var sortedKeys = Object.keys(loaded).sort(function(a, b) {
        a = loaded[a].length;
        b = loaded[b].length;
        return a > b ? -1 : a < b ? 1 : 0;
    });

    var _ = require("lodash");
    loaded = _.pick(loaded, sortedKeys);

    console.log("loaded files", files.length);
    console.log(JSON.stringify(loaded, null, 4));
}

function getModuleName(file) {
    var node_modules = sysPath.sep + "node_modules" + sysPath.sep;
    var index = file.lastIndexOf(node_modules);
    return file.slice(index === -1 ? 0 : index + node_modules.length);
}
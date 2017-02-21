var fs = require("fs");
var sysPath = require("path");
var anyspawn = require("anyspawn");
var args = process.argv.slice(3).map(anyspawn.quoteArg);
var push = Array.prototype.push;
var hasProp = Object.prototype.hasOwnProperty;
var testClientRoot = sysPath.join(__dirname, "test", "unit", "src");
var mkdirp = require("mkdirp");
var deepExtend = require("deep-extend");
var request = require("request");

var opts = {
    stdio: "inherit",
    env: process.env,
    prompt: anyspawn.defaults.prompt
};

var testCommand = "node node_modules/karma/bin/karma start test/karma.conf.js";

var commands = {
    prepublish: "node scripts/prepublish.js",
    lint: "node node_modules/eslint/bin/eslint.js \"src/**/*.js\" \"vrdom-compat/**/*.js\" \"devtool/**/*.js\" \"test/unit/src/app/node_modules/tests/**/*.js\" \"test/unit/src/app/node_modules/Triggers.js\"",
    combine: "node scripts/istanbul-combine.js",

    "build-only": function(next) {
        opts.cwd = testClientRoot;
        spawn(["node build.js b"].concat(args).join(" "), function() {
            delete opts.cwd;
            next.apply(null, arguments);
        });
    },

    test: function(next) {
        spawn([testCommand].concat(args).join(" "), next);
    },

    watch: function(next) {
        opts.cwd = testClientRoot;
        spawn(["node build.js w -s"].concat(args).join(" "), function() {
            delete opts.cwd;
            next.apply(null, arguments);
        });
    },

    postinstall: function(next) {
        if (process.env.npm_config_production === "true") {
            next();
            return;
        }

        var argv = JSON.parse(process.env.npm_config_argv);
        if (argv.remain.length !== 0) {
            next();
            return;
        }

        var istanbulFile;
        try {
            istanbulFile = require.resolve("isparta/node_modules/istanbul/lib/instrumenter");
        } catch ( e ) {
            try {
                istanbulFile = require.resolve("istanbul/lib/instrumenter");
            } catch( e ) {
                next();
                return;
            }
        }

        var node_modules = sysPath.join(__dirname, "node_modules") + sysPath.sep;
        if (istanbulFile.substr(0, node_modules.length) !== node_modules) {
            // istanbul not installed locally
            next();
            return;
        }

        var patch = sysPath.join(__dirname, "patches", "istanbul_0.4.x_comments.patch");
        spawn([
            "patch -N " + anyspawn.quoteArg(istanbulFile) + " < " + anyspawn.quoteArg(patch),
            commands["install-test-client"],
            commands["build-cover"]
        ], next);
    },

    "watch-prepublish": function(next) {
        process.env.BRUNCH_PREPUBLISH = "1";
        spawn(commands.watch, next);
    },

    "watch-prepublish-cover": function(next) {
        process.env.COVERAGE = "1";
        process.env.BRUNCH_PREPUBLISH = "1";
        spawn(commands.watch, next);
    },

    "prepublish-cover": function(next) {
        process.env.COVERAGE = "1";
        spawn(commands.prepublish, next);
    },

    "build-cover": function(next) {
        process.env.COVERAGE = "1";
        spawn(commands.build, next);
    },

    "install-test-client": installTestClient,

    "public-distribution": function(next) {
        opts.cwd = sysPath.resolve(__dirname, "..");
        spawn([
            "mv node-vrdom/.git node-vrdom/.git.bak",
            "mv node-rvdom/.git node-vrdom",
            "cd node-vrdom && git reset --hard HEAD && git clean --force",
            "mv node-vrdom/.git node-rvdom",
            "mv node-vrdom/.git.bak node-vrdom/.git",
            rvdomtovrdom
        ], function() {
            delete opts.cwd;
            next.apply(null, arguments);
        });
    }
};

commands.build = [
    commands.prepublish,
    commands["build-only"]
];

commands["build-test"] = commands.build.concat(commands.test);

commands["test-cover"] = function(next) {
    process.env.TEST_REGEXP = /[/\\]tests[/\\]\d{4}-.*-test\.js$/.source.replace(/\\/g, "\\\\");
    process.env.COVERAGE = "1";

    spawn(commands.test, function() {
        // ignore error
        spawn(commands.combine, next);
    });
};

commands["build-test-cover"] = [commands["build-cover"]].concat(commands["test-cover"]);

commands["test-cover-browsers"] = function(next) {
    process.env.TEST_REGEXP = /[/\\]tests[/\\]\d{4}-.*-test\.js$/.source.replace(/\\/g, "\\\\");
    process.env.COVERAGE = "1";

    spawn([
        function(next) {
            var rimraf = require("rimraf");
            rimraf(sysPath.join(__dirname, "coverage"), next);
        },
        function(next) {
            mkdirp(sysPath.join(__dirname, "coverage"), next);
        }, [
            testCommand,
            "--single-run",
            "--concurrency 1",
            "--reporters progress,coverage",
            "--browsers Chrome,Firefox,Opera,Edge,IE11,IE10,IE9",
        ].concat(args).join(" ")
    ], function() {
        // ignore error
        spawn(commands.combine, next);
    });
};

var aliases = {
    distribute: "prepublish"
};

var command = process.argv[2];
if (hasProp.call(aliases, command)) {
    command = aliases[command];
}

if (hasProp.call(commands, command)) {
    spawn(commands[command]);
} else if (command != null) {
    throw new Error("unknown command " + command);
} else {
    console.log("Available commands", Object.keys(commands).sort());
}

function installTestClient(done) {
    opts.cwd = testClientRoot;

    var dependencies = {
        preact: "7.2.0",
        proptypes: "0.14.4",
        "preact-compat": "3.13.1",
    };

    spawn([
        "npm install",
        updateBowerJSON({
            dependencies: {
                "preact": (void 0),
                "preact-compat": (void 0),
                "proptypes": (void 0)
            }
        }),
        "bower install",
        installBowerFile({
            name: "preact",
            main: "preact.js",
            version: dependencies.preact,
            cdn: "https://unpkg.com/preact"
        }),
        installBowerFile({
            name: "proptypes",
            main: "proptypes.js",
            version: dependencies.proptypes,
            cdn: "https://unpkg.com/proptypes"
        }),
        function(next) {
            var mainFile = sysPath.join(testClientRoot, "bower_components", "proptypes", "proptypes.js");
            var patch = sysPath.join(__dirname, "patches", "proptypes_0.14.4.patch");
            var cmd = "patch -N " + anyspawn.quoteArg(mainFile) + " < " + anyspawn.quoteArg(patch);
            spawn(cmd, next);
        },
        installBowerFile({
            name: "preact-compat",
            main: "preact-compat.js",
            version: dependencies["preact-compat"],
            cdn: "https://unpkg.com/preact-compat",
            dependencies: {
                preact: "*",
                proptypes: "*"
            }
        }),
        function(next) {
            var mainFile = sysPath.join(testClientRoot, "bower_components", "preact-compat", "preact-compat.js");
            var patch = sysPath.join(__dirname, "patches", "preact-compat_3.13.1.patch");
            var cmd = "patch -N " + anyspawn.quoteArg(mainFile) + " < " + anyspawn.quoteArg(patch);
            spawn(cmd, next);
        },
        updateBowerJSON({
            dependencies: {
                "preact": "^" + dependencies.preact,
                "proptypes": "^" + dependencies.proptypes,
                "preact-compat": "^" + dependencies["preact-compat"]
            }
        })
    ], function(err) {
        delete opts.cwd;
        done.apply(null, arguments);
    });
}

function updateBowerJSON(config) {
    return function() {
        var next = arguments[arguments.length - 1];
        var bowerFile = sysPath.join(testClientRoot, "bower.json");
        fs.readFile(bowerFile, function(err, data) {
            if (err) {
                next(err);
                return;
            }

            config = deepExtend(JSON.parse(data.toString()), config);
            orderProperty(config, "dependencies");
            orderProperty(config, "overrides");

            fs.writeFile(bowerFile, JSON.stringify(config, null, 2), next);
        });
    };
}

function orderProperty(obj, prop) {
    var current = obj[prop];
    var updated = {};
    Object.keys(current).sort().forEach(function(dep) {
        updated[dep] = current[dep];
    });
    obj[prop] = updated;
}

function installBowerFile(config) {
    var compenent = config.name,
        url = config.cdn + "@" + config.version,
        dest = sysPath.join(testClientRoot, "bower_components", compenent),
        file = sysPath.join(dest, config.main);

    var bowerFile = JSON.stringify(config, null, 2);

    return function() {
        var next = arguments[arguments.length - 1];
        mkdirp(dest, function(err) {
            if (err) {
                next(err);
                return;
            }

            // fs.writeFile(sysPath.join(dest, "bower.json"), bowerFile, next);

            var writer = fs.createWriteStream(file);
            writer.on("error", next);
            writer.on("finish", function() {
                fs.writeFile(sysPath.join(dest, "bower.json"), bowerFile, next);
            });
            request(url).pipe(writer);
        });
    };
}

function spawn(cmd) {
    var done;

    if (!Array.isArray(cmd)) {
        cmd = [cmd];
    }

    var arg;
    var last = arguments.length - 1;
    for (var i = 1; i < last; i++) {
        arg = arguments[i];
        if (Array.isArray(arg)) {
            push.call(cmd, arg);
        } else {
            cmd.push(arg);
        }
    }

    if (last > 0) {
        done = arguments[last];
    } else {
        done = Function.prototype;
    }

    anyspawn.spawnSeries(cmd, opts, done);
}

function rvdomtovrdom(done) {
    var fs = require("fs-extra");
    var explore = require("fs-explorer").explore;
    var async = require("async");

    var cwd = sysPath.resolve(__dirname, "..", "node-vrdom");

    var toIgnore = new RegExp(("^" + cwd + "/(?:" + [
        ".git",
        "node_modules",
        "test/unit/src/node_modules",
        "test/unit/src/bower_components",
        "test/unit/src/public",
        "cli.js"
    ].join("|") + ")$").replace(/[/\\]/g, /[/\\]/.source).replace(/\./g, "\\."));

    explore(cwd, function(absolutePath, stats, next) {
        if (toIgnore.test(absolutePath)) {
            next();
            return;
        }

        var path = sysPath.relative(cwd, absolutePath);
        var rvdomReg = /rvdom/g;

        async.waterfall([
            function(next) {
                var filepath = path;

                if (rvdomReg.test(path)) {
                    filepath = path.replace(rvdomReg, "vrdom");
                }

                next(null, filepath);
            },
            function(filepath, next) {
                fs.readFile(absolutePath, function(err, buffer) {
                    if (err) {
                        next(err);
                        return;
                    }

                    var content = buffer.toString();
                    if (rvdomReg.test(content)) {
                        content = content.replace(rvdomReg, "vrdom");
                        fs.writeFile(absolutePath, content, function(err) {
                            if (err) {
                                next(err);
                                return;
                            }

                            console.log("replaced content of", path);
                            next(null, filepath);
                        });
                        return;
                    }

                    next(null, filepath);
                });
            },
            function(filepath, next) {
                if (filepath !== path) {
                    console.log("move", path, "to", filepath);
                    // anyspawn.exec("git", ["mv", path, filepath], {
                    //     cwd: cwd,
                    //     stdio: "inherit",
                    //     prompt: anyspawn.defaults.prompt
                    // }, next);
                    fs.move(sysPath.join(cwd, path), sysPath.join(cwd, filepath), { overwrite: true }, next);
                    return;
                }

                next();
            }
        ], next);
    }, function(absolutePath, stats, files, state, next) {
        if (state === "begin" && toIgnore.test(absolutePath)) {
            console.log("ignore", absolutePath);
            next(null, true);
            return;
        }

        next();
    }, {followSymlink: true}, function(err) {
        done;
    });

}

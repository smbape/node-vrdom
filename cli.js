var fs = require("fs");
var sysPath = require("path");
var anyspawn = require("anyspawn");
var args = process.argv.slice(3).map(anyspawn.quoteArg);
var push = Array.prototype.push;
var hasProp = Object.prototype.hasOwnProperty;
var testClientRoot = sysPath.join(__dirname, "test", "unit");
var mkdirp = require("mkdirp");
var deepExtend = require("deep-extend");
var request = require("request");
var distribute = require("./scripts/distribute");

var opts = {
    stdio: "inherit",
    env: process.env,
    prompt: anyspawn.defaults.prompt
};

var testCommand = "node node_modules/karma/bin/karma start test/karma.conf.js";
var rootBowerFile = sysPath.join(__dirname, "bower.json");

var commands = {
    prepack: distribute,
    lint: "node node_modules/eslint/bin/eslint.js \"src/**/*.js\" \"vrdom-compat/**/*.js\" \"vrdom-devtools/**/*.js\" \"test/unit/app/node_modules/tests/**/*.js\" \"test/unit/app/node_modules/Triggers.js\"",
    "lint-fix": "node node_modules/eslint/bin/eslint.js --fix \"src/**/*.js\" \"vrdom-compat/**/*.js\" \"vrdom-devtools/**/*.js\" \"test/unit/app/node_modules/tests/**/*.js\" \"test/unit/app/node_modules/Triggers.js\"",
    combine: "node scripts/istanbul-combine.js",

    version: [
        function(next) {
            fs.readFile(rootBowerFile, function(err, data) {
                if (err) {
                    return next(err);
                }
    
                var version = require("./package").version;
                var content = data.toString();
                content = content.replace(/^(\s*"version":\s*)"([^"]+)"/mg, "$1\"" + version + "\"");
                fs.writeFile(rootBowerFile, content, next);
            });
        },

        ["git", ["add", rootBowerFile]]
    ],

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

        var argv = process.env.npm_config_argv ? JSON.parse(process.env.npm_config_argv) : { remain: [] };
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

    "watch-prepack": function(next) {
        process.env.BRUNCH_PREPUBLISH = "1";
        spawn(commands.watch, next);
    },

    "watch-prepack-cover": function(next) {
        process.env.COVERAGE = "1";
        process.env.BRUNCH_PREPUBLISH = "1";
        spawn(commands.watch, next);
    },

    "prepack-cover": function(next) {
        process.env.COVERAGE = "1";
        spawn(commands.prepack, next);
    },

    "build-cover": function(next) {
        process.env.COVERAGE = "1";
        spawn(commands.build, next);
    },

    "install-test-client": installTestClient,
};

commands.build = [
    commands.prepack,
    commands["build-only"]
];

commands["build-test"] = commands.build.concat(commands.test);

commands["test-cover"] = function(next) {
    process.env.TEST_REGEXP = /[/\\]tests[/\\]\d{4}-.*-test\.js$/.source.replace(/\\/g, "\\\\");
    process.env.COVERAGE = "1";

    spawn(commands.test, function(err) {
        // ignore test errors
        if (err) {
            console.error(err);
            if (err.code === "EPERM") {
                next();
                return
            }
        }
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
    ], function(err) {
        // ignore test errors
        if (err) {
            console.error(err);
            if (err.code === "EPERM") {
                next();
                return
            }
        }
        spawn(commands.combine, next);
    });
};

var aliases = {
    distribute: "prepack"
};

var command = process.argv[2];
if (hasProp.call(aliases, command)) {
    command = aliases[command];
}

if (hasProp.call(commands, command)) {
    spawn(commands[command], err => {
        if (err) {
            err = typeof err === "number" ? new Error("last command exited with code " + err) : err;
            throw err;
        }
    });
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
                "preact": undefined,
                "preact-compat": undefined,
                "proptypes": undefined
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

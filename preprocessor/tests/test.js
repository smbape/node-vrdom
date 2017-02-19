var fs = require("fs");
var sysPath = require("path");
var _ = require("lodash");
var Parser = require("../Parser");
var assert = require("assert");

// var source = `
// // leading if
// if (type === "string" || type === "number") {
//     // if block
// }
// // trailing if
// // leading else if
// else if (child != null) {
//     // else if block
// }
// // trailing else if
// // leading another else if
// else if (condition) {
//     // another else if block
//     instruction();
// }
// // trailing another else if
// // leading else
// else {
//     // else block
// }
// // trailing else
// `;

// var acorn = require("acorn");
// var escodegen = require("escodegen");
// var estraverse = require("estraverse");

// var comments = [], tokens = [];

// var ast = acorn.parse(source, {
//     // collect ranges for each node
//     ranges: true,
//     // collect comments in Esprima's format
//     onComment: comments,
//     // collect token ranges
//     onToken: tokens
// });

// // attach comments using collected information
// estraverse.attachComments(ast, comments, tokens);

// console.log(ast.body);

// // generate code
// console.log(escodegen.generate(ast, {comment: true}));
// return;

// var ESP = require("esprima");
// var ESPGEN = require("escodegen");

// var program = ESP.parse(source, {
//     loc: true,
//     range: true,
//     tokens: true,
//     comment: true,
//     sourceType: 'script'
// });
// program = ESPGEN.attachComments(program, program.comments, program.tokens);

// console.log(JSON.stringify(program.body, null, 4));

// var codegenOptions = {
//     "format": {
//         "compact": false
//     },
//     "comment": true
// };

// var generated = ESPGEN.generate(program, codegenOptions);

// // console.log(generated);
// return;

// var env = {
//     DEBUG: true,
//     production: false,
//     version: 3.5,
//     OS: "android",
//     NODE_ENV: "production"
// };

// // var filename = "E:\\development\\git\\node-vrdom\\src\\functions\\flattenChildrenToString.js";
// var filename = "E:\\development\\git\\node-vrdom\\src\\controls\\index.js";
// var source = fs.readFileSync(filename).toString();

// var options = {
//     embedSource: true,
//     noAutoWrap: true,
//     preserveComments: true,
//     noCompact: true,
//     walkDebug: false
// };
// var isparta = require('isparta');
// var instrumenter = new isparta.Instrumenter(options);
// var code = instrumenter.instrumentSync(source, filename);
// fs.writeFileSync(sysPath.join(__dirname, "..", "controls.in.js"), code);

// var actualEnv = _.clone(env);
// var out = Parser.preprocess(code, actualEnv);
// fs.writeFileSync(sysPath.join(__dirname, "..", "controls.out.js"), out);

// return;

var env = {
    DEBUG: true,
    production: false,
    version: 3.5,
    OS: "android",
    NODE_ENV: "production"
};

var expectedEnvs = {
    simple: {
        simple: "expression"
    },
    nested: {
        nested: "expression",
        deepNested: "expression",
        top: "expression",
    }
}

var files = ["empty", "simple", "nested"];
var filename, code, out, expected, actualEnv, expectedEnv;

for (var i = 0, len = files.length; i < len; i++) {
    console.log("default", files[i]);
    filename = files[i];
    code = fs.readFileSync(sysPath.join(__dirname, filename + ".in.js")).toString();

    actualEnv = _.clone(env);
    out = Parser.preprocess(code, actualEnv);
    fs.writeFileSync(sysPath.join(__dirname, filename + ".out.js"), out);

    expected = fs.readFileSync(sysPath.join(__dirname, filename + ".expected.js")).toString();
    assert.strictEqual(out, expected);

    expectedEnv = expectedEnvs[filename] || {};
    _.defaults(expectedEnv, env);
    assert.strictEqual(_.isEqual(actualEnv, expectedEnv), true);
}

var options = {
    commentStart: "",
    commandStart: "@",
    literals: {
        define: "definir",
        if: "si",
        elif: "sinonsi",
        elseif: "sinon si",
        else: "sinon",
        endif: "finsi"
    }
};

for (var i = 0, len = files.length; i < len; i++) {
    console.log("fr", files[i]);
    filename = files[i];
    code = fs.readFileSync(sysPath.join(__dirname, filename + "fr.in.js")).toString();

    actualEnv = _.clone(env);
    out = Parser.preprocess(code, actualEnv, options);
    fs.writeFileSync(sysPath.join(__dirname, filename + "fr.out.js"), out);

    expected = fs.readFileSync(sysPath.join(__dirname, filename + "fr.expected.js")).toString();
    assert.strictEqual(out, expected);

    expectedEnv = expectedEnvs[filename] || {};
    _.defaults(expectedEnv, env);
    assert.strictEqual(_.isEqual(actualEnv, expectedEnv), true);
}

console.log("it should deal with instrumented code");
files = ["attachRef", "implement", "LinkUtils", "Renderer"];

for (var i = 0, len = files.length; i < len; i++) {
    console.log("default", files[i]);
    filename = files[i];
    code = fs.readFileSync(sysPath.join(__dirname, filename + ".in.js")).toString();

    actualEnv = _.clone(env);
    out = Parser.preprocess(code, actualEnv);
    fs.writeFileSync(sysPath.join(__dirname, filename + ".out.js"), out);

    expected = fs.readFileSync(sysPath.join(__dirname, filename + ".expected.js")).toString();
    assert.strictEqual(out, expected);

    expectedEnv = expectedEnvs[filename] || {};
    _.defaults(expectedEnv, env);
    assert.strictEqual(_.isEqual(actualEnv, expectedEnv), true);
}

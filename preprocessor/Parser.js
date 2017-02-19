"use strict";

var SourceMapConsumer = require("source-map").SourceMapConsumer;
var hasProp = Object.prototype.hasOwnProperty;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
var assign = typeof Object.assign === "function" ? Object.assign /* istanbul ignore next */ : function(target) {
    "use strict";
    if (target == null) { // TypeError if undefined or null
        throw new TypeError("Cannot convert undefined or null to object");
    }

    var to = Object(target);

    for (var index = 1, len = arguments.length; index < len; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (hasProp.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
};

var ParserProto = {};

var ESP = require("esprima");

ParserProto.parse = function parse(input, options, map) {
    this.input = input;
    this.sourceMap = map;
    this.pos = 0;
    this.lines = {};

    if (options == null) {
        options = {};
    }

    var parser = options.parser || ESP;
    var parserOptions = options.parserOptions || {
        loc: true,
        range: true,
        tokens: true,
        comment: true,
        sourceType: options.esModules ? "module" : "script"
    };

    var program = parser.parse(input, parserOptions);
    var comments = this.comments = program.comments;

    this.commentStart = options.commentStart == null ? "/" : options.commentStart;
    this.commandStart = options.commandStart == null ? "#" : options.commandStart;
    this.commentStartLength = this.commentStart.length;

    var literals = options.literals == null ? {} : options.literals;

    this.literals = {
        define: literals.define || "define",
        if: literals.if || "if",
        elif: literals.elif || "elif",
        elseif: literals.elseif || "else if",
        else: literals.else || "else",
        endif: literals.endif || "endif"
    };

    var tokens = this.tokens = [];
    var start = 0;
    var comment, range, end;
    for (var i = 0, len = comments.length; i < len; i++) {
        comment = comments[i];
        range = comment.range;
        end = range[0];

        if (start !== end) {
            tokens.push({
                type: "LiteralExpression",
                range: [start, end]
            });
        }

        tokens.push(comment);
        start = range[1];
    }

    if (start !== input.length) {
        tokens.push({
            type: "LiteralExpression",
            range: [start, input.length]
        });
    }

    var ast = {
        type: "Program",
        source: input,
        body: this.maybeLineSequence() || [],
        start: 0,
        end: input.length
    };

    if (this.pos !== this.tokens.length) {
        throw new Error("Unexpected token at " + this.printPos(this.pos));
    }

    return ast;
};

/**
 * { IfStatement | TextLine }
 * @return {[type]} [description]
 */
ParserProto.maybeLineSequence = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var sequences = [];

    var line, lastLine;
    var hasLine = false;
    while (line = this.maybeLine()) {
        if (lastLine && lastLine.type === "LiteralExpression" && line.type === "LiteralExpression") {
            lastLine.end = line.end;
        } else {
            sequences.push(line);
            lastLine = line;
        }
        hasLine = true;
    }

    return hasLine ? sequences : false;
};

ParserProto.maybeLine = function() {
    return this.maybeDefineLine() || this.maybeIfStatement() || this.maybeStringLine();
};

/**
 * "/// #define" ( EOL | EOF )
 * @return {[type]} [description]
 */
ParserProto.maybeDefineLine = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var pos = this.pos;
    var ast = this.maybeLineExpression(this.literals.define, pos, "AssignmentExpression");

    if (!ast) {
        return false;
    }

    if (!ast.expression) {
        throw new Error("Expecting expression for " + this.literals.define + " at " + this.printPos(ast.pos));
    }

    var match = ast.expression.match(/^(\w+)\s+(.+)$/);
    if (match === null) {
        throw new Error("Invalid " + this.literals.define + " expression at " + this.printPos(ast.pos));
    }

    ast.name = match[1];
    ast.expression = match[2];

    return ast;
};

/**
 * IfLine LineSequence { ElifLine LineSequence } [ ElseLine LineSequence ] EndLine
 * @return {[type]} [description]
 */
ParserProto.maybeIfStatement = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var pos = this.pos;
    var range = this.tokens[pos].range;

    var ast = {
        type: "IfStatement",
        start: range[0],
        end: (void 0)
    };

    var ifLine = this.maybeIfLine();
    if (!ifLine) {
        return false;
    }
    ast["#if"] = ifLine;

    var consequent = this.maybeLineSequence();
    if (consequent) {
        ast.consequent = consequent;
    }

    var cases = [];
    var hasCases = false;
    var elif;
    while (elif = this.maybeElifStatement()) {
        cases.push(elif);
        hasCases = true;
    }

    if (hasCases) {
        ast.cases = cases;
    }

    var alternate = this.maybeElseStatement();
    if (alternate) {
        ast["#else"] = alternate;
    }

    var endif = this.maybeEndIfLine();
    if (!endif) {
        throw new Error("Unmatched endif for " + this.literals.if + " at " + this.printPos(ifLine.pos));
    }

    ast["#endif"] = endif;
    ast.end = endif.end;
    return ast;
};

/**
 * "/// #if <expression>"
 * @return {[type]} [description]
 */
ParserProto.maybeIfLine = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var pos = this.pos;
    var ast = this.maybeLineExpression(this.literals.if, pos, "IfLineExpression");
    if (!ast) {
        return false;
    }

    if (!ast.expression) {
        throw new Error("Expecting an expression for " + this.literals.if + " at " + this.printPos(ast.pos));
    }
    return ast;
};

/**
 * ElifLine LineSequence
 * @return {[type]} [description]
 */
ParserProto.maybeElifStatement = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var ast = this.maybeElifLine();
    if (!ast) {
        return false;
    }

    ast.consequent = this.maybeLineSequence();
    return ast;
};

/**
 * "/// #elif" ( EOL | EOF )
 * @return {[type]} [description]
 */
ParserProto.maybeElifLine = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var pos = this.pos;
    var ast = this.maybeLineExpression([this.literals.elif, this.literals.elseif], pos, "ElifLineExpression");

    if (!ast) {
        return false;
    }

    if (!ast.expression) {
        throw new Error("Expecting and expression for " + this.literals.elif + " at " + this.printPos(ast.pos));
    }

    this.pos = ast.pos + 1;
    return ast;
};

/**
 * ElseLine LineSequence
 * @return {[type]} [description]
 */
ParserProto.maybeElseStatement = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var ast = this.maybeElseLine();
    if (!ast) {
        return false;
    }

    var consequent = this.maybeLineSequence();
    if (consequent) {
        ast.consequent = consequent;
    }
    return ast;
};

/**
 * "/// #else" ( EOL | EOF )
 * @return {[type]} [description]
 */
ParserProto.maybeElseLine = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var pos = this.pos;
    var ast = this.maybeLineExpression(this.literals.else, pos, "ElseLineExpression");

    if (!ast) {
        return false;
    }

    if (ast.expression) {
        throw new Error("Unexpected expression for " + this.literals.else + " at " + this.printPos(ast.pos));
    }

    this.pos = ast.pos + 1;
    return ast;
};

/**
 * "/// #endif" ( EOL | EOF )
 * @return {[type]} [description]
 */
ParserProto.maybeEndIfLine = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var pos = this.pos;
    var ast = this.maybeLineExpression(this.literals.endif, pos, "EndIfLineExpression");

    if (!ast) {
        return false;
    }

    if (ast.expression) {
        throw new Error("Unexpected expression for " + this.literals.endif + " at " + this.printPos(ast.pos));
    }

    this.pos = ast.pos + 1;
    return ast;
};

/**
 * !"/// #( define | if | elif | else | endif )" ( EOL | EOF )
 * @return {[type]} [description]
 */
ParserProto.maybeStringLine = function() {
    if (this.pos === this.tokens.length) {
        return false;
    }

    var pos = this.pos;

    var ast = this.maybeLineExpression([
        this.literals.define,
        this.literals.if,
        this.literals.elif,
        this.literals.elseif,
        this.literals.else,
        this.literals.endif
    ], pos);

    if (ast) {
        this.pos = pos;
        return false;
    }

    var range = this.tokens[pos].range;
    this.pos = pos + 1;

    return {
        type: "LiteralExpression",
        start: range[0],
        end: range[1],
        pos: pos
    };
};

ParserProto.consumeSpace = function(input, pos) {
    if (pos === input.length) {
        return false;
    }

    var spaceReg = /[^\S\r\n]/;
    var hasSpace = false;

    while (spaceReg.test(input[pos])) {
        pos++;
        hasSpace = true;
    }

    return hasSpace ? pos : false;
};

ParserProto.maybeLineExpression = function(type, pos, typeName) {
    if (pos === this.tokens.length) {
        return false;
    }

    var comment = this.tokens[pos];
    if (comment.type === "LiteralExpression") {
        return false;
    }

    var commentValue = comment.value;
    var index = 0;

    if (commentValue.slice(index, index + this.commentStartLength) !== this.commentStart) {
        return false;
    }

    index = this.consumeSpace(commentValue, index + this.commentStartLength);
    if (index === false) {
        return false;
    }

    if (!Array.isArray(type)) {
        type = [type];
    }

    var typeStart, typeStartLen, typeStatementStart, typeStatementEnd, expressionStart;

    var i = 0,
        len = type.length;

    var found = false;

    while (i < len) {
        typeStart = this.commandStart + type[i];
        typeStartLen = typeStart.length;

        if (commentValue.slice(index, index + typeStartLen) === typeStart) {
            typeStatementStart = index;
            typeStatementEnd = typeStatementStart + typeStartLen;
            expressionStart = this.consumeSpace(commentValue, typeStatementEnd);

            if (expressionStart === false && typeStatementEnd === commentValue.length) {
                expressionStart = typeStatementEnd;
            }

            if (expressionStart !== false) {
                found = type[i];
                break;
            }
        }

        i++;
    }

    if (!found) {
        return false;
    }

    if ("string" !== typeof typeName) {
        typeName = found[0].toUpperCase() + found.slice(1) + "LineExpression";
    }

    var expressionEnd = commentValue.length;
    var expression;

    if (expressionStart !== expressionEnd) {
        expression = commentValue.slice(expressionStart, expressionEnd).trim();
    }

    var ast = {
        type: typeName,
        start: comment.range[0],
        end: comment.range[1],
        pos: pos
    };

    if (expression) {
        ast.expression = expression;
    }

    this.pos = pos + 1;
    return ast;
};

ParserProto.printPos = function(pos) {
    var comment = this.tokens[pos];
    var loc = comment.loc.start;
    var line = loc.line;
    var column = loc.column + 1;

    if (this.sourceMap) {
        var consumer = new SourceMapConsumer(this.sourceMap);
        var originalPosition = consumer.originalPositionFor({
            line: line,
            column: column
        });
        line = originalPosition.line;
        // column = originalPosition.column; // column always return 0
        ;
    }

    return "(" + line + ":" + column + ")";
}

function evaluate(program, env, ast) {
    if (Array.isArray(ast)) {
        return _map(ast, evaluate.bind(null, program, env)).join("");
    }

    switch (ast.type) {
        case "LiteralExpression":
            return program.source.slice(ast.start, ast.end);
        case "AssignmentExpression":
            return evaluateAssigment(program, env, ast);
        case "IfStatement":
            return evalIfStatement(program, env, ast);
        default:
            throw new Error("Unknown ast type " + ast.type);
    }
}

function evaluateAssigment(program, env, ast) {
    var evaluator = [
        "'use strict'; function evaluator(define) {",

        _map(env, function(value, name) {
            return "    var " + name + " = arguments[1]." + name + ";";
        }).join("\n    "),

        "    define('" + ast.name + "', " + ast.expression + ");",

        "}; evaluator;"
    ].join("\n");

    evaluator = eval(evaluator); // eslint-disable-line no-eval
    evaluator(define.bind(null, env), env);

    var start = ast.start;
    var end = ast.end;
    return maskCode(program, start, end);
}

function evalIfStatement(program, env, ast) {
    var str = [];

    // mask if line
    var start = ast.start;
    var end = ast["#if"].end;
    str.push(maskCode(program, start, end));

    if (evaluateExpression(ast["#if"].expression, env)) {
        str.push(evaluate(program, env, ast.consequent));

        // mask all elif/else blocks until endif
        if (ast.cases || ast["#else"]) {
            start = (ast.cases && ast.cases[0] || ast["#else"]).start;
            end = ast["#endif"].start;
            str.push(maskCode(program, start, end));
        }
    } else if (ast.cases || ast["#else"]) {
        var consequent, expression;
        var hasConsequent = false;

        if (ast.cases) {
            for (var i = 0, cases = ast.cases, len = cases.length; i < len; i++) {
                consequent = cases[i].consequent;
                expression = cases[i].expression;
                if (evaluateExpression(expression, env)) {
                    hasConsequent = true;
                    end = cases[i].end; // begining of possible consequent
                    break;
                }
            }
        }

        if (!hasConsequent) {
            if (ast["#else"]) {
                consequent = ast["#else"].consequent;
                end = ast["#else"].end; // begining of possible consequent
                hasConsequent = true;
            }
        }

        if (hasConsequent) {
            // mask from end of #if until begining of possible consequent
            start = ast["#if"].end;
            str.push(maskCode(program, start, end));

            if (consequent) {
                str.push(evaluate(program, env, consequent));
                start = consequent[consequent.length - 1].end;
                end = ast["#endif"].start;
                str.push(maskCode(program, start, end));
            }
        } else {
            start = ast["#if"].end;
            end = ast["#endif"].start;
            str.push(maskCode(program, start, end));
        }
    } else {
        start = ast["#if"].end;
        end = ast["#endif"].start;
        str.push(maskCode(program, start, end));
    }

    start = ast["#endif"].start;
    end = ast.end;
    str.push(maskCode(program, start, end));
    return str.join("");
}

function maskCode(program, start, end) {
    if (start == null || start === end) {
        return "";
    }

    var str = program.source.slice(start, end);
    return str.replace(/^([^\S\r\n]*)([^\r\n]+)$/mg, function(match, leading, trailing) {
        if (trailing.length < 2) {
            trailing = " ";
        } else {
            trailing = trailing.replace(/./g, "/");
        }
        return leading + trailing;
    });
}

function evaluateExpression(expression, env) {
    var evaluator = [
        "'use strict'; function evaluator(define) {",

       _map(_pickBy(env, function(value, name) {
            return /^\w+$/.test(name);
        }), function(value, name) {
            return "    var " + name + " = arguments[1]." + name + ";";
        }).join("\n    "),

        "    return " + expression + ";",

        "}; evaluator;"
    ].join("\n");

    evaluator = eval(evaluator); // eslint-disable-line no-eval
    return evaluator(define.bind(null, env), env);
}

function define(env, name, value) {
    env[name] = value;
}

function _pickBy(obj, callback) {
    var res = {};

    Object.keys(obj).filter(function(key) {
        return callback(obj[key], key, obj);
    }).forEach(function(key) {
        res[key] = obj[key];
    });

    return res;
}

function _map(obj, callback) {
    if (Array.isArray(obj)) {
        return obj.map(callback);
    }

    return Object.keys(obj).map(function(key) {
        return callback(obj[key], key, obj);
    });
}

function _clone(src) {
    if (Array.isArray(src)) {
        return src.slice();
    }

    if (src == null) {
        return src;
    }

    if ("object" === typeof src) {
        return assign({}, src);
    }

    return null;
}

exports.parse = parse;
function parse(input, options, map) {
    var parser = Object.create(ParserProto);
    return parser.parse(input, options, map);
};

exports.generate = generate;
function generate(program, env) {
    return evaluate(program, env, program.body);
}

exports.preprocess = preprocess;
function preprocess(input, env, options, map) {
    var ast = parse(input, options, map);
    if (env == null || "object" !== typeof env) {
        env = _clone(process.env);
    }

    return generate(ast, env);
}

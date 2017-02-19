/* eslint-disable strict */
"use strict";

// https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax

var fs = require("fs");
var sysPath = require("path");
var cheerio = require("cheerio");
var _ = require("lodash");
var explore = require("fs-explorer").explore;
var hasProp = Object.prototype.hasOwnProperty;
var mkdirp = require("mkdirp");
var normalizeCssProps = require("../functions/normalizeCssProps");
var normalizeCssProp = require("../functions/normalizeCssProp");
var wget = require("../scrap/wget");
var async = require("../scrap/async");
var eachParallel = async.eachParallel;
var eachSeries = async.eachSeries;

// http://stackoverflow.com/questions/32605593/is-there-a-flex-grow-for-ie10#answer-32605684

var NumberTypes = new RegExp("^(?:" + [
        "<integer>",
        "<number>",
        "<number-optional-number>",
        "<opacity-value>",
        /\d+/.source
    ].join("|") + ")$");

var options = {
    CSSProperties: {},
    userDefinedCssPropMap: {
        "-moz-border-end": "border-inline-end",
        "-moz-border-end-color": "border-inline-end-color",
        "-moz-border-end-style": "border-inline-end-style",
        "-moz-border-end-width": "border-inline-end-width",
        "-moz-border-start": "border-inline-start",
        "-moz-border-start-color": "border-inline-start-color",
        "-moz-border-start-style": "border-inline-start-style",
        "-moz-border-start-width": "border-inline-start-width",
    },
    elements: {},
    lengthableCssProps: {},
    userDefinedLengthableProps: {
        "-webkit-box-reflect": false,
        "additive-symbols": false,
        "background": true,
        "background-image": false,
        "background-position": true,
        "border-image-outset": true,
        "border-image-source": false,
        "border-image-width": true,
        "box-shadow": false,
        "clip-path": false,
        "content": false,
        "filter": false,
        "fit-content": false,
        "grid-template": false,
        "grid-template-columns": false,
        "grid-template-rows": false,
        "linear-gradient": false,
        "mask": false,
        "mask-image": false,
        "mask-position": false,
        "negative": false,
        "object-position": true,
        "pad": false,
        "perspective-origin": true,
        "prefix": false,
        "radial-gradient": false,
        "repeating-linear-gradient": false,
        "repeating-radial-gradient": false,
        "scroll-snap-coordinate": false,
        "scroll-snap-destination": false,
        "shape-outside": false,
        "suffix": false,
        "text-shadow": false,
        "transform": false,

        // SVG
        "alignment-baseline": false,
        "clip": false,
        "clip-rule": false,
        "color": false,
        "color-interpolation": false,
        "color-interpolation-filters": false,
        "color-profile": false,
        "color-rendering": false,
        "cursor": false,
        "direction": false,
        "display": false,
        "dominant-baseline": false,
        "fill": false,
        "fill-opacity": false,
        "fill-rule": false,
        "flood-color": false,
        "flood-opacity": false,
        "font-family": false,
        "font-size-adjust": false,
        "font-stretch": false,
        "font-style": false,
        "font-variant": false,
        "font-weight": false,
        "image-rendering": false,
        "lighting-color": false,
        "marker-end": false,
        "marker-mid": false,
        "marker-start": false,
        "opacity": false,
        "overflow": false,
        "pointer-events": false,
        "shape-rendering": false,
        "stop-color": false,
        "stop-opacity": false,
        "stroke": false,
        "stroke-dasharray": true,
        "stroke-linecap": false,
        "stroke-linejoin": false,
        "stroke-miterlimit": false,
        "stroke-opacity": false,
        "text-anchor": false,
        "text-decoration": false,
        "text-rendering": false,
        "visibility": false,
        "writing-mode": false,
    },
    numberableCssProps: {
        flex: true,
        "-ms-flex-positive": true,
        "-ms-flex-negative": true,
        "-ms-flex-order": true,
        "-webkit-line-clamp": true,
    },
    userDefinedNumerableProps: {
        "-moz-border-bottom-colors": false,
        "-moz-border-left-colors": false,
        "-moz-border-right-colors": false,
        "-moz-border-top-colors": false,
        "-moz-calc": false,
        "-webkit-border-before": false,
        "-webkit-box-reflect": false,
        "-webkit-tap-highlight-color": false,
        "-webkit-text-fill-color": false,
        "-webkit-text-stroke": false,
        "-webkit-text-stroke-color": false,
        "additive-symbols": false,
        "animation": true,
        "animation-timing-function": false,
        "background": false,
        "background-color": false,
        "background-image": false,
        "border": false,
        "border-block-end": false,
        "border-block-end-color": false,
        "border-block-start": false,
        "border-block-start-color": false,
        "border-bottom": false,
        "border-bottom-color": false,
        "border-color": false,
        "border-image-slice": true,
        "border-image-source": false,
        "border-inline-end": false,
        "border-inline-end-color": false,
        "border-inline-start": false,
        "border-inline-start-color": false,
        "border-left": false,
        "border-left-color": false,
        "border-right": false,
        "border-right-color": false,
        "border-top": false,
        "border-top-color": false,
        "box-shadow": false,
        "calc": false,
        "caret-color": false,
        "color": false,
        "column-rule-color": false,
        "content": false,
        "counter-increment": false,
        "counter-reset": false,
        "filter": false,
        "font-feature-settings": false,
        "grid-area": false,
        "grid-column": false,
        "grid-row": false,
        "mask": false,
        "mask-image": false,
        "negative": false,
        "outline-color": false,
        "pad": false,
        "prefix": false,
        "range": false,
        "shape-outside": false,
        "suffix": false,
        "system": false,
        "text-combine-upright": false,
        "text-decoration-color": false,
        "text-emphasis-color": false,
        "text-shadow": false,
        "transform": false,
        "transition": false,
        "transition-timing-function": false,

        // SVG
        "alignment-baseline": false,
        "baseline-shift": true,
        "clip": false,
        "clip-path": false,
        "clip-rule": false,
        "color-interpolation": false,
        "color-interpolation-filters": false,
        "color-profile": false,
        "color-rendering": false,
        "cursor": false,
        "direction": false,
        "display": false,
        "dominant-baseline": false,
        "fill": false,
        "fill-rule": false,
        "flood-color": false,
        "font-family": false,
        "font-size": false,
        "font-stretch": false,
        "font-style": false,
        "font-variant": false,
        "image-rendering": false,
        "kerning": false,
        "letter-spacing": false,
        "lighting-color": false,
        "marker-end": false,
        "marker-mid": false,
        "marker-start": false,
        "overflow": false,
        "pointer-events": false,
        "shape-rendering": false,
        "stop-color": false,
        "stroke": false,
        "stroke-dashoffset": true,
        "stroke-linecap": false,
        "stroke-linejoin": false,
        "stroke-miterlimit": true,
        "stroke-width": true,
        "text-anchor": false,
        "text-decoration": false,
        "text-rendering": false,
        "visibility": false,
        "word-spacing": false,
        "writing-mode": false,
    }
};

eachSeries([
    initialDownload,
    readElements.bind(null, options),
    readCSSProperties.bind(null, options),
    readSVGCSSProperties.bind(null, options),
    scrapCSSProperties.bind(null, options),
    scrapSVGCSSProperties.bind(null, options),
    readInterfaces.bind(null, options),
    onscrap.bind(null, options),
], function(fn, index, next) {
    fn(next);
}, function(err) {
    if (err) {
        console.error(err);
        return;
    }

    console.log("done");
});

function initialDownload(done) {
    eachParallel({
        "https://developer.mozilla.org/en-US/docs/Web/HTML/Element": "HTML element reference - HTML _ MDN.html",
        "https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute": "SVG Attribute reference - SVG _ MDN.html",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference": sysPath.join("css", "CSS reference - CSS _ MDN.html"),
        "https://developer.mozilla.org/en-US/docs/Web/CSS/Mozilla_Extensions": sysPath.join("css", "Mozilla CSS Extensions - CSS _ MDN.html"),
        "https://developer.mozilla.org/en-US/docs/Web/CSS/WebKit_Extensions": sysPath.join("css", "WebKit extensions - CSS _ MDN.html")
    }, function(dst, url, next) {
        download(encodeURI(url), dst, next);
    }, done);
}

function onscrap(options, done) {
    eachParallel(["elements", "CSSProperties", "CSSPropAcceptNumber", "CSSPropAcceptLength"], function(prop, index, next) {
        fs.writeFile(sysPath.join(__dirname, prop + ".js"), "module.exports = " + JSON.stringify(sortKeys(options[prop]), null, 4) + ";", next);
    }, done);
}

function readElements(options, done) {
    var $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "HTML element reference - HTML _ MDN.html")));
    var elements = {};
    var count = 1;

    _.each($("table > thead > tr > th[scope=col]:nth-child(1)"), function(header) {
        if ($(header).text() !== "Element") {
            return;
        }

        ++count;

        var $elements = $(header.parent.parent.parent).find("> tbody > tr > td:nth-child(1) > a");
        eachParallel($elements, function(el, index, next) {
            var name = $(el).text().slice(1, -1);
            var href = el.attribs.href;
            elements[name] = href;
            download(encodeURI("https://developer.mozilla.org" + href), sysPath.join("elements", "_" + name + "_ - HTML _ MDN.html"), next);
        }, give);
    });

    give();

    function give(err) {
        if (done && (--count === 0 || err)) {
            sortKeys(elements);
            done();
            done = null;
        }
    }
}

function readInterfaces(options, done) {
    var dirname = sysPath.join(__dirname, "specifications", "elements");
    var begin = dirname.length + 2;
    var end = -"_ - HTML _ MDN.html".length;

    explore(dirname, function callfile(filename, stats, next) {
        var name = filename.slice(begin, end);
        readElementInterface(name, filename, options, next);
    }, done);
}

function readElementInterface(name, filename, options, done) {
    var ifname;

    var $ = cheerio.load(fs.readFileSync(filename));

    // eslint-disable-next-line consistent-return
    _.each($("table.properties > tbody > tr > th"), function(th) {
        var $th = $(th);

        if (/\s*DOM interface\s*/i.test($th.text())) {
            ifname = $th.next().find("> a > code").text().trim();
            return true;
        }
    });

    if (!ifname) {
        var match = $("#DOM_Interface, #DOM_interface").next().text().match(/This\s+element(?:\s+is\s+unsupported\s+and\s+thus)?\s+implements\s+the\s+(\w+)\s+interface/);
        ifname = match && match[1];
    }

    if (!ifname) {
        console.log("HTMLUnknownElement", name);
    }

    options.elements[name] = ifname;
    done();
}

function readCSSProperties(options, done) {
    var properties = {};
    var $;
    var files = ["CSS reference - CSS _ MDN.html", "Mozilla CSS Extensions - CSS _ MDN.html", "WebKit extensions - CSS _ MDN.html"];

    var commonProps = new RegExp("^-(?:moz|webkit|epub)-(" + [
            "box-align",
            "box-direction",
            "box-flex",
            "box-flex-group",
            "box-lines",
            "box-ordinal-group",
            "box-orient",
            "box-pack",
            "overflow-clip-box",
            "user-select",
            "caption-side",
            "text-transform",
            "word-break",
            "writing-mode",
            "text-emphasis",
            "text-emphasis-color",
            "text-emphasis-style",
            "text-orientation"
        ].join("|") + ")$");

    for (var i = 0, len = files.length; i < len; i++) {
        $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "css", files[i])));
        _.each($("div.index > ul > li > a > code"), scrapCssProp);
    }

    sortKeys(properties);

    mkdirp.sync(sysPath.join(__dirname, "specifications", "css", "properties"));

    var count = 1;

    eachParallel(properties, function(href, cssProp, next) {
        download(encodeURI("https://developer.mozilla.org" + href), sysPath.join("css", "properties", cssProp + " - CSS _ MDN.html"), next);
    });

    give();

    function give(err) {
        if (done && (--count === 0 || err)) {
            done();
            done = null;
        }
    }

    function scrapCssProp(code) {
        var cssProp = $(code).text();
        var match;

        if (hasProp.call(options.userDefinedCssPropMap, cssProp)) {
            cssProp = options.userDefinedCssPropMap[cssProp];
            if (hasProp.call(properties, cssProp)) {
                return;
            }
        }

        match = cssProp.match(/^(?:-moz-|-webkit-)(.+)$/);
        if (match && hasProp.call(properties, match[1])) {
            return;
        }

        match = cssProp.match(commonProps);
        if (match) {
            if (hasProp.call(properties, match[1])) {
                return;
            }
            cssProp = match[1];
            properties[cssProp] = "/en-US/docs/Web/CSS/" + cssProp;
            return;
        }

        if (cssProp !== "--*" && !/(?:^|\s)new(?:\s|$)/.test(code.parent.attribs.class) && !/#/.test(code.parent.attribs.href)) {
            if (/^[:@]/.test(cssProp)) {
                // console.log("to check", cssProp);
                return;
            }
            if (/[<>]/.test(cssProp)) {
                // console.log("to check", cssProp);
                return;
            }

            if (/[:@()<>\s]/.test(cssProp)) {
                cssProp = cssProp.replace(/^([-\w]+)[^-\w].*$/, "$1");
            }

            properties[cssProp] = code.parent.attribs.href;
        }
    }
}

function scrapCSSProperties(options, done) {
    var dirname = sysPath.join(__dirname, "specifications", "css", "properties");
    var begin = dirname.length + 1;
    var end = -" - CSS _ MDN.html".length;
    var numberableCssProps = options.numberableCssProps;
    var lengthableCssProps = options.lengthableCssProps;
    var numerableToCheck = {};
    var lengthableToCheck = {};

    explore(dirname, function callfile(filename, stats, next) {
        var name = filename.slice(begin, end);
        readCSSProperty(name, filename, numberableCssProps, lengthableCssProps, numerableToCheck, lengthableToCheck, options, next);
    }, function(err) {
        if (err) {
            done(err);
            return;
        }
        onCSSPropsRead(numberableCssProps, lengthableCssProps, numerableToCheck, lengthableToCheck, options, done);
    });
}

function onCSSPropsRead(numberableCssProps, lengthableCssProps, numerableToCheck, lengthableToCheck, options, done) {
    var logs = [];
    options.CSSPropAcceptNumber = normalizeCssProps(numberableCssProps);
    options.CSSPropAcceptLength = normalizeCssProps(lengthableCssProps);

    if (!_.isEmpty(numerableToCheck)) {
        logs.push(_.map(numerableToCheck, function(value, cssProp) {
            return cssProp + ": 1";
        }).join(";\n"));
    }

    if (!_.isEmpty(lengthableToCheck)) {
        logs.push(_.map(lengthableToCheck, function(value, cssProp) {
            return cssProp + ": 1px";
        }).join(";\n"));
    }

    if (logs.length) {
        console.log(logs.join("\n\n"));
    }

    if ("function" === typeof done) {
        done();
    }
}

function readCSSProperty(cssProp, filename, numberableCssProps, lengthableCssProps, numerableToCheck, lengthableToCheck, options, done) {
    var numberMatcher = new RegExp(cssProp + /:\s+(?!0;)\d+(?:\.\d+)?;/.source);
    var lengthMatcher = new RegExp(cssProp + /:\s+\d+(?:\.\d+)?(?:em|ex|rem|vh|vw|vmin|vmax|px|mm|q|cm|in|pt|pt|mozmm);/.source);
    var CSSPropAcceptNumber = false;
    var CSSPropAcceptLength = false;

    var lnormalized = cssProp.replace(/^-(?:Webkit|Moz|O|ms)-/i, "");
    var CSSProperties = options.CSSProperties;
    if (!hasProp.call(CSSProperties, lnormalized)) {
        CSSProperties[lnormalized] = normalizeCssProp(cssProp);
    }

    var shouldCheckAccepNumber = !hasProp.call(numberableCssProps, cssProp);
    var shouldCheckAccepLength = !hasProp.call(lengthableCssProps, cssProp);

    if (hasProp.call(options.userDefinedNumerableProps, cssProp)) {
        shouldCheckAccepNumber = false;
        if (options.userDefinedNumerableProps[cssProp]) {
            numberableCssProps[cssProp] = true;
        }
    }

    if (hasProp.call(options.userDefinedLengthableProps, cssProp)) {
        shouldCheckAccepLength = false;
        if (options.userDefinedLengthableProps[cssProp]) {
            lengthableCssProps[cssProp] = true;
        }
    }

    if (shouldCheckAccepNumber || shouldCheckAccepLength) {
        var $ = cheerio.load(fs.readFileSync(filename));

        _.each($("h2"), function(h2) {
            var $h2 = $(h2);

            if ($h2.text().trim() === "Syntax") {
                if (shouldCheckAccepNumber) {
                    CSSPropAcceptNumber = numberMatcher.test($h2.next().text());
                }

                if (shouldCheckAccepLength) {
                    CSSPropAcceptLength = lengthMatcher.test($h2.next().text());
                }
            }
        });

        if (!CSSPropAcceptNumber || !CSSPropAcceptLength) {
            _.each($(".syntaxbox"), function(syntaxbox) {
                var $syntaxbox = $(syntaxbox);

                var text = $syntaxbox.text().trim();
                var lines = text.split(/\s*where\s*/);

                splitOr(lines[0], function(type) {
                    if (shouldCheckAccepNumber && NumberTypes.test(type)) {
                        CSSPropAcceptNumber = true;
                    }

                    if (shouldCheckAccepLength && /^<length>$/.test(type)) {
                        CSSPropAcceptLength = true;
                    }
                });

                if (shouldCheckAccepNumber && !CSSPropAcceptNumber && /<(?:number|integer)>/.test(text)) {
                    numerableToCheck[cssProp] = true;
                }

                if (shouldCheckAccepLength && !CSSPropAcceptLength && /<length>/.test(text)) {
                    lengthableToCheck[cssProp] = true;
                }
            });
        }

        if (shouldCheckAccepNumber && CSSPropAcceptNumber) {
            numberableCssProps[cssProp] = true;
        }

        if (shouldCheckAccepLength && CSSPropAcceptLength) {
            lengthableCssProps[cssProp] = true;
        }
    }

    done();
}

function readSVGCSSProperties(options, done) {
    var $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "SVG Attribute reference - SVG _ MDN.html")));
    var presentationAttrs = {};
    _.each($("h3"), function scrapCssProp(h3) {
        var $h3 = $(h3);
        if ($h3.text().trim() !== "Presentation attributes") {
            return;
        }

        _.each($h3.next().next().find("> code > a"), function(attr) {
            if (!/(?:^|\s)new(?:\s|$)/.test(attr.attribs.class)) {
                presentationAttrs[$(attr).text()] = attr.attribs.href;
            }
        });
    });

    mkdirp.sync(sysPath.join(__dirname, "specifications", "css", "svg"));

    var count = 1;

    eachParallel(presentationAttrs, function(href, cssProp, next) {
        download(encodeURI("https://developer.mozilla.org" + href), sysPath.join("css", "svg", cssProp + " - SVG _ MDN.html"), next);
    });

    give();

    function give(err) {
        if (done && (--count === 0 || err)) {
            done();
            done = null;
        }
    }
}

function scrapSVGCSSProperties(options, done) {
    var dirname = sysPath.join(__dirname, "specifications", "css", "svg");
    var begin = dirname.length + 1;
    var end = -" - SVG _ MDN.html".length;
    var numberableCssProps = options.numberableCssProps;
    var lengthableCssProps = options.lengthableCssProps;
    var numerableToCheck = {};
    var lengthableToCheck = {};

    explore(dirname, function callfile(filename, stats, next) {
        var name = filename.slice(begin, end);
        readSVGCSSProperty(name, filename, numberableCssProps, lengthableCssProps, numerableToCheck, lengthableToCheck, options, next);
    }, function(err) {
        if (err) {
            done(err);
            return;
        }
        onCSSPropsRead(numberableCssProps, lengthableCssProps, numerableToCheck, lengthableToCheck, options, done);
    });
}

function readSVGCSSProperty(cssProp, filename, numberableCssProps, lengthableCssProps, numerableToCheck, lengthableToCheck, options, done) {
    var numberMatcher = new RegExp(cssProp + /[=]"(?!0")\d+(?:\.\d+)?"/.source);
    var lengthMatcher = new RegExp(cssProp + /[=]"\d+(?:\.\d+)?px"/.source);
    var CSSPropAcceptNumber = false;
    var CSSPropAcceptLength = false;

    var shouldCheckAccepNumber = !hasProp.call(numberableCssProps, cssProp);
    var shouldCheckAccepLength = !hasProp.call(lengthableCssProps, cssProp);

    if (hasProp.call(options.userDefinedNumerableProps, cssProp)) {
        shouldCheckAccepNumber = false;
        if (options.userDefinedNumerableProps[cssProp]) {
            numberableCssProps[cssProp] = true;
        }
    }

    if (hasProp.call(options.userDefinedLengthableProps, cssProp)) {
        shouldCheckAccepLength = false;
        if (options.userDefinedLengthableProps[cssProp]) {
            lengthableCssProps[cssProp] = true;
        }
    }

    if (shouldCheckAccepNumber || shouldCheckAccepLength) {
        var $ = cheerio.load(fs.readFileSync(filename));
        var valueType = $("#Usage_context + table > tbody > tr:nth-child(2) > td, #Usage_context + h3 + table > tbody > tr:nth-child(2) > td").text();

        splitOr(valueType, function(type) {
            if (shouldCheckAccepNumber && NumberTypes.test(type)) {
                CSSPropAcceptNumber = true;
            }

            if (shouldCheckAccepLength && /<length>/.test(type)) {
                CSSPropAcceptLength = true;
            }
        });

        if (!CSSPropAcceptNumber || !CSSPropAcceptLength) {
            _.each($("#Example + pre"), function(example) {
                var $example = $(example);
                var text = $example.text().trim();

                if (shouldCheckAccepNumber && !CSSPropAcceptNumber) {
                    CSSPropAcceptNumber = numberMatcher.test(text);
                }

                if (shouldCheckAccepLength && !CSSPropAcceptLength) {
                    CSSPropAcceptLength = lengthMatcher.test(text);
                }
            });
        }

        if (CSSPropAcceptNumber) {
            numberableCssProps[cssProp] = true;
        } else if (shouldCheckAccepNumber) {
            numerableToCheck[cssProp] = true;
        }

        if (CSSPropAcceptLength) {
            lengthableCssProps[cssProp] = true;
        } else if (shouldCheckAccepLength) {
            lengthableToCheck[cssProp] = true;
        }
    }

    done();
}

function splitOr(str, callback) {
    var matcher = /(?:[[\]]|\s*\|\s*)/g;
    var lastIndex = 0;
    var parts = [];
    var level = 0;
    var match, part;
    var abort = false;

    while (match = matcher.exec(str)) {
        switch (match[0]) {
            case "[":
                ++level;
                break;
            case "]":
                --level;
                break;
            default:
                if (level !== 0) {
                    continue;
                }

                part = str.slice(lastIndex, match.index);
                abort = callback(part);
                if (abort) {
                    return;
                }

                parts.push(part);
                lastIndex = matcher.lastIndex;
        }
    }

    if (lastIndex < str.length) {
        part = str.slice(lastIndex);
        abort = callback(part);
        if (abort) {
            return;
        }

    }

    // eslint-disable-next-line consistent-return
    return parts;
}

function sortKeys(obj) {
    var keys, key, value;

    if (obj == null) {
        return obj;
    }

    keys = Object.keys(obj).sort();

    for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        value = obj[key];
        delete obj[key];
        obj[key] = value;
    }

    return obj;
}

function download(url, dst, done) {
    dst = sysPath.join(__dirname, "specifications", dst);
    mkdirp.sync(sysPath.dirname(dst));
    wget.download(url, dst, done);
}

"use strict";

// https://www.w3.org/TR/2015/REC-dom-20151119/
// https://www.w3.org/TR/2016/REC-html51-20161101/
// https://dev.opera.com/articles/media-capture-in-mobile-browsers/
// https://www.w3.org/TR/2014/CR-html-media-capture-20140909/

var fs = require("fs");
var sysPath = require("path");
var cheerio = require("cheerio");
var _ = require("lodash");
var explore = require("fs-explorer").explore;
var hasProp = Object.prototype.hasOwnProperty;
var Interface = require("./Interface");
var Namespaces = require("./Namespaces");
var assign = require("../functions/assign");
var mkdirp = require("mkdirp");
var wget = require("../scrap/wget");
var async = require("../scrap/async");
var eachParallel = async.eachParallel;
var eachSeries = async.eachSeries;

var options = {
    interfaces: {},
    attributes: {},
    elements: {},
    DOMProperties: {},
    EventHandlers: {},
    readOnlyExecption: {
        "HTMLIFrameElement": {
            "sandbox": true
        },
        "HTMLOutputElement": {
            "htmlFor": true
        }
    },
    ignoredProperties: {
        "HTMLTitleElement": {
            "text": true
        },
        "HTMLAnchorElement": {
            "text": true
        },
        "HTMLTableElement": {
            "caption": true,
            "tHead": true,
            "tFoot": true,
            "encoding": true
        },
        "HTMLSelectElement": {
            "length": true,
            "selectedIndex": true
        },
        "HTMLOptionElement": {
            "text": true
        },
        "HTMLScriptElement": {
            "text": true
        }
    },
    SVGAttributes: {},
    extendedElements: {
        dialog: true,
        hgroup: true,
        slot: true
    },
    extendedProperties: {
        input: {
            capture: {
                type: "boolean",
                isBoolean: true,
                attrName: "capture"
            }
        },
        b: {
            style: {
                isProperty: true,
                attrName: "style"
            },
            slot: {
                attrName: "slot"
            }
        }
    },
    obsoleteAttributesByTagName: {}
};

var wordsMatcherRegExp = /\w+(?:(?:, and| and|,) \w+)+(?: each|,)?/;

var IDLAttributesRegExpSource = "The (?:" + [
        "IDL attributes " + wordsMatcherRegExp.source,
        /IDL attribute \w+/.source,
        wordsMatcherRegExp.source + "(?: IDL)? attributes",
        /\w+(?: IDL)? attribute/.source
    ].join("|") + ")(?: (?:of the|on(?: the)?) [^\\s]+(?:(?:, and| and|,) [^\\s]+)* elements?)? must reflect the (?:" + [
        /(?:respective )?content attributes? of the same name/.source,
        /content attribute ["]?([-\w]+)["]?/.source,
        /(?:element(?:["’]s|s["’]) |value of the )?["]?([-\w]+)["]? content attribute/.source
    ].join("|") + ")";

var ScrapMatcher = new RegExp(IDLAttributesRegExpSource.replace(/\s+/g, "\\s+"), "mg");

eachSeries([
    initialDownload,
    processHTML5ElementsAndAttributes.bind(null, options),
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
    // var html5Version = "html51";
    var html5Version = "2016/REC-html51-20161101";
    var obj = {};

    obj["https://www.w3.org/TR/html401/index/attributes.html"] = "Index of the HTML 4 Attributes.html";
    obj["https://www.w3.org/TR/html401/index/elements.html"] = "Index of the HTML 4 Elements.html";
    obj["https://www.w3.org/TR/" + html5Version + "/fullindex.html"] = "HTML 5.1_ Index.html";
    obj["https://www.w3.org/TR/" + html5Version + "/infrastructure.html"] = "HTML 5.1_ 2. Common infrastructure.html";
    obj["https://www.w3.org/TR/" + html5Version + "/dom.html"] = "HTML 5.1_ 3. Semantics, structure, and APIs of HTML documents.html";
    obj["https://www.w3.org/TR/" + html5Version + "/semantics.html"] = "HTML 5.1_ 4. The elements of HTML.html";
    obj["https://www.w3.org/TR/" + html5Version + "/document-metadata.html"] = "HTML 5.1_ 4.2. Document metadata.html";
    obj["https://www.w3.org/TR/" + html5Version + "/sections.html"] = "HTML 5.1_ 4.3. Sections.html";
    obj["https://www.w3.org/TR/" + html5Version + "/grouping-content.html"] = "HTML 5.1_ 4.4. Grouping content.html";
    obj["https://www.w3.org/TR/" + html5Version + "/textlevel-semantics.html"] = "HTML 5.1_ 4.5. Text-level semantics.html";
    obj["https://www.w3.org/TR/" + html5Version + "/edits.html"] = "HTML 5.1_ 4.6. Edits.html";
    obj["https://www.w3.org/TR/" + html5Version + "/semantics-embedded-content.html"] = "HTML 5.1_ 4.7. Embedded content.html";
    obj["https://www.w3.org/TR/" + html5Version + "/links.html"] = "HTML 5.1_ 4.8. Links.html";
    obj["https://www.w3.org/TR/" + html5Version + "/tabular-data.html"] = "HTML 5.1_ 4.9. Tabular data.html";
    obj["https://www.w3.org/TR/" + html5Version + "/sec-forms.html"] = "HTML 5.1_ 4.10. Forms.html";
    obj["https://www.w3.org/TR/" + html5Version + "/interactive-elements.html"] = "HTML 5.1_ 4.11. Interactive elements.html";
    obj["https://www.w3.org/TR/" + html5Version + "/semantics-scripting.html"] = "HTML 5.1_ 4.12. Scripting.html";
    obj["https://www.w3.org/TR/" + html5Version + "/editing.html"] = "HTML 5.1_ 5. User interaction.html";
    obj["https://www.w3.org/TR/" + html5Version + "/webappapis.html"] = "HTML 5.1_ 7. Web application APIs.html";
    obj["https://www.w3.org/TR/" + html5Version + "/syntax.html"] = "HTML 5.1_ 8. The HTML syntax.html";
    obj["https://www.w3.org/TR/" + html5Version + "/obsolete.html"] = "HTML 5.1_ 11. Obsolete features.html";

    obj["https://www.w3.org/TR/2016/WD-uievents-20160804/"] = "UI Events.html";
    obj["https://www.w3.org/TR/2015/REC-dom-20151119/"] = "W3C DOM4.html";

    obj["https://www.w3.org/TR/SVG/attindex.html"] = "Attribute Index – SVG 1.1 (Second Edition).html";
    obj["https://www.w3.org/TR/SVG/eltindex.html"] = "Element Index – SVG 1.1 (Second Edition).html";
    obj["https://www.w3.org/TR/2015/WD-SVG2-20150915/attindex.html"] = "Attribute Index — SVG 2.html";
    obj["https://www.w3.org/TR/2015/WD-SVG2-20150915/eltindex.html"] = "Element Index — SVG 2.html";

    eachParallel(obj, function(dst, url, next) {
        download(encodeURI(url), dst, next);
    }, done);
}

function onscrap(options, done) {
    var files = [];

    var dirname = sysPath.join(__dirname, "specifications");
    explore(dirname, function callfile(filepath, stats, next) {
        if (/[/\\]HTML 5\.1_ \d+(?:\.\d*)?|W3C DOM4/.test(filepath)) {
            files.push(filepath);
        }
        next();
    }, function calldir(folderpath, stats, files, state, next) { // eslint-disable-line consistent-return
        if (state === "begin" && dirname !== folderpath) {
            return next(null, true);
        }

        next();
    }, function() {
        files.sort(function(a, b) {
            if (/W3C DOM4/.test(a)) {
                return -1;
            }

            if (/W3C DOM4/.test(b)) {
                return 1;
            }

            a = a.match(/[/\\]HTML 5\.1_ (\d+(?:\.\d*)?)/)[1].split(/\./g);
            b = b.match(/[/\\]HTML 5\.1_ (\d+(?:\.\d*)?)/)[1].split(/\./g);

            var aLen = a.length;
            var bLen = b.length;
            var len = aLen > bLen ? bLen : aLen;

            for (var i = 0; i < len; i++) {
                a[i] = a[i] === "" ? 0 : parseInt(a[i], 10);
                b[i] = b[i] === "" ? 0 : parseInt(b[i], 10);
                if (a[i] > b[i]) {
                    return 1;
                } else if (a[i] < b[i]) {
                    return -1;
                }
            }

            return aLen > bLen ? 1 : aLen < bLen ? -1 : 0;
        });

        var filename, $, textContent;
        var i, len, ifname, attribute;

        var interfaces = options.interfaces;

        for (i = 0, len = files.length; i < len; i++) {
            filename = files[i];
            $ = cheerio.load(fs.readFileSync(filename));
            $("aside").remove();
            textContent = $.text();

            scrapInterfaces(interfaces, $, textContent, filename, options);

            files[i] = [filename, $, textContent];
        }

        for (i = 0, len = files.length; i < len; i++) {
            filename = files[i][0];
            $ = files[i][1];
            textContent = files[i][2];

            for (ifname in interfaces) {
                if (hasProp.call(interfaces[ifname].filenames, filename)) {
                    scrapAttributes(interfaces[ifname], interfaces, textContent, $, filename, options);
                }
            }
        }

        var ifconfig, attrconfig;

        // eslint-disable-next-line guard-for-in
        for (ifname in interfaces) {
            ifconfig = interfaces[ifname];

            // eslint-disable-next-line guard-for-in
            for (attribute in ifconfig.properties) {
                attrconfig = ifconfig.properties[attribute];
                if (attrconfig.readonly || attrconfig.isIgnored) {
                    // console.log(attrconfig.readonly ? "readonly" : "ignore", ifname + "." + attribute)
                    delete ifconfig.properties[attribute];
                    continue;
                }

                delete attrconfig.name;

                if (/^(?:USVString|DOMString)$/.test(attrconfig.type)) {
                    attrconfig.type = "String";
                }

                if (!attrconfig.isEventHandler &&
                    !hasProp.call(attrconfig, "attrName")) {
                    console.log("property", ifname + "." + attribute);
                    attrconfig.isProperty = true;
                }
            }
        }

        _.extend(options.elements, options.extendedElements);

        var attributes = options.attributes;

        var extendedProperties = options.extendedProperties;
        var extension, properties, propName, attrName, tagName;

        // eslint-disable-next-line guard-for-in
        for (tagName in extendedProperties) {
            ifname = options.elements[tagName].interface;
            extension = extendedProperties[tagName];
            properties = interfaces[ifname].properties;
            _.extend(properties, extension);

            // eslint-disable-next-line guard-for-in
            for (propName in extension) {
                attrconfig = extension[propName];
                attrName = attrconfig.attrName;

                if (hasProp.call(attributes, attrName)) {
                    attributes[attrName].found = true;
                } else {
                    attributes[attrName] = {
                        name: propName,
                        found: true
                    };
                }
            }
        }

        compressAttributes(options);

        var DOMProperties = options.DOMProperties;
        var propertiesByAttribute = getPropertiesByAttribute(DOMProperties);
        var obsoleteAttributesByTagName = options.obsoleteAttributesByTagName;
        var obsoleteAttributes;

        // eslint-disable-next-line guard-for-in
        for (tagName in obsoleteAttributesByTagName) {
            ifname = options.elements[tagName].interface;
            properties = interfaces[ifname].properties;
            obsoleteAttributes = obsoleteAttributesByTagName[tagName];
            for (attrName in obsoleteAttributes) {

                if (hasProp.call(propertiesByAttribute, attrName)) {
                    propName = propertiesByAttribute[attrName];
                    if (!hasProp.call(properties, propName)) {
                        properties[propName] = true;
                    }
                } else {
                    propName = guessPropName(attrName);
                }

                if (!hasProp.call(properties, propName)) {
                    if (!hasProp.call(DOMProperties, propName)) {
                        DOMProperties[propName] = {
                            type: "Unknown",
                            attrName: attrName,
                            isObsolete: true
                        };
                    }

                    properties[propName] = true;
                    sortKeys(properties);

                    if (!hasProp.call(attributes, attrName)) {
                        attributes[attrName] = {};
                    }
                    attributes[attrName].found = true;
                // console.log("obsolete", tagName, attrName, propName);
                }
            }
        }

        for (var key in attributes) {
            if (!attributes[key].found) {
                console.log("unknown attribute", key);
            }
        }

        ["DOMProperties", "elements", "interfaces"].forEach(function(prop) {
            fs.writeFileSync(sysPath.join(__dirname, prop + ".js"), "module.exports = " + JSON.stringify(sortKeys(options[prop]), null, 4) + ";");
        });

        fs.writeFileSync(sysPath.join(__dirname, "HTMLSpec.js"), [
            "var Interface = require(\"./Interface\");",

            ["DOMProperties", "elements", "interfaces"].map(function(prop) {
                return "var " + prop + " = require(\"./" + prop + "\");";
            }).join("\n"),

            "var attributes = {};",
            "initInterfaces(elements, interfaces, attributes, DOMProperties);",
            "module.exports = { elements: elements, interfaces: interfaces, attributes: attributes };",

            initInterfaces.toString(),
        ].join("\n\n"));

        var HTMLSpec = require("./HTMLSpec");
        sortKeys(HTMLSpec.attributes);

        // fs.writeFileSync(sysPath.join(__dirname, "HTMLSpec.json"), JSON.stringify(HTMLSpec, null, 2));

        options.HTMLSpec = HTMLSpec;
        processSVG11Elements(options);
        processSVG11Attributes(options);
        processSVG2Elements(options);
        processSVG2Attributes(options);

        ["SVGAttributes"].forEach(function(prop) {
            fs.writeFileSync(sysPath.join(__dirname, prop + ".js"), "module.exports = " + JSON.stringify(sortKeys(options[prop]), null, 4) + ";");
        });

        fs.writeFileSync(sysPath.join(__dirname, "HTMLElements.js"), "module.exports = " + JSON.stringify(Object.keys(options.elements)) + ";");

        DOMProperties = require("./DOMProperties");
        var SVGAttributes = require("./SVGAttributes");

        properties = assign({}, DOMProperties);

        // eslint-disable-next-line guard-for-in
        for (attrName in SVGAttributes) {
            attrconfig = SVGAttributes[attrName];
            propName = attrconfig.propName;
            attrconfig.attrName = attrName;
            properties[propName] = attrconfig;
            delete attrconfig.propName;
        }

        fs.writeFileSync(sysPath.join(__dirname, "properties.js"), "module.exports = " + JSON.stringify(properties, null, 4) + ";");

        done();
    });
}
function processHTML5ElementsAndAttributes(options, done) {
    var attributes = options.attributes;
    var elements = options.elements;

    var $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "HTML 5.1_ Index.html")));

    _.each($("#element-interfaces").next().next().find("> tbody > tr > td:nth-child(1) code"), function(element) {
        var tagName = $(element).text().trim();
        var children = $(element).parent().next().children();

        elements[tagName] = {
            "interface": $(children[0]).text()
        };
    });

    _.each($("#element-content-categories").next().next().next().find("> tbody > tr > td:nth-child(2) > code a[data-link-type=element]"), function(element) {
        var tagName = $(element).text().trim();
        if (!hasProp.call(elements, tagName)) {
            elements[tagName] = true;
        }
    });

    _.each($("#attributes-table").next().next().find("> tbody > tr > th"), function(attr) {
        var $attr = $(attr);

        var attrName = $attr.text().trim();
        if (!hasProp.call(attributes, attrName)) {
            attributes[attrName] = {
                name: attrName
            };
        }
    });

    $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "HTML 5.1_ 11. Obsolete features.html")));

    _.each($("[data-dfn-type=element], [data-link-type=element]"), function(element) {
        var tagName = $(element).text().trim();
        if (!hasProp.call(elements, tagName)) {
            elements[tagName] = true;
        }
    });

    var obsoleteAttributesByTagName = options.obsoleteAttributesByTagName;
    _.each($("dt[data-md] > p > dfn[data-dfn-type=element-attr]"), function(attr) {
        var $attr = $(attr);
        var attrName = $attr.text().trim();
        if (!hasProp.call(attributes, attrName)) {
            attributes[attrName] = {
                name: attrName
            };

            _.each($attr.parent().find("[data-dfn-type=element], [data-link-type=element]"), function(element) {
                var attributes;
                var tagName = $(element).text().trim();

                if (!hasProp.call(obsoleteAttributesByTagName, tagName)) {
                    obsoleteAttributesByTagName[tagName] = {};
                }

                attributes = obsoleteAttributesByTagName[tagName];
                attributes[attrName] = true;
            });
        }
    });

    var text = $.text();
    var matcher = new RegExp(/\bThe (\w+) element must implement the (\w+) interface\b/.source.replace(/\s+/, "\\s+"), "g");
    var matches, tagName, ifname;
    while (matches = matcher.exec(text)) {
        tagName = matches[1];
        ifname = matches[2];
        elements[tagName] = {
            interface: ifname
        };
    }

    done();
}

function processSVG11Elements(options) {
    var elements = options.elements;
    var $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "Element Index – SVG 1.1 (Second Edition).html")));

    _.each($("span.element-name"), function(element) {
        var name = $(element).text().trim().slice(1, -1);
        if (hasProp.call(elements, name)) {
            return;
        }

        elements[name] = true;
    });
}

function processSVG11Attributes(options) {
    var attributes = options.HTMLSpec.attributes;
    var SVGAttributes = options.SVGAttributes;
    var $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "Attribute Index – SVG 1.1 (Second Edition).html")));

    _.each($("span.attr-name"), function(attr) {
        var attrName = $(attr).text().trim().slice(1, -1);
        if (hasProp.call(attributes, attrName) || hasProp.call(SVGAttributes, attrName) || /^(?:on|aria-)/.test(attrName)) {
            return;
        }

        var attrconfig = {
            propName: camelDashOrColon(attrName)
        };

        if (/^xlink:/.test(attrName)) {
            attrconfig.namespace = Namespaces.XLinknamespace;
        } else if (/^xml(?:$|:)/.test(attrName)) {
            attrconfig.namespace = Namespaces.XMLnamespace;
        } else if (/^xmlns(?:$|:)/.test(attrName)) {
            attrconfig.namespace = Namespaces.XMLNSnamespace;
        }

        SVGAttributes[attrName] = attrconfig;
    });
}

function processSVG2Elements(options) {
    var elements = options.elements;
    var $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "Element Index — SVG 2.html")));

    _.each($("span.element-name"), function(element) {
        var elementName = $(element).text().trim().slice(1, -1);
        if (hasProp.call(elements, elementName)) {
            return;
        }

        elements[elementName] = true;
    });
}

function processSVG2Attributes(options) {
    var attributes = options.HTMLSpec.attributes;
    var SVGAttributes = options.SVGAttributes;
    var $ = cheerio.load(fs.readFileSync(sysPath.join(__dirname, "specifications", "Attribute Index — SVG 2.html")));

    _.each($("span.attr-name"), function(attr) {
        var attrName = $(attr).text().trim();
        if (hasProp.call(attributes, attrName) || hasProp.call(SVGAttributes, attrName) || /^(?:on|aria-)/.test(attrName)) {
            return;
        }

        var attrconfig = {
            propName: camelDashOrColon(attrName)
        };

        if (/^xlink:/.test(attrName)) {
            attrconfig.namespace = Namespaces.XLinknamespace;
        } else if (/^xml(?:$|:)/.test(attrName)) {
            attrconfig.namespace = Namespaces.XMLnamespace;
        } else if (/^xmlns(?:$|:)/.test(attrName)) {
            attrconfig.namespace = Namespaces.XMLNSnamespace;
        }

        SVGAttributes[attrName] = attrconfig;
    });
}

function compressAttributes(options) {
    var interfaces = options.interfaces;
    var DOMProperties = options.DOMProperties;
    var EventHandlers = options.EventHandlers;

    var ifconfig, ifname, properties, propName, attrconfig, impls, i, len, prop;

    var booleanProperties = ["readonly", "isBoolean", "isPositive", "isInteger", "isNumber", "isEventHandler", "isIgnored"];

    // eslint-disable-next-line guard-for-in
    for (ifname in interfaces) {
        ifconfig = interfaces[ifname];

        impls = ifconfig.impls;
        for (i = impls.length - 1; i >= 0; i--) {
            if (!hasProp.call(interfaces, impls[i])) {
                console.log("compressAttributes: unknown ifname", ifname);
                impls.splice(i, 1);
            }
        }

        properties = ifconfig.properties;

        // eslint-disable-next-line guard-for-in
        for (propName in properties) {
            attrconfig = properties[propName];

            if (attrconfig.isNumber && attrconfig.isProperty) {
                console.log("attribute", ifname + "." + propName, "will be removed because this program is unable to handle `remove property` of a non-attribute");
                delete properties[propName];
                continue;
            }

            for (i = 0, len = booleanProperties.length; i < len; i++) {
                prop = booleanProperties[i];
                if (!attrconfig[prop]) {
                    delete attrconfig[prop];
                }
            }

            if (attrconfig.isEventHandler) {
                EventHandlers[propName.slice(2)] = true;
                delete interfaces[ifname].properties[propName];
            } else if (hasProp.call(DOMProperties, propName)) {
                if (DOMProperties[propName].type && !_.isEqual(DOMProperties[propName], attrconfig)) {
                    console.log("multiple attribute specification for", propName);
                    DOMProperties[propName] = pickSameProperties(DOMProperties[propName], attrconfig);
                }
            } else {
                DOMProperties[propName] = attrconfig;
            }
        }
    }

    sortKeys(EventHandlers);
    sortKeys(interfaces);
    sortKeys(DOMProperties);

    // eslint-disable-next-line guard-for-in
    for (ifname in interfaces) {
        ifconfig = interfaces[ifname];

        properties = ifconfig.properties;
        sortKeys(properties);

        delete ifconfig.name;
        delete ifconfig.filenames;

        for (propName in properties) {
            if (hasProp.call(DOMProperties, propName) && DOMProperties[propName].type) {
                properties[propName] = true;
            }
        }
    }

    return DOMProperties;
}

function initInterfaces(elements, interfaces, attributes, DOMProperties) {
    var ifname, ifconfig, properties, attrName;

    // eslint-disable-next-line guard-for-in
    for (ifname in interfaces) {
        ifconfig = interfaces[ifname];

        if (ifconfig instanceof Interface) {
            ifconfig = ifconfig.ifconfig;
        } else {
            interfaces[ifname] = new Interface(ifname, ifconfig, ifconfig.impls.map(getInterface));
        }

        properties = ifconfig.properties;

        for (var propName in properties) {
            if (properties[propName] === true) {
                properties[propName] = DOMProperties[propName];
            }

            attrName = properties[propName].attrName;
            attributes[attrName] = {
                propName: propName
            };
        }
    }

    function getInterface(ifname) {
        if (ifname instanceof Interface) {
            return ifname;
        }

        var ifconfig = interfaces[ifname];
        if (ifconfig instanceof Interface) {
            return ifconfig;
        }

        ifconfig = new Interface(ifname, ifconfig, ifconfig.impls.map(getInterface));
        interfaces[ifname] = ifconfig;

        return ifconfig;
    }
}

function scrapInterfaces(interfaces, $, textContent, filename, options) {
    var attributes = options.attributes;
    var readOnlyExecption = options.readOnlyExecption;
    var ignoredProperties = options.ignoredProperties;

    var lastIndex = 0,
        startIndex = 0;
    var ifconfig;

    _.each($("pre.idl"), function(vnode) {
        var $vnode = $(vnode);
        var text = $vnode.text();

        var interfaceMatcher = /\binterface\s+(\w*(?:Element|EventHandler)\w*)(?:\s+:\s+(\w+))?\s+\{/g;
        var match = interfaceMatcher.exec(text);

        if (!match) {
            return;
        }

        lastIndex = textContent.indexOf(text, startIndex);

        if (ifconfig) {
            if (ifconfig.name === "HTMLUnknownElement") {
                interfaces.HTMLElement.filenames[filename].startIndex = startIndex;
                interfaces.HTMLElement.filenames[filename].lastIndex = lastIndex;
            } else {
                ifconfig.filenames[filename].startIndex = startIndex;
                ifconfig.filenames[filename].lastIndex = lastIndex;
            }
        }
        startIndex = lastIndex + text.length;

        var name = match[1];

        if (hasProp.call(interfaces, name)) {
            ifconfig = interfaces[name];
        } else {
            ifconfig = {
                name: name,
                properties: {},
                impls: [],
                filenames: {}
            };
        }

        ifconfig.filenames[filename] = {};

        interfaces[name] = ifconfig;

        var properties = ifconfig.properties;

        if (match[2] && /Element$/.test(match[2])) {
            ifconfig.impls.push(match[2]);
        }

        var begin = interfaceMatcher.lastIndex;

        var attributeMatcher = /(?:(readonly)\s+)?attribute\s+([\w\s]+\??)\s+(\w+);/g;
        attributeMatcher.lastIndex = begin;

        var readonly, attribute, type, attrName, attrconfig;

        while (match = attributeMatcher.exec(text)) {
            type = match[2];
            if (type.slice(-1) === "?") {
                type = type.slice(0, -1);
            }

            attribute = match[3];
            if (attribute[0] === "_") {
                attribute = attribute.slice(1);
            }

            readonly = Boolean(match[1]) && (!hasProp.call(readOnlyExecption, name) || !hasProp.call(readOnlyExecption[name], attribute));

            attrconfig = properties[attribute] = {
                name: attribute,
                readonly: readonly,
                type: type,
                isBoolean: /\bboolean\b/.test(type),
                isPositive: /\bunsigned long\b/.test(type),
                isInteger: /\blong\b/.test(type),
                isNumber: /\b(?:double|long)\b/.test(type),
                isEventHandler: /EventHandler$/.test(type),
                isIgnored: hasProp.call(ignoredProperties, name) && hasProp.call(ignoredProperties[name], attribute)
            };

            if (attrconfig.isBoolean) {
                attrconfig.isProperty = true;
            }

            attrName = guessAttrname(attributes, attribute);
            if (hasProp.call(attributes, attrName)) {
                setPropName(attrName, attrconfig, options);
            }

            begin = attributeMatcher.lastIndex;
        }

        var implementsMatcher = new RegExp("^\\s*" + name + "\\s+implements\\s+(\\w+);", "mg");
        implementsMatcher.lastIndex = begin;
        while (match = implementsMatcher.exec(text)) {
            ifconfig.impls.push(match[1]);
        }
    });

    if (startIndex !== 0) {
        if (ifconfig.name === "HTMLUnknownElement") {
            ifconfig = interfaces.HTMLElement;
        }

        ifconfig.filenames[filename].startIndex = startIndex;
        delete ifconfig.filenames[filename].lastIndex;
    }

}

function scrapAttributes(ifconfig, interfaces, textContent, $, filename, options) {
    var properties = ifconfig.properties;
    var startIndex = ifconfig.filenames[filename].startIndex;
    var lastIndex = ifconfig.filenames[filename].lastIndex;

    if (startIndex === undefined) {
        return;
    }

    var text = textContent.slice(startIndex, lastIndex);
    var matches;

    ScrapMatcher.lastIndex = 0;
    while (matches = ScrapMatcher.exec(text)) {
        IDLAttributesMatch(properties, ifconfig, interfaces, matches[0], matches[1] || matches[2], filename, options);
    }
}

function IDLAttributesMatch(properties, ifconfig, interfaces, sentence, attrName, filename, options) {
    var attributes = options.attributes;

    sentence = sentence.replace(/\s+/g, " ");
    var matches = sentence.match(/^(?:The\s+IDL\s+attributes?|The)\s+(\w+);?/);
    var words = [];
    var index = matches[0].length;
    var wordMatcher = /^(?:,\s+and|\s+and|,)\s+(\w+)/;

    words.push(matches[1]);

    if (attrName == null) {

        while ((matches = sentence.slice(index).match(wordMatcher)) && !/^(?:each|IDL|must)$/.test(matches[1])) {
            words.push(matches[1]);
            index += matches[0].length;
        }
    }

    var elements, propName, attrconfig;
    if (matches = sentence.slice(index).match(/\s+(?:of\s+the|on(?:\s+the)?)\s+([^\s]+(?:(?:,\s+and|\s+and|,)\s+[^\s]+)*)\s+elements?/)) {
        elements = [];
        matches = matches[1].split(/(?:,\s+and|\s+and|,)\s+/g);
        matches.forEach(function(tagName) {
            var ifname;

            if (tagName === "an") {
                return;
            }

            if (tagName === "h1–h6") {
                Array.prototype.push.apply(elements, [
                    interfaces[options.elements.h1.interface],
                    interfaces[options.elements.h2.interface],
                    interfaces[options.elements.h3.interface],
                    interfaces[options.elements.h4.interface],
                    interfaces[options.elements.h5.interface],
                    interfaces[options.elements.h6.interface]
                ]);
                return;
            }

            if (tagName === "html") {
                ifname = "HTMLElement";
            } else if (hasProp.call(options.elements, tagName)) {
                ifname = options.elements[tagName].interface;
            } else {
                ifname = "HTML" + tagName[0].toUpperCase() + tagName.slice(1) + "Element";
                if (!hasProp.call(interfaces, ifname)) {
                    console.log(tagName, sentence);
                    throw new Error("Unknown element " + tagName);
                }
            }

            elements.push(interfaces[ifname]);
        });
    } else {
        elements = [ifconfig];
    }

    var config;
    var propertyAttributes = {
        "defaultChecked": true,
        "defaultMuted": true,
        "defaultSelected": true,
        "defaultValue": true
    };

    for (var i = 0, len = words.length; i < len; i++) {
        propName = words[i];

        if (hasProp.call(propertyAttributes, propName)) {
            continue;
        }

        if (i !== 0 || attrName == null) {
            attrName = guessAttrname(attributes, propName);
        }

        for (var j = 0, jlen = elements.length; j < jlen; j++) {
            config = elements[j];
            attrconfig = findAttrConfig(propName, config, interfaces);

            if (!attrconfig && elements.length === 1) {
                attrconfig = findAttrConfig(propName, ifconfig, interfaces);
            }

            if (!attrconfig) {
                continue;
            }

            setPropName(attrName, attrconfig, options);
        }
    }
}

function findAttrConfig(propName, ifconfig, interfaces) { // eslint-disable-line consistent-return
    var ifconfigs = [ifconfig];
    while (ifconfigs.length) {
        ifconfig = ifconfigs.pop();
        if (hasProp.call(ifconfig.properties, propName)) {
            return ifconfig.properties[propName];
        }

        ifconfig.impls.slice().reverse().forEach(addInterface);
    }

    function addInterface(ifname) {
        ifconfigs.push(interfaces[ifname]);
    }
}

function setPropName(attrName, attrconfig, options) {
    if (attrconfig.readonly) {
        return;
    }

    if (!hasProp.call(attrconfig, "attrName")) {
        attrconfig.attrName = attrName;
    }

    if (hasProp.call(options.attributes, attrName)) {
        options.attributes[attrName].found = true;
    }
}

function guessAttrname(attributes, propName) {
    var attrName = dashCamel(propName);
    if (hasProp.call(attributes, attrName)) {
        return attrName;
    }

    attrName = propName.toLowerCase();
    if (hasProp.call(attributes, attrName)) {
        return attrName;
    }

    return propName;
}

function getPropertiesByAttribute(properties) {
    var attributes = {};

    // eslint-disable-next-line guard-for-in
    for (var propName in properties) {
        var attrName = properties[propName].attrName;
        attributes[attrName] = propName;
    }

    return attributes;
}

function guessPropName(attrName) {
    var knownProperties = {
        classid: "classId",
        dataformatas: "dataFormatas",
        bottommargin: "bottomMargin",
        leftmargin: "leftMargin",
        rightmargin: "rightMargin",
        margintop: "marginTop",
        allowtransparency: "allowTransparency",
        framespacing: "frameSpacing",
        bordercolor: "borderColor",
        datasrc: "dataSrc",
        datafld: "dataFld",
        datapagesize: "dataPageSize",
        methods: "methods",
        urn: "urn",
        profile: "profile",
        manifest: "manifest",
        language: "language",
    // char: "ch",
    // charoff: "chOff"
    };

    if (hasProp.call(knownProperties, attrName)) {
        return knownProperties[attrName];
    }

    console.log("unable to guess prop name", attrName);

    return attrName;
}

function dashCamel(str) {
    return str.replace(/[A-Z]/g, hyphenLowerCase);
}

function hyphenLowerCase(match) {
    return "-" + match[0].toLowerCase();
}

function camelDashOrColon(str) {
    return str.replace(/[-:]\w/g, hyphenUpperCase);
}

function hyphenUpperCase(match) {
    return match[1].toUpperCase();
}

function sortKeys(obj) {
    if (obj == null) {
        return obj;
    }

    var keys = Object.keys(obj).sort();
    var key, value;
    for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        value = obj[key];
        delete obj[key];
        obj[key] = value;
    }

    return obj;
}

function pickSameProperties(a, b) {
    var props = {};

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    var keys = aKeys.length < bKeys.length ? aKeys : bKeys;
    var key;

    for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];

        if (a[key] === b[key]) {
            props[key] = a[key];
        }
    }

    props.attrName = a.attrName || b.attrName;

    return props;
}

function download(url, dst, done) {
    dst = sysPath.join(__dirname, "specifications", dst);
    mkdirp.sync(sysPath.dirname(dst));
    wget.download(url, dst, done);
}

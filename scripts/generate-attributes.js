var properties = require("../src/w3c/properties");
var IDLAttribute = "IDL Attribute";
var HTMLAttribute = "HTML Attribute";
var icomment = "Attribute case insensitive";

var maxIDLAttrLength = IDLAttribute.length;
var maxAttrLength = HTMLAttribute.length;
var config, attr;

for  (var idl in properties) {
    config = properties[idl];
    attr = config.attrName;

    if (!attr) {
        continue;
    }

    if (maxIDLAttrLength < idl.length) {
        maxIDLAttrLength = idl.length;
    }

    if (maxAttrLength < attr.length) {
        maxAttrLength = attr.length;
    }
}

var text = [];

text.push("| " + [
    pad(IDLAttribute, maxIDLAttrLength),
    pad(HTMLAttribute, maxAttrLength),
    pad("Comment", icomment.length)
].join(" | ") + " |");

text.push("|" + [
    "-".repeat(maxIDLAttrLength + 2),
    "-".repeat(maxAttrLength + 2),
    "-".repeat(icomment.length + 2)
].join("|") + "|");

for  (var idl in properties) {
    config = properties[idl];
    attr = config.attrName;

    if (!attr) {
        continue;
    }

    text.push("| " + [
        pad(idl, maxIDLAttrLength),
        pad(attr, maxAttrLength),
        pad(/^[-a-z0-9]+$/.test(attr) ? icomment : "", icomment.length)
    ].join(" | ") + " |");
}

var fs = require("fs");
var sysPath = require("path");
fs.writeFile(sysPath.join(__dirname, "..", "attributes.md"), text.join("\n"));

function pad(str, len) {
    if (str.length === len) {
        return str;
    }

    return str + " ".repeat(len - str.length);
}

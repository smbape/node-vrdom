var properties = require("./properties");

exports.properties = properties;

var attributes = {};
var attrName, propName;

// eslint-disable-next-line guard-for-in
for (propName in properties) {
    attrName = properties[propName].attrName;
    attributes[attrName] = propName;
}

exports.attributes = attributes;

exports.elements = require("./HTMLElements");
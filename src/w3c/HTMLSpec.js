var Interface = require("./Interface");

var DOMProperties = require("./DOMProperties");
var elements = require("./elements");
var interfaces = require("./interfaces");

var attributes = {};

initInterfaces(elements, interfaces, attributes, DOMProperties);

module.exports = { elements: elements, interfaces: interfaces, attributes: attributes };

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
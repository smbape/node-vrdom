var hasProp = Object.prototype.hasOwnProperty;
var push = Array.prototype.push;

module.exports = Interface;

function Interface(name, ifconfig, impls) {
    this.name = name;
    this.ifconfig = ifconfig;
    this.impls = impls;
}

Interface.prototype.has = function(key) {
    var interfaces = [this];
    var iface;
    while (interfaces.length) {
        iface = interfaces.pop();
        if (iface.ifconfig.properties && hasProp.call(iface.ifconfig.properties, key)) {
            return true;
        }

        push.apply(interfaces, iface.impls.slice().reverse());
    }

    return false;
};

// eslint-disable-next-line consistent-return
Interface.prototype.get = function(key) {
    var interfaces = [this];
    var iface;
    while (interfaces.length) {
        iface = interfaces.pop();
        if (iface.ifconfig.properties && hasProp.call(iface.ifconfig.properties, key)) {
            return iface.ifconfig.properties[key];
        }

        push.apply(interfaces, iface.impls.slice().reverse());
    }
};

Interface.prototype.set = function(key, value) {
    this.ifconfig.properties[key] = value;
    return value;
};

Interface.prototype.forEach = function(callback, context) {
    var interfaces = [this];
    var keys = {};
    var iface, properties, key, value;

    while (interfaces.length) {
        iface = interfaces.pop();
        properties = iface.ifconfig.properties;

        for (key in properties) {
            if (hasProp.call(properties, key) && !hasProp.call(keys, key)) {
                keys[key] = true;
                value = properties[key];
                callback.call(context, value, key);
            }
        }

        push.apply(interfaces, iface.impls.slice().reverse());
    }
};

Interface.prototype.toJSON = function() {
    var json = {};

    this.forEach(function(value, key) {
        json[key] = value;
    });

    return {
        name: this.name,
        properties: json
    };
};
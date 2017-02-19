var slice = Array.prototype.slice;

var dictionary = {
    en: require("./en")
};

var translations = dictionary.en;

// TODO : add more languages
// function setLng(lng) {
//     if (hasProp.call(dictionary, lng)) {
//         translations = dictionary[lng];
//     }
// }

function translate(code) {
    var args = slice.call(arguments, 1);
    var path = code.split(".");
    var template = translations;

    for (var i = 0, len = path.length; i < len && "object" === typeof template; i++) {
        template = template[path[i]];
    }

    if ("function" === typeof template) {
        return template.apply(undefined, args);
    }

    return null;
}

exports.dictionary = dictionary;
// exports.setLng = setLng;
exports.translate = translate;
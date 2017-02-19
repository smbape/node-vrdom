var hasProp = Object.prototype.hasOwnProperty;

// http://www.w3schools.com/tags/att_input_type.asp
var inputTypesWithEditableValue = {
    "color": true,
    "date": true,
    "datetime": true,
    "datetime-local": true,
    "email": true,
    "month": true,
    "number": true,
    "password": true,
    "range": true,
    "search": true,
    "tel": true,
    "text": true,
    "time": true,
    "url": true,
    "week": true
};

module.exports = function hasEditableValue(type, props) {
    switch (type) {
        case "textarea":
        case "select":
            return true;
        case "input":
            return props.type == null || hasProp.call(inputTypesWithEditableValue, props.type);
        default:
            return false;
    }
};
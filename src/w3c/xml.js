// https://www.w3.org/TR/REC-xml/#NT-XMLNameStartCharReg

var XMLNameStartCharReg = /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
var XMLNameCharReg = new RegExp("[" + XMLNameStartCharReg.source.slice(1, -1) + /-\.0-9\u00B7\u0300-\u036F\u203F-\u2040/.source + "]");
var XMLNameReg = new RegExp("^" + XMLNameStartCharReg.source + XMLNameCharReg.source + "*$");

exports.XMLNameStartCharReg = XMLNameStartCharReg;
exports.XMLNameCharReg = XMLNameCharReg;
exports.XMLNameReg = XMLNameReg;
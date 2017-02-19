// https://developer.mozilla.org/fr/docs/Web/API/Node/nodeType
var ELEMENT_NODE = 1; // Node.ELEMENT_NODE == 1
// var ATTRIBUTE_NODE = 2; // Node.ATTRIBUTE_NODE == 2
// var TEXT_NODE = 3; // Node.TEXT_NODE == 3
// var CDATA_SECTION_NODE = 4; // Node.CDATA_SECTION_NODE == 4
// var ENTITY_REFERENCE_NODE = 5; // Node.ENTITY_REFERENCE_NODE == 5
// var ENTITY_NODE = 6; // Node.ENTITY_NODE == 6
// var PROCESSING_INSTRUCTION_NODE = 7; // Node.PROCESSING_INSTRUCTION_NODE == 7
// var COMMENT_NODE = 8; // Node.COMMENT_NODE == 8
var DOCUMENT_NODE = 9; // Node.DOCUMENT_NODE == 9
// var DOCUMENT_TYPE_NODE = 10; // Node.DOCUMENT_TYPE_NODE == 10
var DOCUMENT_FRAGMENT_NODE = 11; // Node.DOCUMENT_FRAGMENT_NODE == 11
// var NOTATION_NODE = 12; // Node.NOTATION_NODE == 12

module.exports = function isValidContainer(node) {
    var ref;
    return node !== null && "object" === typeof node && ((ref = node.nodeType) === ELEMENT_NODE || ref === DOCUMENT_NODE || ref === DOCUMENT_FRAGMENT_NODE);
};
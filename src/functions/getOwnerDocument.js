module.exports = function getOwnerDocument(node) {
    // eslint-disable-next-line no-magic-numbers
    if (node == null || node.nodeType === 9) {
        return node;
    }

    return node.ownerDocument;
};
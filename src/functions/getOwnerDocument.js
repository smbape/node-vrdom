module.exports = function getOwnerDocument(node) {
    if (node == null)   {
        return;
    }

    if (node.nodeType === 9) {
        return node;
    }

    return node.ownerDocument;
};
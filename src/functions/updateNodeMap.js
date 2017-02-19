module.exports = function updateNodeMap(prevVNode, nextVNode, nextNode, nodeMap) {
    var prevKey, nextKey;

    if (prevVNode == null) {
        nextVNode.node = nextNode;
        nodeMap[nextVNode.key] = {
            vnode: nextVNode,
            node: nextNode
        };
        return;
    }

    prevKey = prevVNode.key;

    if (nextVNode == null) {
        delete nodeMap[prevKey].vnode;
        delete nodeMap[prevKey].node;
        delete nodeMap[prevKey];
        delete prevVNode.node;
        return;
    }

    nextKey = nextVNode.key;
    nextVNode.node = nextNode;

    nodeMap[nextKey].vnode = nextVNode;
    nodeMap[nextKey].node = nextNode;
};
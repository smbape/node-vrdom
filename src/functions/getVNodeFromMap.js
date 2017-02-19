var hasProp = Object.prototype.hasOwnProperty;

module.exports = function getVNodeFromMap(key, nodeMap) {
	return hasProp.call(nodeMap, key) ? nodeMap[key].vnode : null;
};

var __id = 0;

module.exports = function uniqueId(name) {
	++__id;
	return name + __id;
};
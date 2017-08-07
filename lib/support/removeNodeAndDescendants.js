var hasOwn = require("./../support/hasOwn");
var prefix = require("./../internal/reservedPrefix");
var removeNode = require("./../support/removeNode");

module.exports = function removeNodeAndDescendants(node, parent, key, lru, replacedPaths) {
    if (removeNode(node, parent, key, lru)) {
        if (node.$type !== undefined && replacedPaths && node.$_absolutePath) {
            replacedPaths.push(node.$_absolutePath);
        }

        if (node.$type == null) {
            for (var key2 in node) {
                if (key2[0] !== prefix && hasOwn(node, key2)) {
                    removeNodeAndDescendants(node[key2], node, key2, lru, replacedPaths);
                }
            }
        }
        return true;
    }
    return false;
};

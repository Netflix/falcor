var hasOwn = require("./../support/hasOwn");
var prefix = require("./../internal/reservedPrefix");
var removeNode = require("./../support/removeNode");

module.exports = function removeNodeAndDescendants(node, parent, key, lru, mergeContext) {
    if (removeNode(node, parent, key, lru)) {
        if (node.$type !== undefined && mergeContext && node.$_absolutePath) {
            mergeContext.hasInvalidatedResult = true;
        }

        if (node.$type == null) {
            for (var key2 in node) {
                if (key2[0] !== prefix && hasOwn(node, key2)) {
                    removeNodeAndDescendants(node[key2], node, key2, lru, mergeContext);
                }
            }
        }
        return true;
    }
    return false;
};

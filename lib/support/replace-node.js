var transferBackRefs = require("./../support/transfer-back-refs");
var invalidateNode = require("./../support/invalidate-node");

module.exports = function replaceNode(parent, node, replacement, key, lru) {
    if (node != null && node !== replacement && typeof node === "object") {
        transferBackRefs(node, replacement);
        invalidateNode(parent, node, key, lru);
    }
    parent[key] = replacement;
    return replacement;
};

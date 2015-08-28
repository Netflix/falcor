var isObject = require("./../support/isObject");
var transferBackReferences = require("./../support/transferBackReferences");
var removeNodeAndDescendants = require("./../support/removeNodeAndDescendants");

module.exports = function replaceNode(node, replacement, parent, key, lru) {
    if (node === replacement) {
        return node;
    } else if (isObject(node)) {
        transferBackReferences(node, replacement);
        removeNodeAndDescendants(node, parent, key, lru);
    }
    parent[key] = replacement;
    return replacement;
};

var $ref = require("./../types/ref");
var $expired = "expired";
var replaceNode = require("./../support/replace-node");
var graphNode = require("./../support/graph-node");
var updateBackRefs = require("./../support/update-back-refs");
var isPrimitive = require("./../support/is-primitive");
var isExpired = require("./../support/is-expired");

// TODO: comment about what happens if node is a branch vs leaf.
module.exports = function createBranch(roots, parent, nodeArg, typeArg, key) {

    var node = nodeArg;
    var type = typeArg;

    if (Boolean(type) && isExpired(roots, node)) {
        type = $expired;
    }

    if ((Boolean(type) && type !== $ref) || isPrimitive(node)) {
        node = replaceNode(parent, node, {}, key, roots.lru);
        node = graphNode(roots[0], parent, node, key, void 0);
        node = updateBackRefs(node, roots.version);
    }
    return node;
};

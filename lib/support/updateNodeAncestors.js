var removeNode = require("./../support/removeNode");
var updateBackReferenceVersions = require("./../support/updateBackReferenceVersions");

module.exports = function updateNodeAncestors(nodeArg, offset, lru, version) {
    var child = nodeArg;
    do {
        var node = child.ツparent;
        var size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(child, node, child.ツkey, lru);
        } else if (child.ツversion !== version) {
            updateBackReferenceVersions(child, version);
        }
        child = node;
    } while (child);
    return nodeArg;
};

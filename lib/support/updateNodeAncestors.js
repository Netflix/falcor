var __key = require("./../internal/key");
var __version = require("./../internal/version");
var __parent = require("./../internal/parent");
var removeNode = require("./../support/removeNode");
var updateBackReferenceVersions = require("./../support/updateBackReferenceVersions");

module.exports = function updateNodeAncestors(nodeArg, offset, lru, version) {
    var child = nodeArg;
    do {
        var node = child[__parent];
        var size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(child, node, child[__key], lru);
        } else if (child[__version] !== version) {
            updateBackReferenceVersions(child, version);
        }
        child = node;
    } while (child);
    return nodeArg;
};

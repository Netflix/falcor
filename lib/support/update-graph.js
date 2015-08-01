var __key = require("./../internal/key");
var __version = require("./../internal/version");
var __parent = require("./../internal/parent");
var removeNode = require("./../support/remove-node");
var updateBackRefs = require("./../support/update-back-refs");

module.exports = function updateGraph(nodeArg, offset, version, lru) {
    var node = nodeArg;
    var child = nodeArg;
    var size;
    while (child) {
        node = child[__parent];
        size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(node, child, child[__key], lru);
        } else if (child[__version] !== version) {
            updateBackRefs(child, version);
        }
        child = node;
    }
};

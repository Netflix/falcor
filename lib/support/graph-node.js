var __key = require("./../internal/key");
var __parent = require("./../internal/parent");
var __version = require("./../internal/version");

module.exports = function graphNode(root, parent, node, key, version) {
    node[__parent] = parent;
    node[__key] = key;
    node[__version] = version;
    return node;
};

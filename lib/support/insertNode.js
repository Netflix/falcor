var __key = require("./../internal/key");
var __parent = require("./../internal/parent");
var __version = require("./../internal/version");

module.exports = function insertNode(node, parent, key, version) {
    node[__key] = key;
    node[__parent] = parent;
    node[__version] = version;
    parent[key] = node;
    return node;
};

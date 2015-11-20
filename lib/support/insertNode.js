var __key = require("./../internal/key");
var __parent = require("./../internal/parent");
var __version = require("./../internal/version");

module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node[__key] = key;
    node[__parent] = parent;

    if (version !== undefined) {
        node[__version] = version;
    }
    if (!node.$absolutePath) {
        if (!optimizedPath) {
            debugger
        }
        node.$absolutePath = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};

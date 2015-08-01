var __ref = require("./../internal/ref");
var __parent = require("./../internal/parent");
var __version = require("./../internal/version");
var __refsLength = require("./../internal/refs-length");

module.exports = function updateBackRefs(node, version) {
    if (node && node[__version] !== version) {
        node[__version] = version;
        updateBackRefs(node[__parent], version);
        var i = -1,
            n = node[__refsLength] || 0;
        while (++i < n) {
            updateBackRefs(node[__ref + i], version);
        }
    }
    return node;
};

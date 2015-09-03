var __ref = require("./../internal/ref");
var __context = require("./../internal/context");
var __refIndex = require("./../internal/ref-index");
var __refsLength = require("./../internal/refs-length");

module.exports = function unlinkBackReferences(node) {
    var i = -1, n = node[__refsLength] || 0;
    while (++i < n) {
        var ref = node[__ref + i];
        if (ref != null) {
            ref[__context] = ref[__refIndex] = node[__ref + i] = void 0;
        }
    }
    node[__refsLength] = void 0;
    return node;
};

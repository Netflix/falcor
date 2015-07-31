var __ref = require("./../internal/ref");
var __context = require("./../internal/context");
var __refsLength = require("./../internal/refs-length");

module.exports = function transferBackReferences(node, dest) {
    var nodeRefsLength = node[__refsLength] || 0,
        destRefsLength = dest[__refsLength] || 0,
        i = -1,
        ref;
    while (++i < nodeRefsLength) {
        ref = node[__ref + i];
        if (ref !== void 0) {
            ref[__context] = dest;
            dest[__ref + (destRefsLength + i)] = ref;
            node[__ref + i] = void 0;
        }
    }
    dest[__refsLength] = nodeRefsLength + destRefsLength;
    node[__refsLength] = ref = void 0;
};

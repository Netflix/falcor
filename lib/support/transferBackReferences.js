var __ref = require("./../internal/ref");
var __context = require("./../internal/context");
var __refsLength = require("./../internal/refs-length");

module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode[__refsLength] || 0,
        destNodeRefsLength = destNode[__refsLength] || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[__ref + i];
        if (ref !== void 0) {
            ref[__context] = destNode;
            destNode[__ref + (destNodeRefsLength + i)] = ref;
            fromNode[__ref + i] = void 0;
        }
    }
    destNode[__refsLength] = fromNodeRefsLength + destNodeRefsLength;
    fromNode[__refsLength] = void 0;
    return destNode;
};
